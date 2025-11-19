from app.nodes.hitl_node import hitl_node
from app.services.hitl_store import _DEFAULT_PATH, get_review, approve_review
from app.nodes.delivery_node import delivery_node
from app.services.delivery_store import get_event
import json


def test_delivery_on_approve(tmp_path, monkeypatch):
    p = tmp_path / "hitl.jsonl"
    monkeypatch.setattr("app.services.hitl_store._DEFAULT_PATH", p)
    # ensure delivery store goes to tmp path as well
    dp = tmp_path / "delivery.jsonl"
    monkeypatch.setattr("app.services.delivery_store._DEFAULT_PATH", dp)

    state = {
        "answer": "Please see confidential details",
        "final_answer": "Please see confidential details",
        "safety_metadata": {"needs_blocking": True},
        "offers_metadata": {"trace_id": "t-456"},
    }
    out = hitl_node(state)
    assert out["status"] == "pending_review"
    hitl_id = out["hitl_id"]
    rec = get_review(hitl_id)
    assert rec is not None

    # Approve and deliver
    updated = approve_review(hitl_id, "tester", modified_text="Edited safe message")
    assert updated is not None

    # Build state for delivery from updated review
    s = updated.get("full_state")
    s = dict(s)
    s["final_answer"] = updated.get("modified_text")
    s["answer"] = updated.get("modified_text")
    # Ensure delivery node receives the hitl_id for audit linking
    s["hitl_id"] = hitl_id

    delivered = delivery_node(s)
    assert delivered.get("status") == "delivered"
    ev = get_event(hitl_id)
    assert ev is not None
    assert ev.get("message") == "Edited safe message"
