import pytest

from app.nodes import generation_node as gen_mod


def test_template_fallback():
    state = {
        "user": {"message": "Any deals?"},
        "segment": "frequent_browser",
        "behavior_summary": {"views_last_7d": 10, "cart_events_last_7d": 0, "purchases_last_30d": 0},
        "customer_profile": {"tier": "Bronze", "preferred_category": "electronics"},
        "retrieval_context": "- Doc: Phone sale\n  Category: electronics\n  Brand: Acme\n  Price: 199",
    }

    # Ensure that when LLM call raises, template fallback returns non-empty answer
    # Monkeypatch _call_openai_chat to raise
    original = gen_mod._call_openai_chat
    gen_mod._call_openai_chat = lambda prompt: (_ for _ in ()).throw(RuntimeError("no llm"))
    try:
        out = gen_mod.generation_node(state)
        assert out.get("answer")
        assert out.get("model_metadata", {}).get("model_used") == "template"
    finally:
        gen_mod._call_openai_chat = original


def test_llm_monkeypatched():
    state = {
        "user": {"message": "Any deals?"},
        "segment": "cart_abandoner",
        "behavior_summary": {"views_last_7d": 2, "cart_events_last_7d": 3, "purchases_last_30d": 0},
        "customer_profile": {"tier": "Gold", "preferred_category": "home"},
        "retrieval_context": "- Doc: Toaster deal\n  Category: home\n  Brand: ToastCo\n  Price: 49",
    }

    # Monkeypatch _call_openai_chat to return a deterministic response
    original = gen_mod._call_openai_chat
    gen_mod._call_openai_chat = lambda prompt: "Special Gold offer: 20% off your saved cart items."
    try:
        out = gen_mod.generation_node(state)
        assert "Gold" in out.get("answer") or "offer" in out.get("answer").lower()
        assert out.get("model_metadata", {}).get("model_used") != "template"
    finally:
        gen_mod._call_openai_chat = original
from app.state.workflow_state import new_workflow_state


class DummyResp:
    def __init__(self, content: str):
        self.content = content


class DummyModel:
    def __init__(self, content: str):
        self._content = content

    def invoke(self, messages):
        return DummyResp(self._content)


def test_generation_node_with_mock(monkeypatch):
    """Generation node should call the model and return answer + metadata."""
    from app.nodes.generation_node import generation_node

    # Monkeypatch model loader to avoid external dependencies
    monkeypatch.setattr("app.nodes.generation_node._load_model", lambda: DummyModel("Hello from model"))

    s = new_workflow_state()
    s["user"] = {"message": "Say hi"}
    s["retrieval_context"] = "context"

    out = generation_node(s)

    assert out["answer"] == "Hello from model"
    assert "model_metadata" in out
