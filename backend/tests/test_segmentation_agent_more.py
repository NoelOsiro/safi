from app.agents.segmentation.segmentation_agent import classify_customer_event
from app.config.settings import settings


def test_time_spent_boundary_low():
    # time_spent just below threshold
    evt = {"event_name": "page_view", "page_url": "/product/1", "text": "nice", "time_spent": 4.9}
    out = classify_customer_event(evt)
    assert out["segment_id"] == "Interested/NoPurchase"
    assert out["segmenter_confidence"] in (0.6, 0.85)


def test_time_spent_boundary_high():
    # time_spent exactly at threshold should be treated as high engagement
    evt = {"event_name": "page_view", "page_url": "/product/1", "text": "nice", "time_spent": 5}
    out = classify_customer_event(evt)
    assert out["segment_id"] == "Interested/NoPurchase"
    assert out["segmenter_confidence"] == 0.85


def test_empty_message_fallback():
    evt = {"text": ""}
    out = classify_customer_event(evt)
    assert out["segment_id"] == "General"


def test_missing_keys():
    # No user message or structured fields
    evt = {}
    out = classify_customer_event(evt)
    assert out["segment_id"] == "General"


def test_keyword_config_override(monkeypatch):
    # Temporarily override payment keywords via settings
    old = settings.SEGMENTER_KEYWORDS
    try:
        settings.SEGMENTER_KEYWORDS = {"payment": ["paylater"], "support": ["helpme"]}
        evt = {"text": "I want to paylater option"}
        out = classify_customer_event(evt)
        assert out["segment_id"] == "Payment/InstallmentIntent"
    finally:
        settings.SEGMENTER_KEYWORDS = old
