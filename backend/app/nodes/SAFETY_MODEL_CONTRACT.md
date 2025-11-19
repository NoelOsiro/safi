Safety model contract
=====================

Location
--------

This file documents the contract for the optional safety/moderation model used by `safety_node` in `app/nodes/safety_node.py`.

Why
---

`safety_node` supports a pluggable "safety model" to perform moderation or classifier checks. Tests in `tests/test_safety_node.py` monkeypatch `_load_safety_model` to inject a DummyModel. This document explains the minimal interface a real model should implement so integration is straightforward.

Loader hook: `_load_safety_model()`
--------------------------------

- Purpose: lazily return an object representing a safety/moderation model client.
- Location: `app/nodes/safety_node.py` defines `_load_safety_model()`; production code should replace this with a loader that returns a client instance.
- Behavior: if `_load_safety_model()` returns `None`, the `safety_node` will skip model checks (fail-open). If it returns an object, `safety_node` will call its `.invoke(payload)` method.

Model contract
--------------

The returned model object must implement:

- `invoke(payload)` -> response object

The `payload` will be a plain Python `dict` with at least these keys:

- `text` (str): the assistant-generated answer to inspect
- `user` (optional): the original user dict from the workflow state
- `retrieval_context` (optional): string or structured retrieval context

The `response` object must have a `content` attribute (string) containing JSON. The JSON must parse to an object with some or all of the following fields (booleans/strings):

- `contains_pii` (bool) — whether the text contains PII
- `contains_hate` (bool)
- `contains_self_harm` (bool)
- `contains_violence` (bool)
- `contains_toxic_language` (bool)
- `is_hallucination` (bool)
- `needs_blocking` (bool) — whether the text must be blocked/removed
- `explanation` (str) — optional human-readable reason

Example JSON response (string in `.content`):

```json
{
  "contains_pii": false,
  "is_hallucination": false,
  "needs_blocking": false,
  "explanation": "Text is safe"
}
```

What `safety_node` does with model output
-----------------------------------------

- Merges model-supplied booleans into the node's `safety_metadata.flags` list.
- If `needs_blocking` is true, the node will replace the assistant answer with a safe refusal: "I'm sorry, I cannot provide that content." and mark `safety_metadata.rewritten = True`.
- If the model is unavailable or fails, the node logs the error and proceeds using local rule-based checks (PII redaction, pricing/hallucination detection).

Testing / Dummy model
---------------------

Unit tests patch `_load_safety_model` to return a simple dummy implementing the `invoke` contract. Example pattern used in tests:

```py
class DummyResp:
    def __init__(self, content: str):
        self.content = content

class DummyModel:
    def __init__(self, response_text: str):
        self._response_text = response_text

    def invoke(self, messages):
        # messages is the payload dict described above
        return DummyResp(self._response_text)

# tests monkeypatch: monkeypatch.setattr('app.nodes.safety_node._load_safety_model', lambda: DummyModel(json))
```

Notes
-----

- Keep the model invocation simple and idempotent — `safety_node` does not retry the model nor send streaming payloads.
- Prefer returning a minimal JSON response as shown above. Additional diagnostic keys are allowed and will be ignored by the node unless they match expected names.
- Implementations may enrich `safety_metadata.explanation` when present.

Questions or changes
--------------------

If you'd like this contract extended (for example to support per-flag confidence scores or structured reasons), I can update `safety_node` and tests to reflect a richer schema.
