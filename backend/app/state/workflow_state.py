from typing import TypedDict, Optional, List, Dict, Any


class WorkflowState(TypedDict, total=False):
    user: Dict[str, Any]

    segment: Optional[str]

    retrieved_docs: Optional[List[Dict[str, Any]]]

    variants: Optional[List[str]]

    safe_variants: Optional[List[str]]

    final_message: Optional[str]

    analytics: Optional[Dict[str, Any]]


def new_workflow_state() -> WorkflowState:
    """Return an empty WorkflowState instance for populating during a run."""
    return {}
