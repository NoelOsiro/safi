import logging
from typing import Dict, Any



try:
    from langsmith import traceable
except Exception:
    def traceable(func):
        return func

from app.state.workflow_state import WorkflowState

logger = logging.getLogger("router_node")
logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------
# Node names
# ---------------------------------------------------------
NODE_SEGMENTATION = "segmentation_node"
NODE_RETRIEVAL = "retrieval_node"
NODE_GENERATION = "generation_node"
NODE_SAFETY = "safety_node"
NODE_RESPONSE = "response_node"


@traceable
def router_node(state: WorkflowState) -> Dict[str, Any]:
    """
    Simple router for LangGraph workflow.

    Based on current state, determines the next node to execute.

    Returns:
        {
            "next_node": str | None,
            "skip_reason": Optional[str]
        }
    """

    # If user has no message → nothing to do
    user_message = None
    if isinstance(state.get("user"), dict):
        user_message = state["user"].get("message")

    if not user_message:
        logger.info("Router: No user message, ending workflow.")
        return {"next_node": None, "skip_reason": "no_user_message"}

    # 1️⃣ If no segmentation yet, run segmentation first
    if not state.get("segment"):
        return {"next_node": NODE_SEGMENTATION}

    # 2️⃣ If we have a segment but retrieval has not been performed yet → retrieval
    if "retrieved_docs" not in state:
        return {"next_node": NODE_RETRIEVAL}

    # 3️⃣ If retrieval exists but no answer yet → generation
    if "answer" not in state:
        return {"next_node": NODE_GENERATION}

    # 4️⃣ If answer exists but no safety metadata → safety check
    if "safety_metadata" not in state:
        return {"next_node": NODE_SAFETY}

    # 5️⃣ If answer and safety metadata exist and we haven't formatted final_response yet → response node
    if "final_response" not in state:
        return {"next_node": NODE_RESPONSE}

    # If final response already present, end the workflow
    return {"next_node": None, "skip_reason": "done"}


# ---------------------------------------------------------
# Optional: helper for executing the graph iteratively
# ---------------------------------------------------------
def run_graph(initial_state: WorkflowState, nodes: Dict[str, callable], max_steps: int = 10) -> WorkflowState:
    """
    Simple executor for the LangGraph workflow.
    nodes: mapping node_name -> callable(state) -> new_state
    """

    state = initial_state.copy()
    for step in range(max_steps):
        router_result = router_node(state)
        next_node_name = router_result.get("next_node")
        skip_reason = router_result.get("skip_reason")
        if not next_node_name:
            logger.info("Router: No next node (reason=%s), ending workflow", skip_reason)
            break

        node_fn = nodes.get(next_node_name)
        if not node_fn:
            logger.error("Router: Node '%s' not found, stopping.", next_node_name)
            break

        logger.info("Router: executing node '%s'", next_node_name)
        try:
            new_state = node_fn(state)
            state.update(new_state)
        except Exception as e:
            logger.exception("Error executing node '%s': %s", next_node_name, e)
            break

    return state


class Router:
    """Simple router mapping intents to node names."""

    def __init__(self, graph):
        self.graph = graph
        self.routes: Dict[str, str] = {}

    def register(self, intent: str, node_name: str):
        self.routes[intent] = node_name

    def route(self, intent: str, payload: Any):
        node_name = self.routes.get(intent)
        if not node_name:
            raise KeyError(f"No route for intent {intent}")
        return self.graph.run(node_name, payload)
