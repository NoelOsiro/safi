import os
from app.services.retriever import Retriever


def test_persona_brand_boost_prefers_brand(tmp_path):
    data_path = os.path.join(os.path.dirname(__file__), "data", "sample_retriever_corpus.json")
    r = Retriever(data_path=data_path)

    # Without persona, order is not asserted here (we use presence)
    base = r.get_grounding_content("common", top_k=3)
    assert {d["id"] for d in base} == {"d1", "d2", "d3"}

    # With persona preferring BrandX, d1 should rise to the top
    persona = {"brands": ["BrandX"]}
    boosted = r.get_grounding_content("common", top_k=3, persona_signals=persona)
    msg = f"Expected BrandX doc d1 first when persona brands include BrandX, got {boosted[0]['id']}"
    assert boosted[0]["id"] == "d1", msg


def test_explain_mode_with_segment_and_persona_includes_boosts(tmp_path):
    data_path = os.path.join(os.path.dirname(__file__), "data", "sample_retriever_corpus.json")
    r = Retriever(data_path=data_path)

    persona = {"brands": ["BrandX"]}
    resp = r.get_grounding_content("common", top_k=3, segment_id="loyalist", persona_signals=persona, explain=True)

    # Top-level shape
    assert isinstance(resp, dict)
    assert "retrieved_docs" in resp and "retrieval_context" in resp and "candidate_stats" in resp

    docs = resp["retrieved_docs"]
    assert len(docs) == 3

    # Each doc returned when segment_id provided should have an explain field with segment_boost and boosts
    for d in docs:
        assert "explain" in d
        assert "segment_boost" in d["explain"]
        assert "boosts" in d["explain"]

    # Because persona brands include BrandX and SEGMENT_RULES for loyalist includes brand boost,
    # expect d1 to be one of the top docs (likely first)
    ids = [d["id"] for d in docs]
    assert "d1" in ids
