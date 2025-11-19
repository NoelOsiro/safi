"""Agent: segmenter (retail store / checkout context)

Rule-based, auditable segmenter focused on retail store interactions and
checkout/form events. It maps an incoming `event: dict` to a controlled
vocabulary of segments suitable for downstream retrieval, safety and
analytics.

The implementation prefers structured signals (e.g., `event_name`,
`page_url`, `step`, `time_spent`) and falls back to lightweight keyword
analysis on `text` when required. Keep this small and auditable; swap
in an ML classifier later if needed.
"""

from typing import Dict, Any, Union, Tuple
import logging

from app.config.settings import settings

LOGGER = logging.getLogger(__name__)


def _safe_get(d: Dict[str, Any], key: str, default=0):
    v = d.get(key, default)
    try:
        return float(v)
    except Exception:
        return default


def _normalize_score(val: float, max_val: float = 1.0) -> float:
    """Clamp and normalize to 0..1 scale. Avoid division by zero."""
    if max_val <= 0:
        return 0.0
    return max(0.0, min(1.0, val / max_val))


def _derive_behavior_summary(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Given a customer_profile or behavior_events dict, produce normalized signals:
    - views_last_7d, cart_events_last_7d, purchases_last_30d, avg_order_value,
      last_purchase_days_ago, conversion_rate, cart_abandon_rate
    """
    # expected fields: profile may contain pre-aggregated metrics or raw events.
    # We'll look for pre-aggregates first (common in CDP).
    bs = {}

    # common field names that might exist
    views = profile.get("views_last_7d") or profile.get("views_7d") or profile.get("view_count_7d") or 0
    cart_events = profile.get("cart_events_last_7d") or profile.get("cart_events_7d") or profile.get("adds_to_cart_7d") or 0
    purchases = profile.get("purchases_last_30d") or profile.get("purchases_30d") or profile.get("orders_30d") or 0
    aov = profile.get("avg_order_value") or profile.get("aov") or profile.get("average_order_value") or 0.0
    last_purchase_days = profile.get("last_purchase_days_ago")  # may be None

    # fallback: if a profile includes event list, we could compute counts (not implemented here)
    # Normalize types
    try:
        views = int(views)
    except Exception:
        views = 0
    try:
        cart_events = int(cart_events)
    except Exception:
        cart_events = 0
    try:
        purchases = int(purchases)
    except Exception:
        purchases = 0
    try:
        aov = float(aov)
    except Exception:
        aov = 0.0
    try:
        last_purchase_days = int(last_purchase_days) if last_purchase_days is not None else None
    except Exception:
        last_purchase_days = None

    bs["views_last_7d"] = views
    bs["cart_events_last_7d"] = cart_events
    bs["purchases_last_30d"] = purchases
    bs["avg_order_value"] = aov
    bs["last_purchase_days_ago"] = last_purchase_days

    # Additional derived signals to support new persona segments
    # discount_view_rate: fraction of views that were on discount pages
    discount_views = profile.get("discount_view_events") or profile.get("discount_views_last_30d") or 0
    try:
        discount_views = int(discount_views)
    except Exception:
        discount_views = 0
    bs["discount_view_rate"] = float(discount_views) / max(views, 1)

    # category affinity: how repetitive are categories in recent views
    recent_categories = profile.get("categories_last_10_views") or []
    try:
        repeat_cat_ratio = len(set(recent_categories)) / max(len(recent_categories), 1)
    except Exception:
        repeat_cat_ratio = 0.0
    # invert ratio so higher means more repetition of the same category (0..1)
    bs["repeat_category_ratio"] = 1.0 - repeat_cat_ratio

    # engagement score: simple additive heuristic combining views and cart events
    bs["engagement_score"] = float(views + cart_events)

    # pages_per_session if available (helps identify power users)
    pps = profile.get("pages_per_session") or profile.get("pages_per_session_avg") or 0
    try:
        pps = float(pps)
    except Exception:
        pps = 0.0
    bs["pages_per_session"] = pps

    # Derived rates
    conversion_rate = 0.0
    if views > 0:
        conversion_rate = purchases / (views if views else 1)
    bs["conversion_rate"] = float(conversion_rate)
    cart_abandon_rate = 0.0
    if cart_events > 0:
        # simplistic: proportion of cart events that did NOT convert to purchase in 30d window
        cart_abandon_rate = max(0.0, 1.0 - (purchases / (cart_events if cart_events else 1)))
    bs["cart_abandon_rate"] = float(cart_abandon_rate)

    # Basic RFM-ish scores (0..1 normalized heuristics)
    # These thresholds are tunable. We pick reasonable defaults.
    bs["recency_score"] = 1.0 if (last_purchase_days is not None and last_purchase_days <= 7) else (
        0.8 if last_purchase_days is not None and last_purchase_days <= 30 else (0.4 if last_purchase_days is not None else 0.0)
    )
    # frequency: purchases per 30d normalized; assume >3 is strong
    bs["frequency_score"] = _normalize_score(purchases, max_val=3.0)
    # monetary: scale aov relative to a configurable baseline; default baseline = 100
    baseline_aov = 100.0
    bs["monetary_score"] = _normalize_score(aov, max_val=baseline_aov)

    # Ensure conversion_rate is present as a normalized metric
    bs["conversion_rate_norm"] = _normalize_score(bs.get("conversion_rate", 0.0), max_val=1.0)

    return bs


def _decide_segment(behavior: Dict[str, Any], profile: Dict[str, Any]) -> Tuple[str, Dict[str, float], str]:
    """
    Decide a discrete segment label plus scores and a short reason string.
    Returns (segment_label, scores_dict, reason)
    """

    views = behavior.get("views_last_7d", 0)
    cart_events = behavior.get("cart_events_last_7d", 0)
    purchases = behavior.get("purchases_last_30d", 0)
    cart_abandon_rate = behavior.get("cart_abandon_rate", 0.0)
    recency = behavior.get("recency_score", 0.0)
    frequency = behavior.get("frequency_score", 0.0)
    monetary = behavior.get("monetary_score", 0.0)
    discount_view_rate = behavior.get("discount_view_rate", 0.0)
    repeat_category_ratio = behavior.get("repeat_category_ratio", 0.0)
    engagement_score = behavior.get("engagement_score", 0.0)
    pages_per_session = behavior.get("pages_per_session", 0.0)
    conversion_rate_norm = behavior.get("conversion_rate_norm", 0.0)

    scores = {
        "recency": float(recency),
        "frequency": float(frequency),
        "monetary": float(monetary),
        "cart_abandon_rate": float(cart_abandon_rate),
        "discount_view_rate": float(discount_view_rate),
        "repeat_category_ratio": float(repeat_category_ratio),
        "engagement_score": float(engagement_score),
        "pages_per_session": float(pages_per_session),
        "conversion_rate_norm": float(conversion_rate_norm),
    }

    # Priority rules (ordered)
    # 1. High value customers (monetary + frequency high)
    if monetary >= settings.SEGMENT_THRESHOLD_MONETARY_HIGH and frequency >= settings.SEGMENT_THRESHOLD_FREQUENCY_HIGH:
        return "high_value", scores, "High avg order value and frequent purchases"

    # 2. Loyalist: strong recency and frequency
    if recency >= settings.SEGMENT_THRESHOLD_RECENCY_HIGH and frequency >= settings.SEGMENT_THRESHOLD_FREQUENCY_LOYAL:
        return "loyalist", scores, "High repeat purchase activity with strong recency"

    # 3. Power user: heavy engagement and deep sessions (relaxed conversion requirement)
    if engagement_score >= settings.SEGMENT_THRESHOLD_ENGAGEMENT_POWER and pages_per_session >= settings.SEGMENT_THRESHOLD_PPS_POWER and conversion_rate_norm >= settings.SEGMENT_THRESHOLD_CONV_NORM_POWER:
        return "power_user", scores, "High engagement and efficient conversion"

    # Bargain Hunter: views focused on discounts and price-sensitive behavior
    # Place before generic cart-abandoner so discount-focused behavior is captured
    if discount_view_rate > settings.SEGMENT_THRESHOLD_DISCOUNT_VIEW_RATE and cart_abandon_rate > settings.SEGMENT_THRESHOLD_CART_ABANDON_BARGAIN:
        return "bargain_hunter", scores, "Frequent discount page views with price-sensitive abandonment"

    # Cart abandoner
    if cart_events >= settings.SEGMENT_THRESHOLD_CART_EVENTS_FOR_ABANDON and cart_abandon_rate >= settings.SEGMENT_THRESHOLD_CART_ABANDONER_RATE:
        return "cart_abandoner", scores, "Multiple cart events with high abandon rate"

    # 3. Frequent browser (many views but low purchases)
    if views >= settings.SEGMENT_THRESHOLD_VIEWS_FREQUENT and purchases == 0:
        return "frequent_browser", scores, "Many views but no purchases"

    # 4. Recent purchaser
    if purchases >= 1 and recency >= 0.8:
        return "recent_purchaser", scores, "Recent purchase within last 30 days"

    # 5. One-time buyer (has purchases but low frequency)
    if purchases >= 1 and frequency < 0.5:
        return "one_time_buyer", scores, "Has purchased previously but low purchase frequency"

    # 6. Churn risk (no purchases and low activity but used to have purchases long ago)
    last_purchase_days = profile.get("last_purchase_days_ago") or behavior.get("last_purchase_days_ago")
    if last_purchase_days and last_purchase_days > 90 and purchases == 0:
        return "churn_risk", scores, "No recent purchases and long time since last purchase"

    # 7. New user (very low activity)
    if views <= settings.SEGMENT_THRESHOLD_VIEWS_NEW and purchases == 0 and cart_events == 0:
        return "new_user", scores, "Very little historical activity"

    # Default: general
    return "general", scores, "Default catch-all segment"

def _build_output(segment_id: str, reason: str, confidence: float, rule_id: str) -> Dict[str, Any]:
    out = {
        "segment_id": segment_id,
        "trigger_reason": reason,
        "segmenter_confidence": confidence,
        "segmenter_version": settings.SEGMENTER_VERSION,
        "rule_applied": rule_id,
        # Optional routing hint to make LangGraph routing cheaper downstream
        "routing_hint": _get_routing_hint(segment_id),
    }
    LOGGER.info("Segmentation matched: %s (%s) via %s", segment_id, reason, rule_id)
    return out


def classify_customer_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """Classify an incoming event into a named segment appropriate for
    retail store / checkout scenarios. Uses central settings for
    configurable keywords and paths.
    """
    # Normalize inputs
    evt_name = (event.get("event_name") or "").lower()
    page_url = (event.get("page_url") or "").lower()
    step = (event.get("step") or "").lower()
    text = (event.get("text") or "").lower()
    time_spent = None
    try:
        time_spent = float(event.get("time_spent")) if event.get("time_spent") is not None else None
    except Exception:
        time_spent = None

    # Priority-ordered rule checks (explicit signals first)
    if evt_name in ("checkout_abandoned", "form_abandoned") and step in ("checkout_step_3", "checkout_step_4", "final"):
        return _build_output(
            "High-Intent/AbandonedCheckout",
            f"Checkout abandoned at {step}.",
            0.95,
            "rule_checkout_abandoned_late_step",
        )

    # Rule: Product page view without purchase -> interested
    product_paths = settings.SEGMENTER_PRODUCT_PATHS
    if evt_name in ("page_view", "link_click") and (any(p in page_url for p in product_paths) or "product" in text):
        if time_spent is not None and time_spent < 5:
            conf = 0.6
            seg = "Interested/NoPurchase"
            reason = "Viewed product page briefly without purchase."
        else:
            conf = 0.85
            seg = "Interested/NoPurchase"
            reason = "Viewed product page without purchase."

        return _build_output(seg, reason, conf, "rule_product_page_no_purchase")

    # Rule: user downloaded a receipt or asset -> explicit purchase-related signal
    if evt_name == "download" and ("receipt" in (event.get("asset_name") or "").lower() or "receipt" in text):
        return _build_output(
            "Purchase/ReceiptDownload",
            "Downloaded receipt/transaction record.",
            0.85,
            "rule_receipt_download",
        )

    # Rule: explicit payment-related intents from structured events
    if evt_name in ("payment_attempt", "payment_query"):
        return _build_output(
            "Payment/InstallmentIntent",
            "Structured payment-related event.",
            0.9,
            "rule_structured_payment_event",
        )

    # Textual heuristics (configurable via settings)
    payment_keywords = settings.SEGMENTER_KEYWORDS.get("payment", [])
    support_keywords = settings.SEGMENTER_KEYWORDS.get("support", [])

    if any(k in text for k in payment_keywords):
        return _build_output(
            "Payment/InstallmentIntent",
            "Detected payment-related keywords in text.",
            0.75,
            "rule_keyword_payment_fallback",
        )

    if any(k in text for k in support_keywords):
        return _build_output(
            "General/SupportInquiry",
            "Detected support-related keywords in text.",
            0.65,
            "rule_keyword_support_fallback",
        )

    # Default fallback
    LOGGER.debug("No specific rule matched for event: %s", event)
    return _build_output(
        "General",
        "Fallback: no specific rule matched.",
        0.5,
        "rule_fallback",
    )



class SegmentationAgent:
    """Adapter providing a `run()` method that accepts either a free-text
    message or a structured event dict and returns the structured
    segmentation result.
    """

    def run(self, message_or_event: Union[str, Dict[str, Any]]) -> Dict[str, Any]:
        if isinstance(message_or_event, str):
            event = {"text": message_or_event}
        else:
            event = message_or_event
        return classify_customer_event(event)


def _get_routing_hint(segment_id: str) -> str:
    """Map canonical segment ids to lightweight routing pathway hints.

    These hint keys are intentionally coarse-grained and stable. They
    help the graph router short-circuit expensive routing logic when
    available.
    """
    mapping = {
        # High-value pathway
        "high_value": "high_value_path",
        "loyalist": "high_value_path",
        "power_user": "high_value_path",

        # Offer pathway
        "cart_abandoner": "offer_path",
        "bargain_hunter": "offer_path",

        # Inspiration / browse
        "frequent_browser": "inspiration_path",
        "window_shopper": "inspiration_path",

        # Reactivation / win-back
        "churn_risk": "reactivation_path",
        "dormant": "reactivation_path",

        # Default
        "general": "default_path",
        "new_user": "default_path",
    }
    return mapping.get(segment_id, "default_path")

