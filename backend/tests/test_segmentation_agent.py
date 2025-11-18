from backend.app.agents.segmentation.segmentation_agent import classify_customer_event
from backend.app.config.settings import settings


def test_product_page_view():
    evt = {"event_name": "page_view", "page_url": "/product/123", "text": "Loved the sneakers", "time_spent": 10}
    out = classify_customer_event(evt)
    assert out["segment_id"] == "Interested/NoPurchase"
    assert "rule_applied" in out
    assert out["segmenter_version"] == settings.SEGMENTER_VERSION


def test_checkout_abandoned():
    evt = {"event_name": "checkout_abandoned", "step": "checkout_step_4"}
    out = classify_customer_event(evt)
    assert out["segment_id"] == "High-Intent/AbandonedCheckout"


def test_payment_keyword():
    evt = {"text": "I want a payment plan"}
    out = classify_customer_event(evt)
    assert out["segment_id"] == "Payment/InstallmentIntent"


def test_fallback():
    evt = {"text": "some random text that matches nothing specific"}
    out = classify_customer_event(evt)
    assert "segment_id" in out
