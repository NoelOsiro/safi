# Segmentation Agent

Location: `app/agents/segmentation/segmentation_agent.py`

Purpose

- Classify a user event or free-text message into a small, auditable set of retail segments (examples: `high_value`, `loyalist`, `power_user`, `bargain_hunter`, `cart_abandoner`, `frequent_browser`, `recent_purchaser`, `one_time_buyer`, `churn_risk`, `new_user`, `general`).

Principal goals

- Rule-based and explainable: every classification emits `rule_applied`, `trigger_reason`, and a `segmenter_confidence` so stakeholders can audit behavior and trace decisions in LangSmith.
- Deterministic and lightweight for local development and CI.
- Drop-in ML-replacement compatibility: keep the output contract stable so a model can replace the rule engine without graph changes.

API / Contract

- `classify_customer_event(event: Dict[str, Any]) -> Dict[str, Any]` — primary function. Accepts either a structured event dict or a free-text message (wrapped as `{ 'text': message }`). Returns an auditable dict with keys:
  - `segment_id` (str): canonical label
  - `trigger_reason` (str)
  - `segmenter_confidence` (float)
  - `segmenter_version` (str)
  - `rule_applied` (str)

- `SegmentationAgent.run(message_or_event)` — adapter that normalizes input and returns the same dict shape.

Internal behavior

- `_derive_behavior_summary(profile)` — extracts and normalizes signals. In addition to the original RFM fields, the agent now computes richer behavioral signals used by expanded segments:
  - `views_last_7d`, `cart_events_last_7d`, `purchases_last_30d`, `avg_order_value`, `last_purchase_days_ago`
  - Derived rates: `conversion_rate`, `cart_abandon_rate`
  - RFM heuristics: `recency_score`, `frequency_score`, `monetary_score`
  - New persona signals: `discount_view_rate`, `repeat_category_ratio`, `engagement_score`, `pages_per_session`, `conversion_rate_norm`

- `_decide_segment(behavior, profile)` — priority-ordered rule engine. Important design notes:
  - Rules are evaluated top → down. Add high-value / reactivation rules first and generic fallbacks last.
  - Each rule returns `(label, scores, reason)` where `scores` is a dict of the relevant numeric signals and `reason` is a concise human-readable explanation used in traces.
  - New high-level rules added: `loyalist`, `power_user`, `bargain_hunter`. Example priorities:
    1. `high_value` / `loyalist` / `power_user` (top)
    2. `churn_risk` / `dormant`
    3. `cart_abandoner` / `bargain_hunter`
    4. `frequent_browser` / `window_shopper`
    5. `new_user` / `general` (last)

- `_build_output(...)` — builds the auditable dict and logs the decision.

Rule-writing checklist (to safely add segments)

1. Define new behavioral signals in `_derive_behavior_summary()` if needed. Provide defensive defaults and input validation.

2. Insert the new rule into `_decide_segment()` at the correct priority (top → down). Use stable rule ids like `rule_loyalist_r1`.

3. Always return a clear `trigger_reason` string explaining the match.

4. Keep `scores` informative — include the numeric signals used to compute the decision (helps debugging and traceability).

5. Add unit tests that craft a minimal `profile` to trigger the new rule deterministically.

Examples (drop-in snippets)

Behavior signals to add:

```python
behavior["discount_view_rate"] = profile.get("discount_view_events", 0) / max(profile.get("views_total", 1), 1)
behavior["repeat_category_ratio"] = 1.0 - (len(set(profile.get("categories_last_10_views", []))) / max(len(profile.get("categories_last_10_views", [])), 1))
behavior["engagement_score"] = profile.get("views_last_7d", 0) + profile.get("cart_events_last_7d", 0)
behavior["pages_per_session"] = float(profile.get("pages_per_session", 0))
behavior["conversion_rate_norm"] = _normalize_score(behavior.get("conversion_rate", 0.0), max_val=1.0)
```

Rule examples (insert at appropriate priority):

```python
# Loyalist
if behavior.get("recency_score", 0) > 0.8 and behavior.get("frequency_score", 0) > 0.7:
    return (
        "loyalist",
        scores,
        "High repeat purchase activity with strong recency",
        "rule_loyalist_r1",
    )

# Power user
if behavior.get("engagement_score", 0) >= 30 and behavior.get("pages_per_session", 0) >= 5 and behavior.get("conversion_rate_norm", 0) >= 0.05:
    return (
        "power_user",
        scores,
        "High engagement and efficient conversion",
        "rule_power_r1",
    )

# Bargain hunter
if behavior.get("discount_view_rate", 0) > 0.4 and behavior.get("cart_abandon_rate", 0) > 0.3:
    return (
        "bargain_hunter",
        scores,
        "Frequent discount page views with price-sensitive abandonment",
        "rule_bargain_r1",
    )
```

Tone & personalization mapping (downstream hints)

- The segmentation agent emits only `segment_id` and should not generate text. To make downstream generation deterministic and persona-aware, update `app/config/segment_rules.py` with per-segment hints used by `generation_node`:

