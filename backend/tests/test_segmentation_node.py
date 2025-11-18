from backend.app.nodes.segmentation_node import segmentation_node


def test_segmentation_node_merges_state():
    state = {"user": {"message": "I need help with refund"}, "event_name": "page_view", "page_url": "/product/abc"}
    out = segmentation_node(state)
    assert "segment" in out
    seg = out["segment"]
    assert "rule_applied" in seg
