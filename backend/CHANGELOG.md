# Changelog

## Unreleased

- Docs: Align agent docs and README to the shared `WorkflowState` contract.
  - `docs/agents/generation.md` updated to document the node-style interface `generation_node(state)` and explicit state keys consumed/produced (`retrieval_context`, `segment`, `persona_signals`, `routing_hint`, `offers_metadata` -> `model_metadata.trace_id`, `answer`, `model_metadata`).
  - `docs/agents/retrieval.md` updated with a `State keys` section describing what the retriever reads and writes (`retrieved_docs`, `retrieval_context`).
  - `docs/agents/segmentation.md` updated with a `State keys` section describing the auditable `segment` dict and `routing_hint` usage.
  - `README.md` updated with a concise `Shared runtime state keys` section so the top-level docs match agent contracts.

These changes are documentation-only and do not modify runtime behavior.
