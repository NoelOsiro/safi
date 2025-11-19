from app.agents.segmentation.segmentation_agent import SegmentationAgent


def test_segmentation_agent_run_contract_structured_event():
    agent = SegmentationAgent()
    event = {
        "event_name": "page_view",
        "page_url": "/product/widget-123",
        "step": "view",
        "text": "I love this product",
    }
    out = agent.run(event)
    # Contract keys
    for k in ("segment_id", "trigger_reason", "segmenter_confidence", "rule_applied"):
        assert k in out, f"Missing key {k} in agent output"
    # Types and ranges
    assert isinstance(out["segment_id"], str)
    assert isinstance(out["trigger_reason"], str)
    assert isinstance(out["rule_applied"], str)
    conf = out["segmenter_confidence"]
    assert isinstance(conf, (float, int))
    assert 0.0 <= float(conf) <= 1.0


def test_segmentation_agent_run_contract_text_fallback():
    agent = SegmentationAgent()
    out = agent.run("I need help with my order")
    for k in ("segment_id", "trigger_reason", "segmenter_confidence", "rule_applied"):
        assert k in out
    assert isinstance(out["segment_id"], str)
    assert isinstance(out["trigger_reason"], str)
    assert isinstance(out["rule_applied"], str)
    assert 0.0 <= float(out["segmenter_confidence"]) <= 1.0
