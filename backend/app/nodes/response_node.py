import logging
from typing import Dict, Any

try:
    from langsmith import traceable
except Exception:
    def traceable(func):
        return func

from app.state.workflow_state import WorkflowState

logger = logging.getLogger("response_node")
logging.basicConfig(level=logging.INFO)


@traceable
def response_node(state: WorkflowState) -> WorkflowState:
    """
    Final node: formats the answer for output.
    Combines:
      - Generated answer
      - Safety metadata
      - Optional retrieval context (for transparency)
    """

    final_answer = state.get("answer", "(No answer generated)")
    safety = state.get("safety_metadata", {})
    retrieval_context = state.get("retrieval_context", "")

    # If blocked by safety node, replace final answer
    if safety.get("needs_blocking", False):
        final_answer = (
            "⚠ The response was blocked by safety checks.\n"
            "I’m here to help, but I cannot provide unsafe content."
        )

    # Construct final response object
    response_payload = {
        "answer": final_answer,
        "safety_metadata": safety,
        "retrieval_context": retrieval_context if retrieval_context else None,
    }

    # Optional: Log final response length
    logger.info(
        "response_node: final answer length=%s, safety_blocked=%s",
        len(final_answer),
        safety.get("needs_blocking", False),
    )

    return {
        "final_response": response_payload
    }
