import json
import os
import importlib
import logging
from typing import List, Dict
from app.config.segment_rules import SEGMENT_RULES
from app.config.settings import settings
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import time
import hashlib

# avoid importing heavy native libraries at module import time; import lazily
FAISS_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except Exception:
    REQUESTS_AVAILABLE = False



# configure simple logging for startup messages; user can override via standard logging config
LOG_LEVEL = os.getenv("RETRIEVER_LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))
logger = logging.getLogger(__name__)


# Try to import analytics module from app.agents; if not available, fall back to None

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
        # Inverted indexes for fast filtering
        self.index_by_tag = {}
        self.index_by_brand = {}
        self.index_by_category = {}
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
        # Build inverted indexes for tags/brands/categories for efficient filtering
        self.index_by_tag = {}
        self.index_by_brand = {}
        self.index_by_category = {}
        for i, d in enumerate(self.documents):
            # tags may be a list or comma-separated string
            tags = d.get("tags") or []
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(",") if t.strip()]
            for t in tags:
                key = str(t).lower()
                self.index_by_tag.setdefault(key, set()).add(i)
            brand = d.get("brand")
            if brand:
                self.index_by_brand.setdefault(str(brand).lower(), set()).add(i)
            category = d.get("category")
            if category:
                self.index_by_category.setdefault(str(category).lower(), set()).add(i)
        if not any(self.corpus):
            logger.error("Corpus loaded is empty. Retrieval will produce no results.")

        if self._use_faiss:
            try:
                # Obtain embeddings (injected adapter preferred for testing)
                # local import of numpy to avoid requiring it when TF-IDF only
                import numpy as np
                try:
                    import faiss
                except Exception:
                    # If faiss isn't importable at runtime, trigger fallback
                    raise RuntimeError("FAISS not available at runtime")

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
                        # Import SentenceTransformer lazily to avoid requiring it at module import
                        try:
                            from sentence_transformers import SentenceTransformer
                        except Exception:
                            raise RuntimeError("sentence_transformers is not available")
                        self.model = SentenceTransformer(self.ft_model_name)
                        emb = self.model.encode(self.corpus, convert_to_numpy=True, show_progress_bar=False)

                emb = np.asarray(emb, dtype="float32")
                if emb.ndim == 1:
                    emb = np.expand_dims(emb, 0)
                # normalize and build index; support configurable index types
                faiss.normalize_L2(emb)
                dim = emb.shape[1]

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

    def _github_get_embeddings(self, texts: List[str]):
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

    def get_grounding_content(
        self,
        query: str,
        top_k: int = 3,
        category: str | None = None,
        price_range: tuple | None = None,
        tags: List[str] | None = None,
        persona_signals: Dict | None = None,
        segment_id: str | None = None,
        explain: bool = False,
        # optional per-request overrides for diversity tuning
        max_per_brand: int | None = None,
        max_per_category: int | None = None,
        novelty_threshold: float | None = None,
        enable_diversity: bool | None = None,
    ) -> List[Dict] | Dict:
        """Return top_k most relevant snippets for the query.

        Optional filters:
        - category: prefer docs in this product category
        - price_range: tuple(min_price, max_price) to filter by numeric `price` field
        - tags: list of tags to prefilter documents
        - persona_signals: dict with optional keys `brands` (list), `wants_discount` (bool), `recent_days` (int)

        Each returned item contains: id, title, text, source, score
        """
        if not query or not self.documents:
            return [] if not explain else {"retrieved_docs": [], "retrieval_context": [], "candidate_stats": {}}

        # Prepare observability record
        obs = {
            "query": query,
            "query_hash": hashlib.sha256(query.encode("utf-8")).hexdigest()[:8],
            "backend": "tfidf",
            "latency_ms": None,
            "top_ids": [],
        }

        # Apply simple prefiltering on the documents list based on provided filters
        candidate_doc_indices = None
        if category or price_range or tags:
            candidate_doc_indices = []
            for i, d in enumerate(self.documents):
                keep = True
                if category:
                    doc_cat = (d.get("category") or d.get("tags") or "").lower()
                    if category.lower() not in doc_cat:
                        keep = False
                if keep and price_range and d.get("price") is not None:
                    try:
                        p = float(d.get("price"))
                        low, high = price_range
                        if low is not None and p < low:
                            keep = False
                        if high is not None and p > high:
                            keep = False
                    except Exception:
                        # if price parsing fails, exclude doc from price-filtered set
                        keep = False
                if keep and tags:
                    doc_tags = [t.lower() for t in (d.get("tags") or [])]
                    if not any(t.lower() in doc_tags for t in tags):
                        keep = False
                if keep:
                    candidate_doc_indices.append(i)

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

                # If we have explicit candidate_doc_indices from filters, intersect
                if candidate_doc_indices is not None:
                    if candidate_indices is not None:
                        # intersect and preserve order from candidate_indices
                        candidate_indices = [ci for ci in candidate_indices if ci in candidate_doc_indices]
                    else:
                        candidate_indices = candidate_doc_indices

                # Local imports for numpy/faiss to avoid requiring them at module import time
                try:
                    import numpy as np
                    import faiss
                except Exception:
                    raise RuntimeError("FAISS runtime components are not available")

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

                # Normalize base scores before applying boosts
                results = self._normalize_scores(results)

                # Apply persona-based re-ranking if requested
                if persona_signals:
                    results = self._persona_rerank(results, persona_signals)

                # Apply segment-aware boosts if requested (use rules from SEGMENT_RULES)
                if segment_id:
                    results = self._apply_segment_boost(results, segment_id, persona_signals)

                # Resolve per-request diversity knobs (override settings if provided)
                eff_enable_div = enable_diversity if enable_diversity is not None else settings.RETRIEVER_ENABLE_DIVERSITY_POSTPROCESSING
                eff_max_brand = max_per_brand if max_per_brand is not None else settings.RETRIEVER_MAX_PER_BRAND
                eff_max_cat = max_per_category if max_per_category is not None else settings.RETRIEVER_MAX_PER_CATEGORY
                eff_novelty = novelty_threshold if novelty_threshold is not None else settings.RETRIEVER_NOVELTY_THRESHOLD
                # Resolve settings_used (always build for reproducibility/telemetry)
                settings_used = {
                    "enable_diversity": bool(eff_enable_div),
                    "enable_novelty_dedup": bool(settings.RETRIEVER_ENABLE_NOVELTY_DEDUP),
                    "max_per_brand": eff_max_brand,
                    "max_per_category": eff_max_cat,
                    "novelty_threshold": eff_novelty,
                    "segment_boosts_enabled": bool(settings.RETRIEVER_USE_SEGMENT_RULE_BOOSTS),
                }

                # Post-process for diversity/novelty if enabled
                if eff_enable_div:
                    results = self._diversity_postprocess(
                        results,
                        max_per_brand=eff_max_brand,
                        max_per_category=eff_max_cat,
                        novelty_threshold=eff_novelty,
                        settings_used=settings_used,
                    )

                # Attach settings_used to observability for analytics and reproducibility
                obs["settings_used"] = settings_used
                obs["settings_used_str"] = self._format_settings_for_telemetry(settings_used)

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

        # If filters produced candidate_doc_indices, restrict ranking to that set
        if candidate_doc_indices is not None:
            # Sort only the candidate docs by their cosine similarity
            cand = list(candidate_doc_indices)
            cand_sorted = sorted(cand, key=lambda i: float(cosine_similarities[int(i)]), reverse=True)
            top_indices = cand_sorted[:top_k]
        else:
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

        # Normalize and apply persona/segment boosts
        results = self._normalize_scores(results)
        if persona_signals:
            results = self._persona_rerank(results, persona_signals)
        if segment_id:
            results = self._apply_segment_boost(results, segment_id, persona_signals)

        # Resolve per-request diversity knobs (override settings if provided)
        eff_enable_div = enable_diversity if enable_diversity is not None else settings.RETRIEVER_ENABLE_DIVERSITY_POSTPROCESSING
        eff_max_brand = max_per_brand if max_per_brand is not None else settings.RETRIEVER_MAX_PER_BRAND
        eff_max_cat = max_per_category if max_per_category is not None else settings.RETRIEVER_MAX_PER_CATEGORY
        eff_novelty = novelty_threshold if novelty_threshold is not None else settings.RETRIEVER_NOVELTY_THRESHOLD
        # Resolve settings_used (always build for reproducibility/telemetry)
        settings_used = {
            "enable_diversity": bool(eff_enable_div),
            "enable_novelty_dedup": bool(settings.RETRIEVER_ENABLE_NOVELTY_DEDUP),
            "max_per_brand": eff_max_brand,
            "max_per_category": eff_max_cat,
            "novelty_threshold": eff_novelty,
            "segment_boosts_enabled": bool(settings.RETRIEVER_USE_SEGMENT_RULE_BOOSTS),
        }

        if eff_enable_div:
            results = self._diversity_postprocess(
                results,
                max_per_brand=eff_max_brand,
                max_per_category=eff_max_cat,
                novelty_threshold=eff_novelty,
                settings_used=settings_used,
            )

        # Persist observability for TF-IDF path as well
        obs["backend"] = obs.get("backend", "tfidf")
        # attach settings used for telemetry/analytics
        obs["settings_used"] = settings_used
        obs["settings_used_str"] = self._format_settings_for_telemetry(settings_used)
        obs["latency_ms"] = int((time.time() - start) * 1000)
        obs["top_ids"] = [r.get("id") for r in results]
        self._last_query_observability = obs
        try:
            if analytics is not None:
                analytics.log_a_b_result(obs)
        except Exception:
            logger.exception("Failed to persist observability row via analytics.log_a_b_result")
        # If explain mode requested, return richer structure for debugging
        if explain:
            retrieval_context = [ (r.get("text") or "")[:200] for r in results ]
            candidate_stats = {"candidate_count": len(candidate_doc_indices) if candidate_doc_indices is not None else len(self.documents), "backend": obs.get("backend")}
            return {"retrieved_docs": results, "retrieval_context": retrieval_context, "candidate_stats": candidate_stats}
        return results

    def _normalize_scores(self, results: List[Dict]) -> List[Dict]:
        """Normalize the base scores to 0..1 range (min-max) to make boosts comparable."""
        if not results:
            return results
        scores = [float(r.get("score", 0.0)) for r in results]
        lo = min(scores)
        hi = max(scores)
        if hi - lo <= 1e-9:
            # all scores equal — map to 0.5
            for r in results:
                r["score"] = 0.5
            return results
        for r in results:
            r["score"] = (float(r.get("score", 0.0)) - lo) / (hi - lo)
        return results

    def _apply_segment_boost(self, results: List[Dict], segment_id: str, persona_signals: Dict | None = None) -> List[Dict]:
        """Apply lightweight segment-aware boosts.

        The function returns documents with an optional `_segment_boosts` dict
        inside an `explain` field when available. Boost magnitudes are small
        (0..0.3) and intended to be tuned.
        """
        if not results:
            return results

        def segment_boost_for_doc(doc, seg, persona_signals_inner: Dict | None = None):
            boost = 0.0
            d = next((x for x in self.documents if x.get("id") == doc.get("id")), None)
            if not d:
                return boost, {}
            reasons = {}
            # Use SEGMENT_RULES to determine boosts where possible
            seg_rule = SEGMENT_RULES.get(seg, {})

            # 1) Priority-based small base boost (scaled and capped)
            priority = seg_rule.get("priority")
            if isinstance(priority, (int, float)):
                base_boost = min(float(priority) / 40.0, 0.25)
                if base_boost > 0:
                    boost += base_boost
                    reasons["priority"] = round(base_boost, 3)

            # 2) product_focus: if the doc's category or tags match the product_focus string
            product_focus = seg_rule.get("product_focus")
            if product_focus:
                try:
                    cat = (d.get("category") or "").lower()
                    tags = [t.lower() for t in (d.get("tags") or [])] if d.get("tags") else []
                    if product_focus.lower() in cat or any(product_focus.lower() in t for t in tags):
                        boost += 0.15
                        reasons["product_focus"] = 0.15
                except Exception:
                    pass

            # 3) must_include: if any required phrase appears in title or text
            must_include = seg_rule.get("must_include") or []
            if must_include and (d.get("title") or d.get("text")):
                txt = f"{d.get('title','')} {d.get('text','')}".lower()
                matched = 0
                for phrase in must_include:
                    try:
                        if phrase.lower() in txt:
                            matched += 1
                            reasons.setdefault("must_include", 0)
                            reasons["must_include"] += 0.08
                    except Exception:
                        continue
                if matched:
                    boost += min(0.08 * matched, 0.2)

            # 4) persona_signals from SEGMENT_RULES: e.g., preferred_brands True -> use provided persona_signals to boost matching brands
            seg_persona = seg_rule.get("persona_signals") or {}
            if seg_persona and persona_signals_inner:
                # If rule expects preferred_brands and persona_signals_inner provides brands, boost matches
                if seg_persona.get("preferred_brands") and persona_signals_inner.get("brands"):
                    brands = [b.lower() for b in persona_signals_inner.get("brands")]
                    if d.get("brand") and d.get("brand").lower() in brands:
                        boost += 0.2
                        reasons["brand_match"] = 0.2

            # 5) Fallback heuristics for classic segments (kept for compatibility)
            if seg == "bargain_hunter":
                if d.get("discount") or (d.get("original_price") and d.get("price") and float(d.get("price")) < float(d.get("original_price"))):
                    boost += 0.1
                    reasons.setdefault("discount_fallback", 0.0)
                    reasons["discount_fallback"] += 0.1
            if seg == "high_value":
                try:
                    price = float(d.get("price")) if d.get("price") is not None else 0.0
                    if price >= 100:
                        boost += 0.1
                        reasons.setdefault("price_fallback", 0.0)
                        reasons["price_fallback"] += 0.1
                except Exception:
                    pass
                if d.get("new_arrival") or d.get("is_new"):
                    boost += 0.05
                    reasons.setdefault("new_arrival_fallback", 0.0)
                    reasons["new_arrival_fallback"] += 0.05

            if seg == "power_user":
                if d.get("in_stock"):
                    boost += 0.05
                    reasons.setdefault("in_stock_fallback", 0.0)
                    reasons["in_stock_fallback"] += 0.05

            return boost, reasons

        for r in results:
            boost, reasons = segment_boost_for_doc(r, segment_id)
            # attach explain info if requested downstream
            if "explain" not in r:
                r["explain"] = {"boosts": {}, "segment_boost": 0.0}
            r["explain"]["segment_boost"] = boost
            r["explain"]["boosts"].update(reasons)
            r["score"] = float(r.get("score", 0.0)) + boost

        results = sorted(results, key=lambda x: x.get("score", 0.0), reverse=True)
        return results

    def _diversity_postprocess(self, results: List[Dict], max_per_brand: int = 2, max_per_category: int = 2, novelty_threshold: float = 0.8, settings_used: Dict | None = None) -> List[Dict]:
        """Post-process ranked results to enforce diversity and remove near-duplicates.

        - Caps number of items per brand and per category
        - Removes near-duplicate items based on simple Jaccard similarity
        - Attaches `explain.post_processing` metadata to surviving docs and a summary
        """
        if not results:
            return results

        kept = []
        removed_duplicates = []
        brand_counts = {}
        category_counts = {}

        def text_tokens(s: str):
            return set(w for w in (s or "").lower().split())

        for r in results:
            d = r
            doc_id = d.get("id")
            brand = (next((x.get("brand") for x in self.documents if x.get("id") == doc_id), None) or "").lower()
            category = (next((x.get("category") for x in self.documents if x.get("id") == doc_id), None) or "").lower()

            # brand cap
            bcount = brand_counts.get(brand, 0)
            if brand and bcount >= max_per_brand:
                removed_duplicates.append(doc_id)
                continue

            # category cap
            ccount = category_counts.get(category, 0)
            if category and ccount >= max_per_category:
                removed_duplicates.append(doc_id)
                continue

            # novelty: compare text tokens with already kept items; if very similar, drop
            is_dup = False
            toks = text_tokens(d.get("title") or "") | text_tokens(d.get("text") or "")
            for kept_doc in kept:
                kept_toks = text_tokens(kept_doc.get("title") or "") | text_tokens(kept_doc.get("text") or "")
                if not toks or not kept_toks:
                    continue
                inter = toks.intersection(kept_toks)
                jaccard = len(inter) / float(min(len(toks), len(kept_toks)))
                if jaccard >= novelty_threshold:
                    is_dup = True
                    break
            if is_dup:
                removed_duplicates.append(doc_id)
                continue

            # Keep
            kept.append(d)
            brand_counts[brand] = brand_counts.get(brand, 0) + 1
            category_counts[category] = category_counts.get(category, 0) + 1

        # enrich explain fields for kept docs with post_processing summary
        post_proc = {
            "diversity_filter": True,
            "removed_duplicates": removed_duplicates,
            "brand_caps": brand_counts,
            "category_caps": category_counts,
        }

        # Attach settings_used so downstream analytics can reproduce the exact
        # retrieval configuration that produced these post-processing results.
        post_proc["settings_used"] = settings_used or {
            "enable_diversity": settings.RETRIEVER_ENABLE_DIVERSITY_POSTPROCESSING,
            "enable_novelty_dedup": settings.RETRIEVER_ENABLE_NOVELTY_DEDUP,
            "max_per_brand": max_per_brand,
            "max_per_category": max_per_category,
            "novelty_threshold": novelty_threshold,
            "segment_boosts_enabled": settings.RETRIEVER_USE_SEGMENT_RULE_BOOSTS,
        }

        for k in kept:
            if "explain" not in k:
                k["explain"] = {"boosts": {}, "persona_boost": 0.0}
            k["explain"]["post_processing"] = post_proc

        return kept

    def get_last_observability(self):
        """Public getter for the last query observability record (or None)."""
        return self._last_query_observability


    def _format_settings_for_telemetry(self, settings_used: Dict) -> str:
        """Create a compact, telemetry-friendly string from the settings_used dict.

        Produces a stable, sorted comma-separated `k=v` string where floats are
        rounded to 3 decimal places. This helps downstream analytics ingest a
        compact representation alongside the full dict.
        """
        if not settings_used:
            return ""
        parts = []
        for k in sorted(settings_used.keys()):
            v = settings_used[k]
            try:
                if isinstance(v, float):
                    parts.append(f"{k}={v:.3f}")
                else:
                    parts.append(f"{k}={v}")
            except Exception:
                parts.append(f"{k}={str(v)}")
        return ",".join(parts)


    def _persona_rerank(self, results: List[Dict], persona_signals: Dict) -> List[Dict]:
        """Lightweight re-ranker that boosts documents matching persona signals.

        persona_signals may include:
        - 'brands': list of preferred brands
        - 'wants_discount': bool
        - 'recent_days': int - prefer recently published docs
        """
        if not results:
            return results

        brands = [b.lower() for b in persona_signals.get("brands", [])] if persona_signals.get("brands") else []
        wants_discount = bool(persona_signals.get("wants_discount"))
        recent_days = persona_signals.get("recent_days")

        def score_boost(doc):
            boost = 0.0
            reasons = {}
            d = next((x for x in self.documents if x.get("id") == doc.get("id")), None)
            if not d:
                return boost, reasons
            # Brand match
            if brands and d.get("brand") and d.get("brand").lower() in brands:
                reasons["brand"] = 0.25
                boost += 0.25
            # Discount match: document has a 'discount' field or 'price' vs 'original_price'
            if wants_discount and (d.get("discount") or (d.get("original_price") and d.get("price") and float(d.get("price")) < float(d.get("original_price")))):
                reasons["discount"] = 0.2
                boost += 0.2
            # Recency: if doc has 'published_at' or 'last_updated'
            if recent_days and (d.get("published_at") or d.get("last_updated")):
                try:
                    from datetime import datetime, timedelta

                    date_str = d.get("published_at") or d.get("last_updated")
                    # Expect ISO format; best-effort parse
                    dt = datetime.fromisoformat(date_str)
                    if datetime.utcnow() - dt <= timedelta(days=int(recent_days)):
                        reasons["recency"] = 0.15
                        boost += 0.15
                except Exception:
                    pass
            return boost, reasons

        # Apply boosts and attach explain info per doc
        for r in results:
            b, reasons = score_boost(r)
            r["_boost"] = b
            # ensure explain structure exists (merged later with segment explain)
            if "explain" not in r:
                r["explain"] = {"boosts": {}, "persona_boost": 0.0}
            r["explain"]["persona_boost"] = b
            r["explain"]["boosts"].update(reasons)
            r["score"] = float(r.get("score", 0.0)) + b

        results = sorted(results, key=lambda x: x.get("score", 0.0), reverse=True)
        for r in results:
            r.pop("_boost", None)
        return results



def _quick_demo():
    r = Retriever()
    print(r.get_grounding_content("payment plans", top_k=3))


if __name__ == "__main__":
    _quick_demo()
