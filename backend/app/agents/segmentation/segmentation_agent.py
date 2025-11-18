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

from typing import Dict, Any, Union
import logging

from app.config.settings import settings

LOGGER = logging.getLogger(__name__)


def _build_output(segment_id: str, reason: str, confidence: float, rule_id: str) -> Dict[str, Any]:
    out = {
        "segment_id": segment_id,
        "trigger_reason": reason,
        "segmenter_confidence": confidence,
        "segmenter_version": settings.SEGMENTER_VERSION,
        "rule_applied": rule_id,
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

