from langsmith import traceable
from app.state.workflow_state import WorkflowState
from typing import Dict, Any, List
import logging

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

    if not query:
        user = state.get("user") or {}
        query = (user.get("message") if isinstance(user, dict) else None) or ""

    if not query:
        logger.info("retrieval_node: no query available (empty segment and user message)")
        new_state = dict(state)
        new_state["retrieved_docs"] = []
        return new_state

    retriever = _get_retriever()

    # perform retrieval; guard against Retriever exceptions
    try:
        docs = retriever.get_grounding_content(query, top_k=3) or []
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
    context = "\n\n".join(context_texts)

    # Log retrieval result for observability
    rule = seg.get("rule_applied") if isinstance(seg, dict) else seg
    logger.info("retrieval_node: query='%s' matched_segment='%s' results=%s", query, rule, [r.get("id") for r in normalized])

    new_state = dict(state)
    new_state["retrieved_docs"] = normalized
    new_state["context"] = context
    return new_state
