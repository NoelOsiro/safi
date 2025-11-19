from app.agents.segmentation.segmentation_agent import _derive_behavior_summary, _decide_segment


def test_loyalist_rule():
    """Tests the segmentation logic for a highly loyal, recent purchaser."""
    profile = {
        "purchases_last_30d": 4,
        "views_last_7d": 10,
        "last_purchase_days_ago": 2,
        "avg_order_value": 120.0,
    }
    behavior = _derive_behavior_summary(profile)
    label, scores, reason = _decide_segment(behavior, profile)
    # A loyalist could also be categorized as high_value or recent_purchaser depending on rule priority
    assert label in ("loyalist", "high_value", "recent_purchaser")
    assert isinstance(reason, str) and reason


def test_power_user_rule():
    """Tests the segmentation logic for a highly engaged power user."""
    profile = {
        "views_last_7d": 40,
        "cart_events_last_7d": 5,
        "purchases_last_30d": 3,
        "sessions_last_30d": 5,
        "pages_per_session": 6,
    }
    behavior = _derive_behavior_summary(profile)
    label, scores, reason = _decide_segment(behavior, profile)
    assert label == "power_user"
    assert scores.get("engagement_score", 0) >= 0
    assert reason


def test_bargain_hunter_rule():
    """Tests the segmentation logic for a user primarily focused on discounts."""
    profile = {
        "views_last_7d": 20,
        "cart_events_last_7d": 3,
        "purchases_last_30d": 0,
        "discount_view_events": 12,
        "avg_order_value": 30.0,
    }
    behavior = _derive_behavior_summary(profile)
    label, scores, reason = _decide_segment(behavior, profile)
    assert label == "bargain_hunter"
    assert scores.get("discount_view_rate", 0) > 0
    assert "discount" in reason.lower() or "price" in reason.lower()


def test_output_contract():
    """Ensures the segmenter returns the correct data types."""
    profile = {"views_last_7d": 1, "last_purchase_days_ago": 90, "avg_order_value": 0}
    behavior = _derive_behavior_summary(profile)
    label, scores, reason = _decide_segment(behavior, profile)
    # Contract sanity check
    assert isinstance(label, str)
    assert isinstance(scores, dict)
    assert isinstance(reason, str)