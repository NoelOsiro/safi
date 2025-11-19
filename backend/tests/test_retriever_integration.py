import os
from app.services.retriever import Retriever


def test_retriever_filters_and_rerank(tmp_path, monkeypatch):
    """Integration test: use sample fixture and assert filtering and persona re-ranking."""
    # Ensure Retriever loads the sample fixture in repo-relative 'data/'
    data_path = os.path.join("data", "sample_irs_content.json")
    r = Retriever(data_path=data_path)

    # Basic query should return electronics docs when searching 'headphones'
    res = r.get_grounding_content("headphones", top_k=3, category="electronics")
    ids = [d.get("id") for d in res]
    assert "doc1" in ids and "doc2" in ids

    # Price filter: request cheap items under $50
    cheap = r.get_grounding_content("speaker", top_k=5, category="electronics", price_range=(None, 50))
    cheap_ids = [d.get("id") for d in cheap]
    assert "doc3" in cheap_ids and "doc2" not in cheap_ids

    # Persona re-rank: prefer brand Acme and discounts -> doc1 should be boosted to top
    persona = {"brands": ["Acme"], "wants_discount": True}
    boosted = r.get_grounding_content("headphones", top_k=3, category="electronics", persona_signals=persona)
    assert boosted
    top_id = boosted[0].get("id")
    assert top_id == "doc1", f"Expected doc1 to be top after boosting, got {top_id}"
