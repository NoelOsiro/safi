# Generation Agent

Location: `app/nodes/generation_node.py` and adapter interface in `app/agents/generation`.

Purpose

- Produce personalized marketing messages grounded in `retrieval_context`, `segment`, `customer_profile`, and `behavior_summary`.

Modes

1. LLM-backed: call an external model (LangChain-style `ChatOpenAI` or `openai` SDK).
2. Template fallback: deterministic message assembly used when no LLM is available.

Recommended interface

- `generate(prompt: str, metadata: Dict = None) -> Dict` returning `{ 'text': str, 'model': str, 'raw': Any }`.

Design notes

- Provide a `_load_model()` hook so tests can inject a dummy model with an `invoke()` method.
- Build the prompt to include: persona tone (from `SEGMENT_RULES`), required elements, brief behavior lines, and `retrieval_context` snippets.
- The node prefers `_load_model()` return value; if not present it attempts `_call_openai_chat()` then falls back to `_template_generate()`.

Template generator

- Uses `SEGMENT_RULES` to set tone, must-have lines, and CTA. Ensures messages remain concise (< ~120 words).

Testing

- Monkeypatch `_load_model()` or `_call_openai_chat()` to return deterministic responses.
- Validate that template messages include `CTA` or `discount` tokens for bargain-hunter personas.

Extension

- Add structured output support (JSON with `title`, `bullets`, `cta`) to make downstream rendering easier.
- Provide a re-ranking step over multiple candidate messages when using LLM ensembles.
