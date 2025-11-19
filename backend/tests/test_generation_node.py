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
