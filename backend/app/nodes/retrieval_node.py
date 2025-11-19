from langsmith import traceable
from app.state.workflow_state import WorkflowState
from typing import Dict, Any, List
import logging
from app.config.segment_rules import SEGMENT_RULES

# Lazy import of Retriever to avoid heavy startup work until node runs
_retriever = None

logger = logging.getLogger(__name__)


def _get_retriever():
    global _retriever
    if _retriever is None:
        try:
            from app.services.retriever import Retriever
        except Exception as e:
            logger.exception("Failed to import Retriever service: %s", e)
            raise
        # Instantiate with default data path (configurable via env)
        _retriever = Retriever()
    return _retriever


@traceable
def retrieval_node(state: WorkflowState) -> WorkflowState:
    """Retrieval node for RAG/grounding.

    Behavior:
    - Read `segment` from workflow state. `segment` may be a dict produced by
      the segmenter or a simple label string. If absent, fall back to the
      user's message (`state['user']['message']`).
    - Build a retrieval query from the segment and/or user text.
    - Use `Retriever.get_grounding_content` to fetch top documents.
    - Merge `retrieved_docs` into the returned workflow state.
    """
    # Ensure state is a dict-like mapping
    if not isinstance(state, dict):
        logger.warning("retrieval_node: expected dict-like state; got %s", type(state))
        return state

    # determine query: prefer structured segment info
    query = None
    seg = state.get("segment")
    if isinstance(seg, dict):
        # try common keys
        query = seg.get("segment_id") or seg.get("trigger_reason")
    elif isinstance(seg, str):
        query = seg

    # If the segment is a controlled label (e.g. 'frequent_browser') it's
    # often not useful as a raw TF-IDF query. Prefer the user's free-text
    # message when the segment looks like a machine label (underscores or
    # single-token identifiers) and a user message exists.
    user = state.get("user") or {}
    user_msg = (user.get("message") if isinstance(user, dict) else None) or ""
    if isinstance(query, str) and user_msg:
        is_label_like = ("_" in query) or (" " not in query and query.islower())
        if is_label_like:
            logger.info(
                "retrieval_node: segment '%s' looks like a label; using user message for retrieval",
                query,
            )
            query = user_msg

    if not query:
        user = state.get("user") or {}
        query = (user.get("message") if isinstance(user, dict) else None) or ""

    if not query:
        logger.info("retrieval_node: no query available (empty segment and user message)")
        new_state = dict(state)
        new_state["retrieved_docs"] = []
        return new_state

    retriever = _get_retriever()

    # Augment query with segment-specific retrieval hints (deals, premium, curated)
    seg_label = None
    if isinstance(seg, dict):
        seg_label = (seg.get("segment_id") or seg.get("segment") or "general").lower()
    elif isinstance(seg, str):
        seg_label = seg.lower()
    else:
        seg_label = "general"

    rule = SEGMENT_RULES.get(seg_label, SEGMENT_RULES.get("general", {}))
    modifiers: List[str] = []
    pf = rule.get("product_focus", "")
    must = [m.lower() for m in rule.get("must_include", [])]
    # Simple heuristics to steer retrieval queries
    if "discount" in pf or "discount" in " ".join(must) or "price drop" in pf:
        modifiers.append("deals OR discounts")
    if "premium" in pf or "high-end" in pf or "frequently purchased" in pf:
        modifiers.append("premium OR featured")
    if "curated" in pf or "curated picks" in " ".join(must):
        modifiers.append("curated picks")

    if modifiers:
        query = f"{query} " + " ".join(modifiers)

    # Build filter parameters from state and persona rules
    category = None
    price_range = None
    tags = None
    persona_signals = {}

    profile = state.get("customer_profile") or {}
    if profile.get("preferred_category"):
        category = profile.get("preferred_category")
    # price_range can be provided as a tuple in profile (min_price, max_price)
    if profile.get("budget_min") is not None or profile.get("budget_max") is not None:
        try:
            low = float(profile.get("budget_min")) if profile.get("budget_min") is not None else None
            high = float(profile.get("budget_max")) if profile.get("budget_max") is not None else None
            price_range = (low, high)
        except Exception:
            price_range = None
    if profile.get("wishlist"):
        tags = profile.get("wishlist")

    # persona signals: brands, wants_discount, recent_days
    brands = profile.get("favorite_brands") or profile.get("preferred_brands") or []
    if brands:
        persona_signals["brands"] = brands
    if "discount" in pf or "discounts" in must or seg_label == "bargain_hunter":
        persona_signals["wants_discount"] = True
    # recent purchasers may prefer recent content
    if seg_label == "recent_purchaser":
        persona_signals["recent_days"] = 30

    # perform retrieval; guard against Retriever exceptions
    try:
        # Prefer the extended signature; some test doubles may not accept the
        # new keywords, so fall back to the positional-only call if needed.
        try:
            docs = retriever.get_grounding_content(
                query, top_k=3, category=category, price_range=price_range, tags=tags, persona_signals=persona_signals
            ) or []
        except TypeError:
            docs = retriever.get_grounding_content(query, 3) or []
        # If the retriever returned no results but has a loaded corpus, fall
        # back to a lightweight substring/keyword match so smoke tests and
        # dev runs still get grounding content. This keeps behavior predictable
        # without forcing TF-IDF/FAISS changes.
        if not docs:
            try:
                docs = []
                q_terms = [t.lower() for t in query.replace("?", " ").split() if len(t) > 2]
                if q_terms and getattr(retriever, "documents", None):
                    for d in retriever.documents:
                        title = (d.get("title") or "").lower()
                        text = (d.get("text") or "").lower()
                        category = (d.get("category") or "").lower()
                        brand = (d.get("brand") or "").lower()
                        tags = " ".join([t.lower() for t in (d.get("tags") or [])])
                        combined = " ".join([title, text, category, brand, tags])
                        score = 0
                        for t in q_terms:
                            # simple plural handling: match singular/plural
                            variants = {t, t.rstrip('s')}
                            if any(v in combined for v in variants):
                                score += 1
                        if score > 0:
                            docs.append({"id": d.get("id"), "title": d.get("title"), "text": d.get("text"), "source": d.get("source"), "score": float(score)})
                    # sort by score desc and limit to top_k
                    docs = sorted(docs, key=lambda x: x.get("score", 0), reverse=True)[:3]
            except Exception:
                # keep silent; we'll return an empty list below
                docs = docs or []
    except Exception as e:
        logger.exception("retrieval_node: retriever failed: %s", e)
        docs = []

    # Normalize documents to a simple structure for downstream
    normalized: List[Dict[str, Any]] = []
    for d in docs:
        normalized.append({
            "id": d.get("id"),
            "title": d.get("title"),
            "text": d.get("text"),
            "source": d.get("source"),
            "score": d.get("score"),
        })

    # Build a concatenated context for generation (join texts with separation)
    context_texts = [str(d.get("text", "")) for d in normalized if d.get("text")]
    retrieval_context = "\n\n".join(context_texts)

    # Log retrieval result for observability
    rule = seg.get("rule_applied") if isinstance(seg, dict) else seg
    logger.info("retrieval_node: query='%s' matched_segment='%s' results=%s", query, rule, [r.get("id") for r in normalized])

    new_state = dict(state)
    new_state["retrieved_docs"] = normalized
    new_state["retrieval_context"] = retrieval_context
    return new_state
