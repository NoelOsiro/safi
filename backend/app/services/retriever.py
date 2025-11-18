import json
import os
import logging
from typing import List, Dict

import numpy as np
try:
    from sentence_transformers import SentenceTransformer
    import faiss
    FAISS_AVAILABLE = True
except Exception:
    FAISS_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except Exception:
    REQUESTS_AVAILABLE = False

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import time
import hashlib


# configure simple logging for startup messages; user can override via standard logging config
LOG_LEVEL = os.getenv("RETRIEVER_LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))
logger = logging.getLogger(__name__)


# Try to import analytics module from app.agents; if not available, fall back to None
import importlib
try:
    analytics = importlib.import_module("app.agents.analytics")
except Exception:
    analytics = None


class Retriever:
    """Configurable retriever supporting TF-IDF and FAISS (sentence-transformers) with a
    GitHub Models embeddings option.

    The constructor accepts optional `model_instance` and `github_adapter` for dependency
    injection and easier testing.
    """

    def __init__(
        self,
        data_path: str = "./data/irs_content.json",
        ft_model_name: str | None = None,
        model_instance=None,
        github_adapter=None,
    ):
        backend = os.getenv("RETRIEVER_BACKEND", "auto").lower()
        env_model = os.getenv("EMBED_MODEL")
        self.ft_model_name = ft_model_name or env_model or "all-MiniLM-L6-v2"
        self.data_path = os.path.abspath(data_path)
        self.documents: List[Dict] = []

        self._github_models = False
        if backend == "tfidf":
            self._use_faiss = False
        elif backend == "faiss":
            self._use_faiss = True
        elif backend == "github_models":
            self._github_models = True
            self._use_faiss = True
        else:
            self._use_faiss = FAISS_AVAILABLE

        self.index_path_prefix = os.getenv("RETRIEVER_INDEX_PATH")

        # Embedding API / retry configuration
        self.embed_timeout = float(os.getenv("EMBEDDING_API_TIMEOUT", "30"))
        self.embed_max_retries = int(os.getenv("EMBEDDING_API_MAX_RETRIES", "3"))
        self.embed_backoff_factor = float(os.getenv("EMBEDDING_API_BACKOFF", "1.5"))

        # FAISS index configuration (flat | ivf | hnsw)
        self.faiss_index_type = os.getenv("FAISS_INDEX_TYPE", "flat").lower()
        self.faiss_nlist = int(os.getenv("FAISS_NLIST", "100"))
        self.faiss_hnsw_m = int(os.getenv("FAISS_HNSW_M", "32"))
        self.faiss_hnsw_ef_construction = int(os.getenv("FAISS_HNSW_EF_CONSTRUCTION", "200"))

        # Hybrid prefilter: use TF-IDF to narrow candidates before vector search
        self.hybrid_prefilter_topk = int(os.getenv("HYBRID_PREFILTER_TOPK", "0"))

        # Dependency-injected model or adapter (for tests or advanced users)
        self._injected_model = model_instance
        self._injected_github_adapter = github_adapter

        # Log chosen configuration so it's visible at startup
        logger.info(
            "Retriever starting: backend=%s, use_faiss=%s, github_models=%s, embed_model=%s, index_prefix=%s",
            backend,
            getattr(self, "_use_faiss", None),
            getattr(self, "_github_models", None),
            self.ft_model_name,
            self.index_path_prefix,
        )

        # Warn early if user explicitly requested a backend that's not available
        if backend == "faiss" and not FAISS_AVAILABLE:
            logger.warning("RETRIEVER_BACKEND=faiss requested but FAISS/sentence-transformers not available; will fall back to TF-IDF if possible")
        if backend == "github_models" and (not REQUESTS_AVAILABLE or not os.getenv("GITHUB_TOKEN")):
            logger.warning("RETRIEVER_BACKEND=github_models requested but 'requests' or GITHUB_TOKEN is missing; GitHub Models calls will fail or fall back")

        # internals
        self.model = None
        self.index = None
        self.embeddings = None
        self.vectorizer = None
        self.tfidf_matrix = None
        # Last query observability record (populated by get_grounding_content)
        self._last_query_observability = None

        self._build_index()

    def _load_data(self):
        if not os.path.exists(self.data_path):
            logger.warning("Data file not found: %s. Continuing with empty corpus.", self.data_path)
            self.documents = []
            return
        with open(self.data_path, "r", encoding="utf-8") as f:
            try:
                self.documents = json.load(f)
            except Exception:
                logger.exception("Failed to parse data file %s; continuing with empty corpus.", self.data_path)
                self.documents = []

    def _build_index(self):
        self._load_data()
        self.corpus = [d.get("text", "") for d in self.documents]
        if not any(self.corpus):
            logger.error("Corpus loaded is empty. Retrieval will produce no results.")

        if self._use_faiss:
            try:
                # Obtain embeddings (injected adapter preferred for testing)
                # local import of numpy to avoid requiring it when TF-IDF only
                import numpy as np

                if self._github_models:
                    token = os.getenv("GITHUB_TOKEN")
                    if not REQUESTS_AVAILABLE or not token:
                        logger.warning("GitHub Models backend selected but requests or GITHUB_TOKEN unavailable; aborting FAISS build")
                        raise RuntimeError("GitHub Models backend selected but requests or GITHUB_TOKEN unavailable")
                    if self._injected_github_adapter is not None:
                        emb = self._injected_github_adapter(self.corpus)
                    else:
                        emb = self._github_get_embeddings(self.corpus)
                else:
                    if self._injected_model is not None:
                        self.model = self._injected_model
                        emb = self.model.encode(self.corpus, convert_to_numpy=True, show_progress_bar=False)
                    else:
                        self.model = SentenceTransformer(self.ft_model_name)
                        emb = self.model.encode(self.corpus, convert_to_numpy=True, show_progress_bar=False)

                emb = np.asarray(emb, dtype="float32")
                if emb.ndim == 1:
                    emb = np.expand_dims(emb, 0)
                # normalize and build index; support configurable index types
                faiss.normalize_L2(emb)
                dim = emb.shape[1]

                if FAISS_AVAILABLE:
                    try:
                        if self.faiss_index_type == "ivf":
                            quantizer = faiss.IndexFlatIP(dim)
                            index = faiss.IndexIVFFlat(quantizer, dim, self.faiss_nlist, faiss.METRIC_INNER_PRODUCT)
                            index.train(emb)
                            index.add(emb)
                            self.index = index
                        elif self.faiss_index_type == "hnsw":
                            index = faiss.IndexHNSWFlat(dim, self.faiss_hnsw_m)
                            try:
                                index.hnsw.efConstruction = self.faiss_hnsw_ef_construction
                            except Exception:
                                # some FAISS builds expose attributes differently
                                pass
                            index.add(emb)
                            self.index = index
                        else:
                            self.index = faiss.IndexFlatIP(dim)
                            self.index.add(emb)
                    except Exception:
                        logger.exception("Failed to create configured FAISS index type '%s', falling back to IndexFlatIP", self.faiss_index_type)
                        self.index = faiss.IndexFlatIP(dim)
                        self.index.add(emb)
                else:
                    raise RuntimeError("FAISS not available at runtime")

                self.embeddings = emb

                if self.index_path_prefix:
                    try:
                        index_file = f"{self.index_path_prefix}.index"
                        meta_file = f"{self.index_path_prefix}.meta.json"
                        # ensure parent dir exists if a directory prefix was provided
                        parent = os.path.dirname(index_file)
                        if parent:
                            os.makedirs(parent, exist_ok=True)
                        faiss.write_index(self.index, index_file)
                        meta = {"documents": self.documents, "model": self.ft_model_name, "embed_model": self.ft_model_name}
                        with open(meta_file, "w", encoding="utf-8") as mf:
                            json.dump(meta, mf)
                    except Exception:
                        logger.exception("Failed to persist FAISS index/meta to prefix=%s", self.index_path_prefix)
            except Exception:
                logger.exception("FAISS-based index build failed, falling back to TF-IDF")
                self._use_faiss = False
                self._build_tfidf()
        else:
            self._build_tfidf()

    def _build_tfidf(self):
        self.vectorizer = TfidfVectorizer(stop_words="english")
        if any(self.corpus):
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)
        else:
            self.tfidf_matrix = None

    def _github_get_embeddings(self, texts: List[str]) -> np.ndarray:
        url = os.getenv("GITHUB_MODELS_EMBED_URL")
        if not url:
            url = f"https://api.github.com/models/{self.ft_model_name}/embeddings"

        headers = {"Authorization": f"token {os.getenv('GITHUB_TOKEN')}", "Accept": "application/json"}
        payload = {"input": texts}

        last_exc = None
        backoff = float(self.embed_backoff_factor)
        for attempt in range(1, self.embed_max_retries + 1):
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=self.embed_timeout)
                if resp.status_code == 429:
                    logger.warning("Embedding API rate-limited (429). attempt=%s/%s; backing off=%s seconds", attempt, self.embed_max_retries, backoff)
                    time.sleep(backoff)
                    backoff *= self.embed_backoff_factor
                    continue
                resp.raise_for_status()
                data = resp.json()
                return self._parse_embeddings_response(data, len(texts))
            except Exception as e:
                last_exc = e
                logger.warning("Embedding request failed on attempt %s/%s: %s", attempt, self.embed_max_retries, e)
                time.sleep(backoff)
                backoff *= self.embed_backoff_factor

        raise RuntimeError("Unable to obtain embeddings from GitHub Models") from last_exc


    def _parse_embeddings_response(self, data, expected_count: int):
        """Strict parser for embedding responses. Attempts several known shapes,
        but prefers returning a list of vectors matching the expected_count.
        """
        # Known shape: {"data": [{"embedding": [...]}, ...]}
        import numpy as np

        if isinstance(data, dict) and "data" in data and isinstance(data["data"], list):
            embeddings = []
            for item in data["data"]:
                if isinstance(item, dict) and "embedding" in item:
                    embeddings.append(item["embedding"])
            if len(embeddings) == expected_count:
                return np.asarray(embeddings, dtype="float32")

        # Known shape: {"embedding": [...]} 
        if isinstance(data, dict) and "embedding" in data and isinstance(data["embedding"], list):
            vec = np.asarray(data["embedding"], dtype="float32")
            return np.tile(vec, (expected_count, 1))

        # Known alternate shape: {"outputs": [{"embedding": [...]}, ...]}
        if isinstance(data, dict) and "outputs" in data and isinstance(data["outputs"], list):
            embeddings = [out.get("embedding") for out in data["outputs"] if isinstance(out, dict) and "embedding" in out]
            if len(embeddings) == expected_count:
                return np.asarray(embeddings, dtype="float32")

        # Best-effort: find first numeric list and tile it
        def find_list_arrays(obj):
            if isinstance(obj, list) and obj and isinstance(obj[0], (int, float)):
                return obj
            if isinstance(obj, dict):
                for v in obj.values():
                    res = find_list_arrays(v)
                    if res is not None:
                        return res
            if isinstance(obj, list):
                for item in obj:
                    res = find_list_arrays(item)
                    if res is not None:
                        return res
            return None

        maybe = find_list_arrays(data)
        if maybe is not None:
            vec = np.asarray(maybe, dtype="float32")
            return np.tile(vec, (expected_count, 1))

        raise RuntimeError("Unable to parse embeddings from GitHub Models response")

    def get_grounding_content(self, query: str, top_k: int = 3) -> List[Dict]:
        """Return top_k most relevant snippets for the query.

        Each returned item contains: id, title, text, source, score
        """
        if not query or not self.documents:
            return []

        # Prepare observability record
        obs = {
            "query": query,
            "query_hash": hashlib.sha256(query.encode("utf-8")).hexdigest()[:8],
            "backend": "tfidf",
            "latency_ms": None,
            "top_ids": [],
        }

        if self._use_faiss and hasattr(self, "index") and self.index is not None:
            obs["backend"] = "faiss"
            start = time.time()
            try:
                # Hybrid prefilter: use TF-IDF to narrow candidate set
                candidate_indices = None
                if self.hybrid_prefilter_topk > 0 and getattr(self, "tfidf_matrix", None) is not None:
                    try:
                        q_vec = self.vectorizer.transform([query])
                        cosine_similarities = linear_kernel(q_vec, self.tfidf_matrix).flatten()
                        candidate_indices = cosine_similarities.argsort()[::-1][: self.hybrid_prefilter_topk]
                    except Exception:
                        candidate_indices = None

                if self._github_models:
                    if not REQUESTS_AVAILABLE or not os.getenv("GITHUB_TOKEN"):
                        raise RuntimeError("GitHub Models backend selected but requests or GITHUB_TOKEN unavailable")
                    q_emb = self._github_get_embeddings([query])
                else:
                    q_emb = self.model.encode([query], convert_to_numpy=True)

                q_emb = np.asarray(q_emb, dtype="float32")
                if q_emb.ndim == 1:
                    q_emb = np.expand_dims(q_emb, 0)
                faiss.normalize_L2(q_emb)

                results = []
                if candidate_indices is not None and len(candidate_indices) > 0:
                    # Compute scores against the candidate embeddings without touching FAISS
                    try:
                        cand_emb = self.embeddings[np.array(candidate_indices, dtype=int)]
                        faiss.normalize_L2(cand_emb)
                        # inner product = cosine after normalization
                        scores = (q_emb @ cand_emb.T)[0]
                        top_idx = np.argsort(scores)[::-1][:top_k]
                        for i in top_idx:
                            doc_idx = int(candidate_indices[int(i)])
                            doc = self.documents[doc_idx]
                            results.append({
                                "id": doc.get("id"),
                                "title": doc.get("title"),
                                "text": doc.get("text"),
                                "source": doc.get("source"),
                                "score": float(scores[int(i)]),
                            })
                    except Exception:
                        # fallback to full index search
                        D, inds = self.index.search(q_emb, top_k)
                        scores = D[0].tolist()
                        indices = inds[0].tolist()
                        for idx, score in zip(indices, scores):
                            if idx < 0 or idx >= len(self.documents):
                                continue
                            doc = self.documents[int(idx)]
                            results.append(
                                {
                                    "id": doc.get("id"),
                                    "title": doc.get("title"),
                                    "text": doc.get("text"),
                                    "source": doc.get("source"),
                                    "score": float(score),
                                }
                            )
                else:
                    D, inds = self.index.search(q_emb, top_k)
                    scores = D[0].tolist()
                    indices = inds[0].tolist()
                    for idx, score in zip(indices, scores):
                        if idx < 0 or idx >= len(self.documents):
                            continue
                        doc = self.documents[int(idx)]
                        results.append(
                            {
                                "id": doc.get("id"),
                                "title": doc.get("title"),
                                "text": doc.get("text"),
                                "source": doc.get("source"),
                                "score": float(score),
                            }
                        )

                obs["latency_ms"] = int((time.time() - start) * 1000)
                obs["top_ids"] = [r.get("id") for r in results]
                self._last_query_observability = obs
                try:
                    if analytics is not None:
                        analytics.log_a_b_result(obs)
                except Exception:
                    logger.exception("Failed to persist observability row via analytics.log_a_b_result")
                return results
            except Exception:
                # ensure we still set latency if an exception occurred
                obs["latency_ms"] = int((time.time() - start) * 1000)
                self._last_query_observability = obs
                pass

        if getattr(self, "tfidf_matrix", None) is None:
            if getattr(self, "vectorizer", None) is None:
                return []
        start = time.time()
        q_vec = self.vectorizer.transform([query])
        cosine_similarities = linear_kernel(q_vec, self.tfidf_matrix).flatten()
        top_indices = cosine_similarities.argsort()[::-1][:top_k]

        results = []
        for idx in top_indices:
            doc = self.documents[int(idx)]
            results.append(
                {
                    "id": doc.get("id"),
                    "title": doc.get("title"),
                    "text": doc.get("text"),
                    "source": doc.get("source"),
                    "score": float(cosine_similarities[int(idx)]),
                }
            )

        # Persist observability for TF-IDF path as well
        obs["backend"] = obs.get("backend", "tfidf")
        obs["latency_ms"] = int((time.time() - start) * 1000)
        obs["top_ids"] = [r.get("id") for r in results]
        self._last_query_observability = obs
        try:
            if analytics is not None:
                analytics.log_a_b_result(obs)
        except Exception:
            logger.exception("Failed to persist observability row via analytics.log_a_b_result")
        return results

    def get_last_observability(self):
        """Public getter for the last query observability record (or None)."""
        return self._last_query_observability



def _quick_demo():
    r = Retriever()
    print(r.get_grounding_content("payment plans", top_k=3))


if __name__ == "__main__":
    _quick_demo()
