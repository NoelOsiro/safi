from app.graph.workflow_graph import WorkflowGraph
from app.nodes.offers_node import offers_node


def test_routing_hint_short_circuits_to_offers():
    graph = WorkflowGraph()

    # segmentation handler: returns payload with auditable segment including routing_hint
    def seg_handler(payload):
        state = dict(payload or {})
        state["segment"] = {"segment_id": "bargain_hunter", "routing_hint": "offers"}
        # provide some retrieved docs for the offers_node to consume
        state["retrieved_docs"] = [
            {"id": "p1", "title": "Shoe A", "price": 50, "original_price": 100, "brand": "Acme", "discount": True}
        ]
        return state

    graph.add_node("seg", seg_handler)
    graph.add_node("offers", offers_node)
    graph.add_routing_hint("offers", "offers")

    result = graph.run("seg", {})
    assert isinstance(result, dict)
    assert "offers" in result
    assert result.get("offers_metadata", {}).get("segment") == "bargain_hunter"
    # routing hint should be recorded in offers metadata
    assert result.get("offers_metadata", {}).get("routing_hint_used") == "offers"
