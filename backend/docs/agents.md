# Agents — Index

This folder contains one document per agent. Each agent doc describes purpose, API/contract, internal behavior, observability, testing guidance, and extension patterns.

Files:

- `segmentation.md` — detailed spec and implementation notes for the rule-based `SegmentationAgent`.
- `retrieval.md` — retriever design, filters, inverted indexes, TF-IDF/FAISS behavior, persona re-ranker.
- `generation.md` — LLM adapter design, template fallback, test hooks.
- `safety.md` — safety classification contract, rewrite/blocking logic, testing.
- `delivery.md` — delivery adapter patterns and channel-specific notes.
- `analytics.md` — observability API, recommended row schema and non-blocking behavior.

Open any file above for the full details.
