# Generation Agent

Location: `app/nodes/generation_node.py` (node implementation).

Purpose

- Produce personalized marketing messages using a shared `WorkflowState` object that flows through the graph. The node reads from state keys (not a single prompt) and writes structured outputs consumed by downstream nodes.

Inputs (state keys read)

- `retrieval_context` (str): human-readable snippets assembled from retrieved documents used to ground the message.
- `segment` (str or dict): the auditable segment; a dict may include `segment_id` and an optional `routing_hint`.
- `customer_profile` (dict): profile fields such as `tier` / `loyalty_tier`, `preferred_category`, `preferred_brands`.
- `behavior_summary` (dict): derived behavior signals (views_last_7d, cart_events_last_7d, purchases_last_30d, etc.).
- `persona_signals` (dict, optional): downstream persona preferences (e.g., preferred brands, discount_seeking). Used for LLM hints or template logic.
- `routing_hint` (str, optional): explicit shortcut routing instruction; the node will include this in LLM guidance if present.
- `offers_metadata` (dict, optional): when present upstream, the node will propagate `offers_metadata.trace_id` into `model_metadata` for traceability.

Outputs (state keys written / returned)

- `answer` (str): the final generated message (LLM output or template fallback).
- `model_metadata` (dict): metadata describing generation (e.g., `{ 'model_used': 'template'|'openai-chat', 'trace_id': '...' }`).

Modes

1. LLM-backed: call an external model (LangChain-style `ChatOpenAI` or `openai` SDK).
2. Template fallback: deterministic message assembly used when no LLM is available.

Recommended interface

- `generation_node(state: WorkflowState) -> Dict` returning a dict containing `answer` (str) and `model_metadata` (dict). The node is designed to receive a `WorkflowState`-shaped dict rather than a single prompt.

Design notes

- Provide a `_load_model()` hook so tests can inject a dummy model with an `invoke()` method.
- Build the prompt to include: persona tone (from `SEGMENT_RULES`), required elements, brief behavior lines, and `retrieval_context` snippets.
- The node prefers `_load_model()` return value; if not present it attempts `_call_openai_chat()` then falls back to `_template_generate()`.
- If `offers_metadata.trace_id` is present upstream the generation node copies it into `model_metadata['trace_id']` so traces and analytics can correlate offers -> generation -> delivery.

Template generator

- Uses `SEGMENT_RULES` to set tone, must-have lines, and CTA. Ensures messages remain concise (< ~120 words).

Testing

- Monkeypatch `_load_model()` or `_call_openai_chat()` to return deterministic responses.
- Validate that template messages include `CTA` or `discount` tokens for bargain-hunter personas.

Extension

- Add structured output support (JSON with `title`, `bullets`, `cta`) to make downstream rendering easier.
- Provide a re-ranking step over multiple candidate messages when using LLM ensembles.
