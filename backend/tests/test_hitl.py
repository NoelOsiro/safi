from app.nodes.hitl_node import hitl_node
from app.services.hitl_store import _DEFAULT_PATH, get_review
import os
import json


def test_hitl_creates_review(tmp_path, monkeypatch):
    # point store to tmp file
    p = tmp_path / "hitl.jsonl"
    monkeypatch.setattr("app.services.hitl_store._DEFAULT_PATH", p)
    state = {
        "answer": "This is a sensitive output",
        "final_answer": "This is a sensitive output",
        "safety_metadata": {"needs_blocking": True},
        "offers_metadata": {"trace_id": "t-123"},
    }
    out = hitl_node(state)
    assert out.get("status") == "pending_review"
    hitl_id = out.get("hitl_id")
    assert hitl_id is not None
    rec = get_review(hitl_id)
    assert rec is not None
    assert rec.get("trace_id") == "t-123"
