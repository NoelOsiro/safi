from typing import Dict, Any, Callable


class WorkflowGraph:
    """A minimal workflow graph to register and run nodes."""

    def __init__(self):
        self.nodes: Dict[str, Callable[[Any], Any]] = {}
        self.edges = []
        # Mapping from routing_hint -> node name for quick short-circuiting
        self.routing_hints: Dict[str, str] = {}

    def add_node(self, name: str, handler: Callable[[Any], Any]):
        self.nodes[name] = handler

    def connect(self, from_node: str, to_node: str):
        self.edges.append((from_node, to_node))

    def add_routing_hint(self, hint: str, node_name: str):
        """Register a stable routing hint mapping to a node name."""
        self.routing_hints[hint] = node_name

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
            # update payload to the returned workflow state for the next node
            payload = result
            # find next node(s) — use first match for this simple implementation
            # If the latest payload contains a segment routing hint and a mapping
            # is registered, short-circuit to the mapped node.
            try:
                hint = None
                if isinstance(payload, dict):
                    seg = payload.get("segment")
                    if isinstance(seg, dict):
                        hint = seg.get("routing_hint")
                if hint and hint in self.routing_hints:
                    mapped = self.routing_hints[hint]
                    # only short-circuit if the mapped node exists
                    if mapped in self.nodes:
                        current = mapped
                        continue
            except Exception:
                # ignore routing hint errors and fall back to edges
                pass

            next_nodes = [to_n for (f, to_n) in self.edges if f == current]
            current = next_nodes[0] if next_nodes else None
        return payload
