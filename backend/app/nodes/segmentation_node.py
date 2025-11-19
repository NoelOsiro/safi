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
    # If no aggregate fields in profile, try to extract lightweight metrics from user.history (not implemented)
    behavior_summary = _derive_behavior_summary(profile)

    segment, scores, reason = _decide_segment(behavior_summary, profile)

    _LOGGER.info("segmentation_node: user=%s -> segment=%s (%s) scores=%s", state.get("user", {}).get("id"), segment, reason, scores)

    return {
        "behavior_summary": behavior_summary,
        "segment": segment,
        "segment_reason": reason,
        "segment_scores": scores,
    }