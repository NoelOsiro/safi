import pytest

from app.nodes.safety_node import safety_node


def test_redact_email():
    state = {"answer": "Contact us at user@example.com for support."}
    out = safety_node(state)
    assert "[REDACTED_EMAIL]" in out.get("final_answer")
    assert "redacted_email" in out.get("safety_metadata", {}).get("flags", [])


def test_pricing_claim_sanitized():
    state = {"answer": "Only 3 left at this price — buy now!"}
    out = safety_node(state)
    # numeric availability should be replaced and disclaimer appended
    assert "availability may vary" in out.get("final_answer")
    flags = out.get("safety_metadata", {}).get("flags", [])
    assert "pricing_claim" in flags or "hallucinated_inventory" in flags


def test_hallucinated_inventory_flag():
    state = {"answer": "Hurry, only 2 left in stock!", "offers": [], "retrieved_docs": []}
    out = safety_node(state)
    flags = out.get("safety_metadata", {}).get("flags", [])
    # Should flag hallucinated inventory (no inventory info in offers/retrieved)
    assert any(f in flags for f in ("hallucinated_inventory", "pricing_claim"))


def test_trace_id_propagation():
    state = {"answer": "Great deal.", "offers_metadata": {"trace_id": "abc123"}}
    out = safety_node(state)
    assert out.get("safety_metadata", {}).get("trace_id") == "abc123"
import json
from app.state.workflow_state import new_workflow_state


class DummyResp:
    def __init__(self, content: str):
        self.content = content


class DummyModel:
    def __init__(self, response_text: str):
        self._response_text = response_text

    def invoke(self, messages):
        return DummyResp(self._response_text)


def test_safety_node_safe(monkeypatch):
    from app.nodes.safety_node import safety_node

    safe_json = json.dumps({
        "contains_pii": False,
        "contains_hate": False,
        "contains_self_harm": False,
        "contains_violence": False,
        "contains_toxic_language": False,
        "is_hallucination": False,
        "needs_blocking": False,
        "explanation": "Text is safe",
    })

    monkeypatch.setattr("app.nodes.safety_node._load_safety_model", lambda: DummyModel(safe_json))

    s = new_workflow_state()
    s["user"] = {"message": "Hi"}
    s["retrieval_context"] = "ctx"
    s["answer"] = "A safe answer"

    out = safety_node(s)
    assert "safety_metadata" in out
    assert out["safety_metadata"]["needs_blocking"] is False


def test_safety_node_block(monkeypatch):
    from app.nodes.safety_node import safety_node

    block_json = json.dumps({
        "contains_pii": True,
        "contains_hate": False,
        "contains_self_harm": False,
        "contains_violence": False,
        "contains_toxic_language": False,
        "is_hallucination": False,
        "needs_blocking": True,
        "explanation": "Contains PII",
    })

    monkeypatch.setattr("app.nodes.safety_node._load_safety_model", lambda: DummyModel(block_json))

    s = new_workflow_state()
    s["user"] = {"message": "Hi"}
    s["retrieval_context"] = "ctx"
    s["answer"] = "A secret answer with PII"

    out = safety_node(s)
    assert "safety_metadata" in out
    assert out["safety_metadata"]["needs_blocking"] is True
    assert "answer" in out and "cannot provide" in out["answer"]
