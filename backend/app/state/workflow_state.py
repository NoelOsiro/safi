from typing import TypedDict, Optional, List, Dict, Any


class BehaviorSummary(TypedDict, total=False):
    views_last_7d: Optional[int]
    cart_events_last_7d: Optional[int]
    purchases_last_30d: Optional[int]
    avg_order_value: Optional[float]
    last_purchase_days_ago: Optional[int]
    conversion_rate: Optional[float]
    # derived signals / scores
    cart_abandon_rate: Optional[float]
    recency_score: Optional[float]
    frequency_score: Optional[float]
    monetary_score: Optional[float]


class WorkflowState(TypedDict, total=False):
    # incoming user + customer data
    user: Dict[str, Any]                    # { message, id, ... }
    customer_profile: Optional[Dict[str, Any]]  # { id, name, tier, preferences, ... }
    # derived by segmentation node
    behavior_summary: Optional[BehaviorSummary]
    segment: Optional[str]
    segment_reason: Optional[str]
    segment_scores: Optional[Dict[str, float]]

    # retrieval/generation/safety/response fields (unchanged)
    retrieved_docs: Optional[List[Dict[str, Any]]]
    retrieval_context: Optional[str]
    answer: Optional[str]
    safety_metadata: Optional[Dict[str, Any]]
    final_response: Optional[Dict[str, Any]]
    analytics: Optional[Dict[str, Any]]
# backend/app/state/workflow_state.py

class BehaviorSummary(TypedDict, total=False):
    views_last_7d: Optional[int]
    cart_events_last_7d: Optional[int]
    purchases_last_30d: Optional[int]
    avg_order_value: Optional[float]
    last_purchase_days_ago: Optional[int]
    conversion_rate: Optional[float]
    # derived signals / scores
    cart_abandon_rate: Optional[float]
    recency_score: Optional[float]
    frequency_score: Optional[float]
    monetary_score: Optional[float]

def new_workflow_state() -> WorkflowState:
    """Return an empty WorkflowState instance for populating during a run."""
    return {}
