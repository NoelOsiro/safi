import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.retriever import Retriever


def test_tfidf_retrieval_with_sample_docs(tmp_path, monkeypatch):
    # Ensure TF-IDF backend
    monkeypatch.setenv('RETRIEVER_BACKEND', 'tfidf')

    # Point to our sample docs file
    data_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'sample_docs.json'))
    r = Retriever(data_path=data_file)

    results = r.get_grounding_content('returns', top_k=2)
    # Expect the document about return policy to be highest ranked
    assert any(d['id'] == 'doc1' for d in results)
    # Also verify that results contain score and text
    for d in results:
        assert 'score' in d
        assert 'text' in d


