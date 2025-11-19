import os
from app.services.retriever import Retriever
from app.config import settings


def test_observability_contains_settings_used_default(tmp_path):
    # Use a small data file if available in tests/data, otherwise rely on default empty corpus
    data_file = os.path.join(os.path.dirname(__file__), "data", "sample_retriever_corpus.json")
    if not os.path.exists(data_file):
        # fallback to Retriever default (which may be empty)
        r = Retriever()
    else:
        r = Retriever(data_path=data_file)

    # call retrieval without overrides
    _ = r.get_grounding_content(query="sneakers", top_k=2)
    obs = r.get_last_observability()
    assert obs is not None, "Observability record should be present"
    assert "settings_used" in obs, "settings_used must be present in observability"
    assert "settings_used_str" in obs, "settings_used_str must be present in observability"
    assert isinstance(obs["settings_used"], dict) and len(obs["settings_used"]) > 0
    assert isinstance(obs["settings_used_str"], str) and len(obs["settings_used_str"]) > 0
    # keys in string should appear for the dict keys
    for k in obs["settings_used"].keys():
        assert k in obs["settings_used_str"], f"{k} should appear in compact settings string"


def test_observability_contains_settings_used_with_overrides(tmp_path):
    data_file = os.path.join(os.path.dirname(__file__), "data", "sample_retriever_corpus.json")
    if not os.path.exists(data_file):
        r = Retriever()
    else:
        r = Retriever(data_path=data_file)

    # call retrieval with explicit overrides to exercise override path
    _ = r.get_grounding_content(query="running shoes", top_k=3, max_per_brand=1, max_per_category=1, novelty_threshold=0.2, enable_diversity=True)
    obs = r.get_last_observability()
    assert obs is not None
    assert "settings_used" in obs
    assert "settings_used_str" in obs
    su = obs["settings_used"]
    assert su["enable_diversity"] is True
    assert su["max_per_brand"] == 1
    assert su["max_per_category"] == 1
    assert abs(float(su["novelty_threshold"]) - 0.2) < 1e-6

