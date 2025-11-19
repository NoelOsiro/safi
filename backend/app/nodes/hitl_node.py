import logging
from typing import Dict, Any

from app.services.hitl_store import create_review

logger = logging.getLogger("hitl_node")


HIGH_RISK_SEGMENTS = {"sensitive", "high_value", "legal_review"}


def hitl_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Human-in-the-loop node.

    Decides whether a workflow state requires manual review and, if so,
    persists a pending review and short-circuits the workflow by marking
    the state as pending.
    """
    try:
        if not isinstance(state, dict):
            return state

        # conditions for requiring manual review
        routing_hint = None
        try:
            routing_hint = state.get("routing_hint") or (state.get("segment") and (state.get("segment").get("routing_hint") if isinstance(state.get("segment"), dict) else None))
        except Exception:
            routing_hint = None

        safety_needs_block = False
        try:
            safety_needs_block = bool(state.get("safety_metadata", {}).get("needs_blocking", False))
        except Exception:
            safety_needs_block = False

        segment = state.get("segment")
        seg_name = segment if isinstance(segment, str) else (segment.get("segment_id") if isinstance(segment, dict) else None)

        require_manual = False
        if routing_hint == "require_manual_review":
            require_manual = True
        if safety_needs_block:
            require_manual = True
        if seg_name in HIGH_RISK_SEGMENTS:
            require_manual = True

        if not require_manual:
            # pass-through
            return state

        # Build review payload
        payload = {
            "trace_id": (state.get("offers_metadata") or {}).get("trace_id") or (state.get("model_metadata") or {}).get("trace_id"),
            "final_answer": state.get("final_answer") or state.get("answer"),
            "safety_metadata": state.get("safety_metadata"),
            "full_state": state,
        }
        hitl_id = create_review(payload)
        out = dict(state)
        out["status"] = "pending_review"
        out["hitl_id"] = hitl_id
        out["hitl_metadata"] = {"hitl_id": hitl_id, "created": True}
        logger.info("Created HITL review %s for trace %s", hitl_id, payload.get("trace_id"))
        return out
    except Exception:
        logger.exception("hitl_node: unexpected error")
        return state
