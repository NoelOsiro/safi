# Retrieval Agent

Location: `app/services/retriever.py` and `app/nodes/retrieval_node.py`.

Purpose

- Fetch vendor, catalog, and marketing copy grounded in customer segment and persona signals. Return:
  - `retrieved_docs`: list of docs with `id, title, text, metadata`
  - `retrieval_context`: short snippets used for generation grounding

State keys (used / produced)

- Reads from state keys: `segment`, `customer_profile`, `behavior_summary`, and optional `persona_signals` to bias queries and re-ranking.
- Produces / attaches to state: `retrieved_docs` (list of doc dicts) and `retrieval_context` (string) used by `generation_node` as grounding.
- These keys are part of the shared `WorkflowState` used across the pipeline (see `app/state/workflow_state.py`).

Core features

- TF-IDF default ranking via `scikit-learn` with optional FAISS + sentence-transformers for embeddings.
- Structured prefilters: `category`, `price_range`, `tags`, `brand`.
- Inverted indexes for fast tag/brand/category candidate selection.
- Persona-aware re-ranker that boosts documents matching `persona_signals`.

API

- `get_grounding_content(query, top_k=3, category=None, price_range=None, tags=None, persona_signals=None)`

Design notes

- Build inverted indexes at startup using `data/` test fixtures or live catalog ingestion.
- Lazy-import heavy deps so local dev doesn't require FAISS.
- When filters are provided, first restrict to candidate ids, then compute TF-IDF/embedding scores only on that subset.

Testing

- Use `data/sample_irs_content.json` for deterministic integration tests.
- Validate that persona boosts change ordering as expected when `persona_signals` contains `preferred_brands` or `discount_seeking=true`.

 Retrieval Agent

Location: `app/services/retriever.py` (service) and `app/agents/retrieval` (adapter)

Purpose

- Provide document grounding for Generation and Safety nodes. Support TF-IDF baseline and optional dense vector backends (FAISS + sentence-transformers or external embeddings).

Contract / API

- `get_grounding_content(query: str, top_k: int = 3, category: str|None = None, price_range: tuple|None = None, tags: List[str]|None = None, persona_signals: Dict|None = None) -> List[Dict]`.
  - Each dict contains `id`, `title`, `text`, `source`, `score` and optional metadata fields (`brand`, `price`, `category`, `discount`, `published_at`).

Key features implemented in the service

- TF-IDF baseline (scikit-learn) for portable local testing and CI.
- Optional FAISS-backed dense index (lazy import) for production-grade retrieval.
- Hybrid prefiltering: TF-IDF can prefilter a candidate set before FAISS ranking.
- Inverted indexes (tags, brands, categories) built at index time for efficient structured filtering.
- Structured filtering: `category`, `price_range`, `tags` are used to produce a candidate set that restricts subsequent ranking.
- Persona re-ranker: simple additive boosts to surface docs matching `persona_signals` (preferred `brands`, `wants_discount`, recency).

Filtering strategy

- Use inverted indexes to compute candidate doc ids for `tags`, `brands`, `category`. Intersect candidate sets to narrow results quickly.
- If no inverted index match or filters are empty, fall back to full TF-IDF ranking or FAISS search.
- Price filter checks document `price` and `original_price` fields if present.

Re-ranking

- `_persona_rerank(results, persona_signals)` applies small additive boosts to documents that match brand, discount, and recency signals.
- The function updates `score` and sorts results by boosted score.

Observability

- The service emits an observability record (backend used, latency_ms, top_ids). The pipeline logs or forwards this row to `analytics` if configured.

## **Retrieval Tuning Knobs**

- `RETRIEVER_ENABLE_DIVERSITY_POSTPROCESSING`: enable/disable diversity and novelty post-processing.
- `RETRIEVER_ENABLE_NOVELTY_DEDUP`: enable simple novelty-based duplicate removal.
- `RETRIEVER_MAX_PER_BRAND`: integer cap for items per brand in the final results.
- `RETRIEVER_MAX_PER_CATEGORY`: integer cap for items per category in the final results.
- `RETRIEVER_NOVELTY_THRESHOLD`: float (0..1) controlling Jaccard-based novelty dedup sensitivity.
- `RETRIEVER_USE_SEGMENT_RULE_BOOSTS`: enable reading segment-specific boost rules from `SEGMENT_RULES`.

These knobs are available as runtime settings in `app/config/settings.py` and can be overridden per-request by passing the following optional parameters to `get_grounding_content`:

- `max_per_brand`, `max_per_category`, `novelty_threshold`, `enable_diversity`

For analytics and reproducibility, the service attaches a `settings_used` map (and a compact `settings_used_str`) to the per-request observability record so downstream systems can reproduce the exact configuration that produced the results.

Testing guidance

- Provide a small sample corpus (see `data/sample_irs_content.json`) with `brand`, `tags`, `category`, `price` to test filtering and reranking.
- Inject a dummy embedding model or github adapter for FAISS tests.

Extension points

- Persist the inverted indexes to disk for faster startup on large corpora.
- Add weighted re-ranking (learn-to-rank) by exposing per-document features.
