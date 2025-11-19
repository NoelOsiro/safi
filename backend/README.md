# SAFI — Retail Rebrand Backend (summary)

This repository contains a small, modular backend designed for a retail-focused conversational assistant (RAG + safety + personalization). The implementation is deliberately lightweight for local development and CI while allowing optional, production-grade vector backends (FAISS/GitHub models).

## **Quick status**

- **Language:** Python 3.12
- **Working dir:** `backend/`
- **Virtualenv:** `backend/.venv` (recommended)
- **Tests:** small pytest scripts + smoke tests included under `backend/tests/`

## **What we implemented**

Below is a concise breakdown of the main components we've added, what they do, and how to use/tune them.

- **Typed runtime state** (`app/state/workflow_state.py`)
  - Purpose: provide a small, explicit typed shape for state that flows through the graph. Two TypedDicts are defined:
    - `BehaviorSummary`: normalized retail signals (views_last_7d, cart_events_last_7d, purchases_last_30d, avg_order_value, last_purchase_days_ago, conversion_rate) plus derived scores (`cart_abandon_rate`, `recency_score`, `frequency_score`, `monetary_score`).
    - `WorkflowState`: top-level state keys used by nodes (incoming `user`, `customer_profile` plus derived `behavior_summary`, `segment`, `segment_reason`, `segment_scores`, and downstream fields like `retrieved_docs`, `answer`, `final_response`).
  - Why: TypedDicts make it explicit what nodes expect and return, simplify testing, and make the pipeline easier to reason about.

  Shared runtime state keys (common across nodes)

  - `retrieval_context` (str): combined snippets from retrieval used to ground generation.
  - `segment` (str or dict): auditable segment output (dict may include `segment_id`, `trigger_reason`, `segmenter_confidence`, `segmenter_version`, `rule_applied`, and optional `routing_hint`).
  - `customer_profile` (dict): profile fields (tiers, preferred_category, preferred_brands).
  - `behavior_summary` (dict): derived behavior signals used by segmentation and retrieval.
  - `persona_signals` (dict, optional): persona-level hints passed between retrieval/offers/generation.
  - `routing_hint` (str, optional): explicit routing shortcut; nodes may short-circuit based on this value.
  - `offers_metadata` (dict, optional): offers node attaches explainable metadata (including `trace_id`) which is propagated to `generation_node.model_metadata`.
  - `retrieved_docs` (list): documents returned by the retriever service (each doc contains `id`, `title`, `text`, `score`, and metadata).
  - `answer` (str): final generated message produced by `generation_node`.
  - `model_metadata` (dict): generation metadata (e.g., `model_used`, optional `trace_id`).

- **Segmentation (retail-aware)** (`app/nodes/segmentation_node.py`)
  - Purpose: compute a compact RFM-like `behavior_summary` and map customers to a small, auditable set of segments such as `high_value`, `cart_abandoner`, `frequent_browser`, `recent_purchaser`, `one_time_buyer`, `churn_risk`, `new_user`, or `general`.
  - Key behavior:
    - Prefer structured `customer_profile` aggregates (views, carts, purchases, aov, last purchase age).
    - Fallback to minimal heuristics when structured metrics are not present.
    - Compute derived signals (conversion_rate, cart_abandon_rate) and normalized scores (recency, frequency, monetary).
    - Apply priority-ordered, auditable rules so the output is easy to inspect and explain.
  - Traceability: the node is decorated with a `@traceable` wrapper (LangSmith integration) with a no-op fallback for environments that don't have the `langsmith` package.
  - Tune: thresholds (e.g., what counts as `high_value` or `frequent_browser`) are in-code for now — move these into config/env if you want runtime tuning.

- **Retriever service** (`app/services/retriever.py`)
  - Purpose: provide a production-capable retriever with a developer-friendly default.
  - Default path: TF-IDF via `scikit-learn` (fast to install and reliable in CI). This is used whenever FAISS or GitHub Models are unavailable.
  - Optional backends:
    - FAISS + `sentence-transformers` for dense vector search (preferred for production retrieval quality). NOTE: FAISS often requires `conda` installs on Windows; see the next steps section.
    - GitHub Models embeddings via `requests` (if `RETRIEVER_BACKEND=github_models` and `GITHUB_TOKEN` are present).
  - Resilience & observability:
    - Lazy-imports for heavy native libraries so the module imports in lightweight dev envs.
    - If the configured `data_path` is missing, the retriever warns and continues with an empty corpus (tests will not crash).
    - `get_grounding_content(query, top_k)` returns a list of dicts with `id`, `title`, `text`, `source`, and `score` for the top results and records a small observability object for logging/analytics.
  - Configurable via env vars: `RETRIEVER_BACKEND`, `EMBED_MODEL`, `RETRIEVER_INDEX_PATH`, `HYBRID_PREFILTER_TOPK`, `FAISS_INDEX_TYPE`, etc.

