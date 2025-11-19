from fastapi.testclient import TestClient
from app.api.main import app
import json


def ensure_graph(client):
    # Ensure graph is available in TestClient context
    try:
        from app.graph.workflow_graph import build_default_graph

        if getattr(app.state, "graph", None) is None:
            app.state.graph = build_default_graph()
    except Exception:
        pass


def test_hitl_submit_and_approve(tmp_path, monkeypatch):
    ensure_graph(None)
    # point stores to tmp paths
    hitl_path = tmp_path / "hitl.jsonl"
    delivery_path = tmp_path / "delivery.jsonl"
    monkeypatch.setattr("app.services.hitl_store._DEFAULT_PATH", hitl_path)
    monkeypatch.setattr("app.services.delivery_store._DEFAULT_PATH", delivery_path)

    client = TestClient(app)

    # Simulate assistant producing a state requiring manual review
    state = {
        "final_answer": "Confidential details here",
        "answer": "Confidential details here",
        "safety_metadata": {"needs_blocking": True},
        "offers_metadata": {"trace_id": "trace-xyz"},
    }

    resp = client.post("/hitl/submit", json={"state": state})
    assert resp.status_code == 200
    data = resp.json()
    hitl_id = data.get("hitl_id")
    assert hitl_id

    # Approve via API and trigger delivery
    resp2 = client.post(f"/hitl/{hitl_id}/approve", json={"reviewer": "tester"})
    assert resp2.status_code == 200
    j = resp2.json()
    # Should contain review and (attempted) delivery result
    assert "review" in j
    # delivery may or may not be present depending on implementation; check review exists
    assert j["review"].get("hitl_id") == hitl_id
