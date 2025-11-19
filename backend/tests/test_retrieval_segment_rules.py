def test_retrieval_includes_deal_modifiers(monkeypatch):
    """retrieval_node should modify queries for bargain_hunter to include deals/discounts."""
    from app.nodes.retrieval_node import retrieval_node

    # Dummy retriever that records the query
    class DummyRetriever:
        def __init__(self, *args, **kwargs):
            self.last_query = None

        def get_grounding_content(self, query, top_k=5):
            self.last_query = query
            return []

    import app.nodes.retrieval_node as retr_mod
    retr_mod._retriever = DummyRetriever()

    state = {"user": {"message": "looking for headphones"}, "segment": "bargain_hunter"}
    out = retrieval_node(state)
    # Ensure retriever recorded a query containing 'deals' or 'discounts'
    assert isinstance(retr_mod._retriever.last_query, str)
    q = retr_mod._retriever.last_query.lower()
    assert "deal" in q or "discount" in q
