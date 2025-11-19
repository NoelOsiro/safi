import os
from app.services.retriever import Retriever


def test_brand_cap_and_category_cap(tmp_path):
    data_path = os.path.join(os.path.dirname(__file__), "data", "sample_diversity_corpus.json")
    r = Retriever(data_path=data_path)

    # Query that matches all docs
    res = r.get_grounding_content("sneaker", top_k=10)
    # By default, diversity caps should be applied: max_per_brand=2, so only 2 BrandNike items remain
    ids = [d["id"] for d in res]
    # Count how many returned docs are BrandNike
    nike_count = 0
    for d in res:
        doc_meta = next((x for x in r.documents if x.get("id") == d.get("id")), {})
        brand = (doc_meta.get("brand") or "").lower()
        if brand.startswith("brandnike"):
            nike_count += 1
    assert nike_count <= 2


def test_explain_post_processing_fields_present(tmp_path):
    data_path = os.path.join(os.path.dirname(__file__), "data", "sample_diversity_corpus.json")
    r = Retriever(data_path=data_path)

    resp = r.get_grounding_content("sneaker", top_k=10, explain=True)
    assert isinstance(resp, dict)
    docs = resp["retrieved_docs"]
    # check post_processing field in explain on returned docs
    for d in docs:
        assert "explain" in d
        assert "post_processing" in d["explain"]
        pp = d["explain"]["post_processing"]
        assert pp.get("diversity_filter") is True
        assert "removed_duplicates" in pp