- **Personalized retrieval node** (`app/nodes/retrieval_node.py`)
  - Purpose: translate segmentation + behavior signals into a retrieval query that biases results toward personalization and conversion.
  - What it uses from state:
    - `user.message` — the actual user query
    - `segment` — to select focus (e.g., abandoned-cart help vs discovery content)
    - `behavior_summary` — to emphasize recent views, cart activity, or purchases
    - `customer_profile` (optional) — category/brand preferences and other product-level signals
  - How it influences retrieval:
    - The node constructs a multi-line text query combining user intent, segment instructions (e.g., "Focus: abandoned cart items"), and preferences. This is sent to the retriever where TF-IDF or a vector index ranks content.
    - You can extend the node to apply explicit boosting during prefiltering or to re-rank by brand/category (we currently implement guidance in the text query to the retriever; re-ranking can be added if needed).
  - Outputs:
    - `retrieved_docs`: raw list of doc dictionaries returned from the retriever.
    - `retrieval_context`: a combined, human-readable text summary of the top docs (used by the generation node as grounding/context).

- **Smoke tests**
  - Quick scripts that validate behavior without heavy external dependencies:
    - `tests/run_seg_test.py` — runs `segmentation_node` with a sample `customer_profile` and prints the resulting `behavior_summary` and `segment`.
    - `tests/run_retrieval_test.py` — runs `retrieval_node` with a sample state; demonstrates how the retriever behaves with and without a populated corpus.

## **Design decisions & notes**

- Use TF-IDF (scikit-learn) as a portable default so CI/dev environments don't require FAISS or large model installs.
- Optional heavy deps (`sentence-transformers`, `faiss`) are lazy-imported only when the FAISS path is used. For Windows/CI, prefer `conda`/`conda-forge` for FAISS.
- `langsmith` tracing decorators are used where available; code provides a no-op fallback so nodes import and run in minimal environments.
- Retrievers are tolerant of a missing `data/irs_content.json` (they warn and continue with empty corpus) so tests do not fail when the dataset is absent.

## **How to run the smoke tests locally**

A. From the `backend` directory, set `PYTHONPATH` and run the segmentation smoke test:

```powershell
$env:PYTHONPATH = '.'; python tests/run_seg_test.py
```

B. Run the retrieval smoke test:

```powershell
$env:PYTHONPATH = '.'; python tests/run_retrieval_test.py
```

Both tests run without FAISS or large model installs; retrieval will show warnings about a missing corpus unless you add `backend/data/irs_content.json`.

## **Next recommended steps**

## Segment Rules

The pipeline uses a shared `SEGMENT_RULES` mapping to steer generation and
retrieval based on behavior-driven personas. The canonical definition lives in
`app/config/segment_rules.py` and includes keys such as:

- `tone`: friendly description of tone for the persona
- `must_include`: required message elements (e.g., `discounts`, `loyalty appreciation`)
- `product_focus`: helps retrieval decide which product sets to prioritize
- `cta`: suggested call-to-action

To extend or add a new persona, update `app/config/segment_rules.py` with a
new entry. Nodes like `generation_node` and `retrieval_node` import this
module to apply persona rules consistently across the graph.

- Implement the `generation_node` to produce persona- and segment-aware responses (tone, offers, product mentions). (I can implement this next.)
- Add unit tests for multiple segmentation scenarios and tuning thresholds.
- (Optional) Add CI: GitHub Actions workflow to run tests on push/PR using a light Python matrix.
- (Optional) Provide a README/dev-setup guide describing how to install optional vector backends (`conda install -c conda-forge faiss-cpu sentence-transformers`) and how to pre-build/persist FAISS indices.

If you want, I can now implement the generation node (personalized tone and offers) so we can exercise end-to-end behavior: user -> segmentation -> retrieval -> generation -> safety -> response.
