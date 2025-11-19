from app.graph.workflow_graph import WorkflowGraph
from app.nodes.offers_node import offers_node
from app.nodes import generation_node


def test_trace_propagates_to_generation():
    graph = WorkflowGraph()

    def seg_handler(payload):
        state = dict(payload or {})
        state["segment"] = {"segment_id": "bargain_hunter", "routing_hint": None}
        return state

    def retrieval_handler(state):
        s = dict(state or {})
        s["retrieved_docs"] = [
            {"id": "p1", "title": "Shoe A", "price": 50, "original_price": 100, "brand": "Acme", "discount": True},
        ]
        return s

    graph.add_node("seg", seg_handler)
    graph.add_node("retrieval", retrieval_handler)
    graph.add_node("offers", offers_node)
    graph.add_node("generation", generation_node.generation_node)

    graph.connect("seg", "retrieval")
    graph.connect("retrieval", "offers")
    graph.connect("offers", "generation")

    res = graph.run("seg", {})
    # generation model_metadata should include trace_id
    meta = res.get("model_metadata")
    assert meta and "trace_id" in meta and isinstance(meta.get("trace_id"), str)
