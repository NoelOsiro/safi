from langsmith import traceable
from app.state.workflow_state import WorkflowState
from ..agents.segmentation import SegmentationAgent
import logging


# Initialize your agent once (not on every node call)
segmentation_agent = SegmentationAgent()
_LOGGER = logging.getLogger(__name__)


@traceable  # This makes node executions visible in LangSmith
def segmentation_node(state: WorkflowState) -> WorkflowState:
    """
    Node 1: User Intent Segmentation
    - Takes the raw user input
    - Uses segmentation agent to classify / segment intent
    - Writes `segment` back into graph state (merging with existing state)
    """

    # Safely extract user message (state is a dict-like TypedDict at runtime)
    user = state.get("user") if isinstance(state, dict) else None
    user_message = ""
    if isinstance(user, dict):
        user_message = user.get("message", "") or ""

    # Build a structured event using available signals from the state
    event = {"text": user_message}
    for key in ("event_name", "page_url", "step", "time_spent", "asset_name"):
        if key in state:
            event[key] = state[key]

    result = segmentation_agent.run(event)

    # Log which rule was matched for workflow observability
    rule = result.get("rule_applied")
    seg_id = result.get("segment_id")
    _LOGGER.info("Segmentation node matched rule=%s -> segment=%s", rule, seg_id)

    # Merge the segment result back into the workflow state
    new_state = dict(state)
    new_state["segment"] = result
    return new_state
