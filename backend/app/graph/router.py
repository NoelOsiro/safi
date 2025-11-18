from typing import Callable, Dict, Any


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
