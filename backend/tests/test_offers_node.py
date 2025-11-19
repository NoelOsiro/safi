from app.nodes import offers_node as on


def test_offers_bargain_hunter(monkeypatch):
    # Patch SEGMENT_RULES inside the offers_node module to control offer focus
    fake_rules = {
        "bargain_hunter": {"offer_focus": {"max_offers": 3, "max_per_brand": 1}},
        "general": {"offer_focus": {"max_offers": 2}}
    }
    monkeypatch.setattr(on, "SEGMENT_RULES", fake_rules)

    state = {
        "segment": "bargain_hunter",
        "customer_profile": {"tier": "Bronze"},
        "retrieved_docs": [
            {"id": "p1", "title": "Shoe A", "price": 50, "original_price": 100, "brand": "Acme", "discount": True},
            {"id": "p2", "title": "Shoe B", "price": 45, "original_price": 45, "brand": "Acme", "discount": False},
            {"id": "p3", "title": "Shoe C", "price": 30, "original_price": 60, "brand": "Zephyr", "discount": True},
        ]
    }

    out = on.offers_node(state)
    offers = out.get("offers")
    assert offers is not None
    # expect discounted items prioritized and brand cap applied (max_per_brand=1)
    assert any(o for o in offers if o["product_id"] == "p1" and o["discount"])
    assert any(o for o in offers if o["product_id"] == "p3" and o["discount"])
    # because of brand cap, only one Acme item should appear
    acme_offers = [o for o in offers if o.get("brand") == "Acme"]
    assert len(acme_offers) <= 1
    # metadata explainability present
    meta = out.get("offers_metadata")
    assert meta is not None
    assert meta.get("count") == len(offers)
    assert "boost_features_used" in meta
    assert "reranked_candidates" in meta
    assert "grounding_sources" in meta
    assert "trace_id" in meta and isinstance(meta.get("trace_id"), str)


def test_offers_high_value_labels(monkeypatch):
    fake_rules = {
        "high_value": {"offer_focus": {"max_offers": 2}},
        "general": {"offer_focus": {"max_offers": 2}}
    }
    monkeypatch.setattr(on, "SEGMENT_RULES", fake_rules)

    state = {
        "segment": "high_value",
        "customer_profile": {"tier": "Platinum"},
        "retrieved_docs": [
            {"id": "p10", "title": "Luxury Watch", "price": 500, "brand": "LuxCo", "discount": False},
            {"id": "p11", "title": "Budget Watch", "price": 40, "brand": "ValueCo", "discount": True},
        ]
    }

    out = on.offers_node(state)
    offers = out.get("offers")
    assert offers is not None
    # Expect at least one exclusive label for high_value
    assert any(o for o in offers if o.get("label") == "exclusive")
    # offers_metadata should reflect segment
    meta = out.get("offers_metadata")
    assert meta and meta.get("segment") == "high_value"
    # expect high_price feature used and trace id
    assert "high_price" in meta.get("boost_features_used", []) or any("high_price" in (o.get("boost_features") or []) for o in offers)
    assert meta.get("trace_id")
