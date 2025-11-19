import logging
from typing import Dict, Any
from datetime import datetime

from app.services.delivery_store import create_event

logger = logging.getLogger("delivery_node")


def delivery_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Simulated delivery node: formats and records a delivery event.

    For now this is a simulated dispatcher that persists a delivery
    event to `data/delivery_events.jsonl` for observability.
    """
    try:
        if not isinstance(state, dict):
            return state

        final = state.get("final_answer") or state.get("answer") or ""
        hitl_id = state.get("hitl_id")
        trace_id = (state.get("offers_metadata") or {}).get("trace_id") or (state.get("model_metadata") or {}).get("trace_id")

        event = {
            "hitl_id": hitl_id,
            "trace_id": trace_id,
            "delivered_at": datetime.utcnow().isoformat() + "Z",
            "channel": "chat",
            "message": final,
        }
        create_event(event)
        out = dict(state)
        out["delivery_metadata"] = {"delivered": True, "channel": "chat", "delivered_at": event["delivered_at"]}
        out["status"] = "delivered"
        logger.info("Delivered hitl=%s trace=%s", hitl_id, trace_id)
        return out
    except Exception:
        logger.exception("delivery_node: unexpected error")
        return state
class DeliveryNode:
    """Placeholder delivery node."""

    def process(self, payload):
        raise NotImplementedError("Delivery logic not implemented")
