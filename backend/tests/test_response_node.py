from app.state.workflow_state import new_workflow_state


def test_response_node_formats(monkeypatch):
    from app.nodes.response_node import response_node

    s = new_workflow_state()
    s["answer"] = "Hello"
    s["safety_metadata"] = {"needs_blocking": False}
    s["retrieval_context"] = "doc1"

    out = response_node(s)
    assert "final_response" in out
    payload = out["final_response"]
    assert payload["answer"] == "Hello"
    assert payload["safety_metadata"]["needs_blocking"] is False
    assert payload["retrieval_context"] == "doc1"


def test_response_node_blocked():
    from app.nodes.response_node import response_node

    s = new_workflow_state()
    s["answer"] = "Bad stuff"
    s["safety_metadata"] = {"needs_blocking": True}

    out = response_node(s)
    payload = out["final_response"]
    assert "blocked" in payload["answer"] or "cannot provide" in payload["answer"]