```python
SEGMENT_RULES["loyalist"] = {
    "tone": "warm, grateful, exclusive",
    "must_include": ["loyalty appreciation"],
    "cta": "exclusive previews / offers",
    "preferred_length": "short",
    "persona_signals": {"preferred_brands": True},
}
```

Testing

- Unit tests: craft minimal `profile` dicts that deterministically trigger each rule. Assert:
  - `segment_id` equals expected label
  - `rule_applied` starts with the expected `rule_` prefix
  - `segmenter_confidence` is a float between 0.0 and 1.0
  - `trigger_reason` is a non-empty string

- Compatibility test (recommended): assert `SegmentationAgent.run()` always returns the contract keys: `segment_id`, `trigger_reason`, `segmenter_confidence`, `rule_applied` so ML replacements remain drop-in.

Observability

- Keep `trigger_reason` concise — it's surfaced in LangSmith traces and logs. Include the key numeric drivers (e.g., "High engagement (views=40, pps=6)").

Notes & migration

- When adding segments, prefer small, testable, deterministic rules first. If you later add an ML replacement, ensure it produces the same auditable fields and add a migration test that compares the rule-engine outputs to the ML outputs on a seeded dataset.

Contact

- For questions about thresholds or production tuning, see `app/config/settings.py` where many thresholds are configurable.

Final refinements

Confidence strategy

- `segmenter_confidence` is deterministic for the rule-based engine. Use fixed confidences per priority band to preserve auditability and ease comparison with ML outputs:
  - High-priority rules → `0.90`
  - Mid-priority rules → `0.75`
  - Low-priority rules → `0.60`

- When an ML replacement is used, the model's probability (softmax) should populate `segmenter_confidence`.

Segment versioning schema

- `segmenter_version` uses a semantic-like scheme: `v<major>.<minor>.<patch>`.
  - Increment **major** when segment definitions change (add/remove canonical labels).
  - Increment **minor** when thresholds, signals or priorities change in a backward-compatible way.
  - Use **patch** for logging/telemetry/metadata-only updates.

Minimal required input fields

- A valid profile SHOULD include the following fields (these are the minimal required inputs to produce deterministic behavior_summary values):
  - `views_last_7d`
  - `cart_events_last_7d`
  - `purchases_last_30d`
  - `last_purchase_days_ago`

- Optional but recommended fields:
  - `categories_last_10_views`
  - `discount_view_events`
  - `pages_per_session`

Routing implications (LangGraph)

- Segmentation is the primary router for personalization flows. Downstream routing should map segment labels to pathways so the graph can branch cleanly:

- `high_value`, `loyalist`, `power_user` → **high-value pathway**
  - rich retrieval, hyper-personalized grounding, higher safety scrutiny, compact offers

- `cart_abandoner`, `bargain_hunter` → **offer pathway**
  - deal-focused retrieval, discount-first generation, offer A/B logging

- `frequent_browser` → **inspiration pathway**
  - curated picks, browse-first copy, discovery CTAs

- `churn_risk`, `dormant` → **reactivation pathway**
  - win-back flows, empathetic tone, experimentable CTAs

- `general` → **default pathway**
  - standard retrieval and safely templated generation

Example input / output

Example input:

```json
{
  "views_last_7d": 42,
  "cart_events_last_7d": 3,
  "purchases_last_30d": 2,
  "avg_order_value": 89,
  "last_purchase_days_ago": 5,
  "discount_view_events": 1,
  "categories_last_10_views": ["Shoes", "Shoes", "Shoes", "Accessories"],
  "pages_per_session": 6
}
```

Example output:

```json
{
  "segment_id": "power_user",
  "trigger_reason": "High engagement (views=42, pps=6) and efficient conversion",
  "segmenter_confidence": 0.90,
  "segmenter_version": "v1.0.0",
  "rule_applied": "rule_power_r1"
}
```

Threshold centralization

- All numeric thresholds and tunable heuristics (e.g., engagement >= 30, pages_per_session >= 5, discount_view_rate > 0.4) MUST be defined in `app/config/settings.py` or a single config module. The segmentation rules should reference these constants rather than hard-coding numeric literals.

ML-replacement contract stub

- Any ML-based replacement for `_decide_segment()` or the `SegmentationAgent` MUST return the same auditable shape and respect these semantics:

```json
{
  "segment_id": "...",
  "trigger_reason": "...",            // human-readable explanation
  "segmenter_confidence": 0.0,          // float in 0.0..1.0 (model prob)
  "segmenter_version": "ml-vX.Y.Z",  // model version tag
  "rule_applied": "ml_model"          // use 'ml_model' or similar
}
```

Optional LangGraph consistency enhancements

- Emit a `routing_hint` field (optional) alongside the auditable dict when useful. This can be a simple canonical pathway key (e.g., `high_value_path`, `offer_path`) to make graph routing cheaper and more explicit. If present, downstream nodes may short-circuit part of the routing logic.

Final note

- These additions make the segmentation module fully production-ready: auditable, versioned, configurable, and LangGraph-friendly. If you want, I can also apply the corresponding constants into `app/config/settings.py`, add `routing_hint` to the node outputs, and update `generation_node` to read `preferred_length` and `persona_signals` from `SEGMENT_RULES`.
