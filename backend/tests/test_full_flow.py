from fastapi.testclient import TestClient
from app.api.main import app
import json


def ensure_graph():
    try:
        from app.graph.workflow_graph import build_default_graph
        if getattr(app.state, "graph", None) is None:
            app.state.graph = build_default_graph()
    except Exception:
        pass


def test_assistant_to_hitl_to_approve_and_delivery(tmp_path, monkeypatch):
    ensure_graph()
    # point DB paths to tmp files
    hitl_db = tmp_path / "hitl.db"
    delivery_db = tmp_path / "delivery.db"
    monkeypatch.setattr("app.services.hitl_store._DEFAULT_PATH", hitl_db)
    monkeypatch.setattr("app.services.delivery_store._DEFAULT_PATH", delivery_db)

    client = TestClient(app)

    # Provide a state that bypasses segmentation and sets a high-risk segment
    state = {
        "bypass_segmentation": True,
        "segment": "sensitive",
        "routing_hint": "require_manual_review",
        "customer_profile": {"preferred_category": "electronics"},
    }

    resp = client.post("/assistant", json={"state": state})
    assert resp.status_code == 200
    j = resp.json()
    full = j.get("full_state")

    # Create a HITL review explicitly from the assistant state (covers cases
    # where the pipeline did not auto-create one). This exercises the
    # /hitl/submit -> /hitl/{id}/approve -> delivery integration.
    resp_submit = client.post("/hitl/submit", json={"state": full})
    assert resp_submit.status_code == 200
    submitted = resp_submit.json()
    hitl_id = submitted.get("hitl_id")
    assert hitl_id

    # Approve via API and observe delivery result
    resp2 = client.post(f"/hitl/{hitl_id}/approve", json={"reviewer": "tester"})
    assert resp2.status_code == 200
    j2 = resp2.json()
    assert "review" in j2
    # delivery should be present and indicate delivered
    assert ("delivery" in j2) and (j2["delivery"].get("status") == "delivered")
