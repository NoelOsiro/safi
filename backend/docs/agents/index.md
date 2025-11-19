# Agents — Index

This folder contains one document per agent. Each agent doc describes purpose, API/contract, internal behavior, observability, testing guidance, and extension patterns.

Files:

- `segmentation.md` — detailed spec and implementation notes for the rule-based `SegmentationAgent`.
- `retrieval.md` — retriever design, filters, inverted indexes, TF-IDF/FAISS behavior, persona re-ranker.
- `generation.md` — LLM adapter design, template fallback, test hooks. (Updated: now documents the node-style `generation_node(state)` inputs/outputs including `persona_signals`, `routing_hint`, and `offers_metadata` -> `model_metadata.trace_id` propagation.)
- `safety.md` — safety classification contract, rewrite/blocking logic, testing.
- `delivery.md` — delivery adapter patterns and channel-specific notes.
- `analytics.md` — observability API, recommended row schema and non-blocking behavior.

State keys (shared across agents)

- `retrieval_context` (str): combined snippets from retrieval used to ground generation.
- `segment` (str or dict): auditable segment output (dict may include `segment_id`, `trigger_reason`, `segmenter_confidence`, `segmenter_version`, `rule_applied`, and optional `routing_hint`).
- `customer_profile` (dict): profile fields (tiers, `preferred_category`, `preferred_brands`).
- `behavior_summary` (dict): derived behavior signals used by segmentation and retrieval.
- `persona_signals` (dict, optional): persona-level hints passed between retrieval/offers/generation.
- `routing_hint` (str, optional): explicit routing shortcut; nodes may short-circuit based on this value.
- `offers_metadata` (dict, optional): offers node attaches explainable metadata (including `trace_id`) which is propagated to `generation_node.model_metadata`.
- `retrieved_docs` (list): documents returned by the retriever service (each doc contains `id`, `title`, `text`, `score`, and metadata).
- `answer` (str): final generated message produced by `generation_node`.
- `model_metadata` (dict): generation metadata (e.g., `model_used`, optional `trace_id`).

Open any file above for the full details.
