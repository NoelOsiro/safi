from app.nodes import offers_node as on
from app.services import inventory


def test_offers_excludes_out_of_stock(monkeypatch):
    # patch inventory map so p2 is out of stock
    inventory.set_inventory_map({"p1": True, "p2": False})

    fake_rules = {
        "general": {"offer_focus": {"max_offers": 3, "max_per_brand": 2}}
    }
    monkeypatch.setattr(on, "SEGMENT_RULES", fake_rules)

    state = {
        "segment": "general",
        "retrieved_docs": [
            {"id": "p1", "title": "Available Item", "price": 10, "brand": "B"},
            {"id": "p2", "title": "Out of Stock Item", "price": 20, "brand": "C"},
        ]
    }

    out = on.offers_node(state)
    offers = out.get("offers")
    assert offers is not None
    # p2 should not appear because inventory marks it out of stock
    assert all(o.get("product_id") != "p2" for o in offers)
    # ensure offers_metadata records grounding sources not including p2
    meta = out.get("offers_metadata")
    assert "p2" not in (meta.get("grounding_sources") or [])
