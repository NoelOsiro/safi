import logging
from typing import Dict, Any
from langsmith import traceable
from app.state.workflow_state import WorkflowState
from app.agents.segmentation.segmentation_agent import _decide_segment, _derive_behavior_summary
from ..agents.segmentation import SegmentationAgent


try:
    from langsmith import traceable
except Exception:
    # no-op fallback so module imports in minimal dev envs
    def traceable(func=None, **_kwargs):
        if func is None:
            def _decorator(f):
                return f
            return _decorator
        return func



logger = logging.getLogger("segmentation_node")
logging.basicConfig(level=logging.INFO)


def _safe_get(d: Dict[str, Any], key: str, default=0):
    v = d.get(key, default)
    try:
        return float(v)
    except Exception:
        return default


def _normalize_score(val: float, max_val: float = 1.0) -> float:
    """Clamp and normalize to 0..1 scale. Avoid division by zero."""
    if max_val <= 0:
        return 0.0
    return max(0.0, min(1.0, val / max_val))



# Initialize your agent once (not on every node call)
segmentation_agent = SegmentationAgent()
_LOGGER = logging.getLogger("segmentation_node")
logging.basicConfig(level=logging.INFO)


@traceable  # This makes node executions visible in LangSmith
def segmentation_node(state: WorkflowState) -> WorkflowState:
    """
    Retail segmentation node.
    Inputs:
      - state['customer_profile'] (preferred) containing behavior aggregates
      - OR falls back to state['user'] for minimal info
    Outputs:
      - behavior_summary
      - segment
      - segment_reason
      - segment_scores
    """ 
    profile = state.get("customer_profile") or {}

    # If structured event info or a short user message is present, prefer the
    # auditable rule-based agent so we can expose the `rule_applied` key.
    event_present = any(k in state for k in ("event_name", "page_url", "step", "text")) or (
        isinstance(state.get("user"), dict) and bool(state.get("user", {}).get("message"))
    )

    if event_present:
        event = {
            "event_name": state.get("event_name"),
            "page_url": state.get("page_url"),
            "step": state.get("step"),
            "text": (state.get("user") or {}).get("message") if isinstance(state.get("user"), dict) else None,
        }
        try:
            seg_obj = segmentation_agent.run(event)
            # segmentation_agent.run returns an auditable dict with keys like
            # 'segment_id', 'trigger_reason', 'segmenter_confidence', 'rule_applied'
        except Exception:
            # Fallback to behavior-derived segment if agent fails
            behavior_summary = _derive_behavior_summary(profile)
            label, scores, reason = _decide_segment(behavior_summary, profile)
            seg_obj = {
                "segment_id": label,
                "trigger_reason": reason,
                "segmenter_confidence": max(scores.values()) if scores else 0.0,
                "rule_applied": "rule_behavioral_fallback",
            }
    else:
        # No structured event — derive from aggregates
        behavior_summary = _derive_behavior_summary(profile)
        label, scores, reason = _decide_segment(behavior_summary, profile)
        seg_obj = {
            "segment_id": label,
            "trigger_reason": reason,
            "segmenter_confidence": max(scores.values()) if scores else 0.0,
            "rule_applied": "rule_behavioral",
        }

    _LOGGER.info("segmentation_node: user=%s -> segment=%s (%s) scores=%s", state.get("user", {}).get("id"), seg_obj.get("segment_id"), seg_obj.get("trigger_reason"), seg_obj)

    # Ensure behavior_summary and segment_scores are present for downstream nodes
    if "behavior_summary" not in locals():
        behavior_summary = _derive_behavior_summary(profile)
    # Attempt to reuse 'scores' from _decide_segment when available
    try:
        segment_scores = scores
    except NameError:
        # If we invoked the segmentation agent, we may not have `scores` — synthesize minimal scores
        segment_scores = {"recency": 0.0, "frequency": 0.0, "monetary": 0.0}

    return {
        "behavior_summary": behavior_summary,
        "segment": seg_obj,
        "segment_reason": seg_obj.get("trigger_reason"),
        "segment_scores": segment_scores,
    }