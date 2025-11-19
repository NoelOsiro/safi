from app.graph.workflow_graph import WorkflowGraph
from app.nodes.offers_node import offers_node
from app.nodes import generation_node


def test_e2e_seg_retrieval_offers_generation():
    graph = WorkflowGraph()

    # segmentation handler: emits segment and persona signals
    def seg_handler(payload):
        state = dict(payload or {})
        state["segment"] = {"segment_id": "bargain_hunter", "routing_hint": None}
        state["persona_signals"] = {"brands": ["Acme"], "wants_discount": True}
        return state

    # retrieval handler: simulates retrieval and sets retrieval_context
    def retrieval_handler(state):
        s = dict(state or {})
        s["retrieved_docs"] = [
            {"id": "p1", "title": "Shoe A", "price": 50, "original_price": 100, "brand": "Acme", "discount": True},
            {"id": "p2", "title": "Shoe B", "price": 70, "brand": "ValueCo", "discount": False},
        ]
        s["retrieval_context"] = "Shoe A: 50 off; Shoe B: featured"
        return s

    graph.add_node("seg", seg_handler)
    graph.add_node("retrieval", retrieval_handler)
    graph.add_node("offers", offers_node)
    graph.add_node("generation", generation_node.generation_node)

    # wire edges: seg -> retrieval -> offers -> generation
    graph.connect("seg", "retrieval")
    graph.connect("retrieval", "offers")
    graph.connect("offers", "generation")

    result = graph.run("seg", {})
    assert isinstance(result, dict)
    # final result should contain generation answer and offers metadata
    assert "answer" in result
    assert "offers" in result
    assert result.get("offers_metadata", {}).get("segment") == "bargain_hunter"
    assert result.get("offers_metadata", {}).get("count") >= 1
