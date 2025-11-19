from app.state.workflow_state import new_workflow_state


def test_pipeline_end_to_end_with_monkeypatch(monkeypatch):
    """End-to-end-like pipeline using real nodes but monkeypatched model loaders."""
    # Monkeypatch generation model
    class DummyResp:
        def __init__(self, content):
            self.content = content

    class DummyModel:
        def __init__(self, content):
            self._content = content

        def invoke(self, messages):
            return DummyResp(self._content)

    monkeypatch.setattr("app.nodes.generation_node._load_model", lambda: DummyModel("E2E answer"))

    # Monkeypatch safety model to return safe JSON
    import json

    safe_json = json.dumps({
        "contains_pii": False,
        "contains_hate": False,
        "contains_self_harm": False,
        "contains_violence": False,
        "contains_toxic_language": False,
        "is_hallucination": False,
        "needs_blocking": False,
        "explanation": "ok",
    })

    class DummySafetyModel:
        def invoke(self, messages):
            class R:
                content = safe_json

            return R()

    monkeypatch.setattr("app.nodes.safety_node._load_safety_model", lambda: DummySafetyModel())

    # Run the pipeline using run_graph
    from app.graph.router import run_graph
    from app.nodes.segmentation_node import segmentation_node
    from app.nodes.retrieval_node import retrieval_node
    from app.nodes.response_node import response_node

    # Monkeypatch retriever used by retrieval_node so it returns at least one doc
    class DummyRetriever:
        def __init__(self, *args, **kwargs):
            pass

        def get_grounding_content(self, query, top_k=5):
            return [{"id": "doc1", "title": "Doc1", "text": "Payment steps", "source": "sample", "score": 1.0}]

    # Set the module-level _retriever instance used by retrieval_node
    import app.nodes.retrieval_node as retr_node_mod
    retr_node_mod._retriever = DummyRetriever()

    nodes = {
        "segmentation_node": segmentation_node,
        "retrieval_node": retrieval_node,
        "generation_node": __import__("app.nodes.generation_node", fromlist=["generation_node"]).generation_node,
        "safety_node": __import__("app.nodes.safety_node", fromlist=["safety_node"]).safety_node,
        "response_node": response_node,
    }

    s = new_workflow_state()
    s["user"] = {"message": "How do I update my payment method?"}

    final = run_graph(s, nodes, max_steps=10)
    assert "final_response" in final
    assert final["final_response"]["answer"]
