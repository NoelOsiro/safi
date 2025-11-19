import os
from app.services.retriever import Retriever


def test_segment_boost_changes_order(tmp_path):
    # Use the sample corpus created in tests/data
    data_path = os.path.join(os.path.dirname(__file__), "data", "sample_retriever_corpus.json")

    r = Retriever(data_path=data_path)

    # Query that is present in all docs' text, so base TF-IDF scores normalize equally
    no_seg = r.get_grounding_content("common", top_k=3)
    assert isinstance(no_seg, list)
    assert len(no_seg) == 3

    # With no segment, ordering might be stable but we only assert presence
    ids_no_seg = [d["id"] for d in no_seg]
    assert set(ids_no_seg) == {"d1", "d2", "d3"}

    # With bargain_hunter, discounted doc (d2) should be prioritized
    with_seg = r.get_grounding_content("common", top_k=3, segment_id="bargain_hunter")
    ids_with_seg = [d["id"] for d in with_seg]
    assert ids_with_seg[0] == "d2", f"Expected discounted doc d2 first for bargain_hunter, got {ids_with_seg}"

    # With high_value, expensive/new doc (d1) should be prioritized
    with_seg2 = r.get_grounding_content("common", top_k=3, segment_id="high_value")
    ids_with_seg2 = [d["id"] for d in with_seg2]
    assert ids_with_seg2[0] == "d1", f"Expected high-price doc d1 first for high_value, got {ids_with_seg2}"
