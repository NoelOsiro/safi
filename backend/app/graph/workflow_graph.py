from typing import Dict, Any, Callable


class WorkflowGraph:
    """A minimal workflow graph to register and run nodes."""

    def __init__(self):
        self.nodes: Dict[str, Callable[[Any], Any]] = {}
        self.edges = []

    def add_node(self, name: str, handler: Callable[[Any], Any]):
        self.nodes[name] = handler

    def connect(self, from_node: str, to_node: str):
        self.edges.append((from_node, to_node))

    def run(self, start_node: str, payload: Any):
        current = start_node
        result = None
        visited = set()
        while current and current not in visited:
            visited.add(current)
            handler = self.nodes.get(current)
            if handler is None:
                raise RuntimeError(f"Node '{current}' not found")
            result = handler(payload)
            # find next node(s) — use first match for this simple implementation
            next_nodes = [to_n for (f, to_n) in self.edges if f == current]
            current = next_nodes[0] if next_nodes else None
        return result
