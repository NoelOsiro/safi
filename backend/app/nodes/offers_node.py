import logging
import uuid
from typing import Dict, Any
from app.config.segment_rules import SEGMENT_RULES
from app.config.offer_rules import OFFER_RULES
from app.services import inventory

logger = logging.getLogger("offers_node")
logging.basicConfig(level=logging.INFO)
try:
    from langsmith import traceable
except Exception:
    def traceable(func=None, **_kwargs):
        if func is None:
            def _decorator(f):
                return f
            return _decorator
        return func


def _score_offer_from_doc(doc: Dict[str, Any], segment: str) -> (float, list):
    """Heuristic scoring for offer candidacy based on doc metadata and segment.

    Returns a score; higher means more likely to be turned into an offer.
    """
    score = 0.0
    features = []
    try:
        price = float(doc.get("price", 0.0) or 0.0)
    except Exception:
        price = 0.0

    # prefer discounted items
    if doc.get("discount"):
        score += 2.0
        features.append("discount")
    # prefer larger absolute discounts when original_price present
    try:
        if doc.get("original_price") and price and float(doc.get("original_price")) > price:
            diff = float(doc.get("original_price")) - price
            inc = min(diff / max(1.0, price), 2.0)
            score += inc
            features.append("price_diff")
    except Exception:
        pass

    # segment heuristics
    if segment == "bargain_hunter":
        # discount-first
        if doc.get("discount"):
                score += 1.5
                features.append("segment_discount")
    if segment == "high_value":
        # prefer high-price items
        if price >= 100:
            score += 1.0
            features.append("high_price")
    if segment == "power_user":
        if doc.get("in_stock"):
            score += 0.5
            features.append("in_stock")

    # small brand diversity hint
    if doc.get("brand"):
        score += 0.1
        features.append("brand_present")

    return score, features


@traceable
def offers_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Create structured offer candidates from retrieval results and segment hints.

    Input expected in `state`:
      - `retrieved_docs`: List[Dict] (documents returned by retriever)
      - `segment`: str or dict (segment id or auditable segment object)
      - `customer_profile`: optional dict (for loyalty tiers)

    Output:
      - `offers`: list of offers (id, title, price, discount, brand, reason)
      - `offers_metadata`: summary keys (count, segment, generated_by)

    This node is intentionally lightweight and deterministic so it can be
    tested easily; later it can call a more advanced offer-optimizer service.
    """
    retrieved = state.get("retrieved_docs") or state.get("retrieved") or []
    seg_raw = state.get("segment") or "general"
    if isinstance(seg_raw, dict):
        segment = seg_raw.get("segment_id") or seg_raw.get("segment") or "general"
    else:
        segment = str(seg_raw)
    segment = (segment or "general").lower()

    profile = state.get("customer_profile") or {}
    tier = profile.get("tier") or profile.get("loyalty_tier") or "bronze"

    # consult SEGMENT_RULES for offer guidance if available
    seg_rule = SEGMENT_RULES.get(segment, SEGMENT_RULES.get("general", {}))
    offer_focus = seg_rule.get("offer_focus") or {}
    # merge OFFER_RULES (higher-level config) with any segment-local offer_focus
    offer_rule = OFFER_RULES.get(segment, {})
    # effective settings
    max_offers = int(offer_focus.get("max_offers") or offer_rule.get("max_offer_count") or 3)
    max_per_brand = int(offer_focus.get("max_per_brand") or offer_rule.get("max_per_brand") or 2)

    # Score documents and select top candidates
    scored = []
    for d in retrieved:
        s, feats = _score_offer_from_doc(d, segment)
        scored.append((s, d, feats))

    scored.sort(key=lambda x: x[0], reverse=True)

    offers = []
    seen_brands = {}
    # collect metadata helpers
    all_candidate_ids = [d.get("id") for (_s, d, _f) in scored]
    applied_boost_features = set()

    for score, doc, feats in scored:
        if len(offers) >= max_offers:
            break
        doc_id = doc.get("id")
        brand = (doc.get("brand") or "").strip()
        title = doc.get("title") or doc.get("text") or "Offer"
        try:
            price = float(doc.get("price")) if doc.get("price") is not None else None
        except Exception:
            price = None
        discount = bool(doc.get("discount") or (doc.get("original_price") and price is not None and float(doc.get("original_price")) > float(price)))

        # inventory / eligibility check
        in_stock = inventory.is_in_stock(doc_id)
        if not in_stock:
            # record that this candidate was excluded by inventory
            continue

        # enforce brand cap
        if brand:
            seen_count = seen_brands.get(brand, 0)
            if seen_count >= max_per_brand:
                continue

        reason_parts = []
        if discount:
            reason_parts.append("discount")
        if score >= 3.0:
            reason_parts.append("strong match")
        if tier and str(tier).lower() in ("gold", "platinum"):
            reason_parts.append("loyalty perk")

        # segment-specific labeling
        label = None
        if segment == "high_value":
            label = "exclusive"
        if segment == "bargain_hunter":
            label = "deal"

        offer = {
            "id": f"offer-{doc_id}",
            "product_id": doc_id,
            "title": title,
            "brand": brand,
            "price": price,
            "discount": discount,
            "label": label,
            "score": score,
            "reason": ", ".join(reason_parts) if reason_parts else "match",
            "boost_features": feats,
            "inventory_checked": True,
            "in_stock": in_stock,
        }

        offers.append(offer)
        if brand:
            seen_brands[brand] = seen_brands.get(brand, 0) + 1
        for f in feats:
            applied_boost_features.add(f)

    # Build explainability and metadata
    grounding_sources = [o.get("product_id") for o in offers]
    offer_rules_applied = list(offer_rule.keys()) if offer_rule else []
    trace_id = uuid.uuid4().hex

    offers_metadata = {
        "count": len(offers),
        "segment": segment,
        "generated_by": "offers_node_v1",
        "boost_features_used": sorted(list(applied_boost_features)) if applied_boost_features else [],
        "reranked_candidates": all_candidate_ids,
        "routing_hint_used": state.get("routing_hint") or (seg_raw.get("routing_hint") if isinstance(seg_raw, dict) else None),
        "offer_rules_applied": offer_rules_applied,
        "grounding_sources": grounding_sources,
        "trace_id": trace_id,
    }

    state_out = dict(state)
    state_out["offers"] = offers
    state_out["offers_metadata"] = offers_metadata
    return state_out
