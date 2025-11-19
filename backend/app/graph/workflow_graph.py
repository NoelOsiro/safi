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

            # Fallback checks: if retrieval produced no candidates, route to a fallback retrieval
            try:
                if isinstance(payload, dict):
                    # empty retrieved docs -> fallback_retrieval
                    if payload.get("retrieved_docs") is not None and len(payload.get("retrieved_docs")) == 0:
                        if "fallback_retrieval" in self.routing_hints and self.routing_hints["fallback_retrieval"] in self.nodes:
                            current = self.routing_hints["fallback_retrieval"]
                            continue
                    # offers empty -> product_recommendation
                    if payload.get("offers") is not None and len(payload.get("offers")) == 0:
                        if "product_recommendation" in self.routing_hints and self.routing_hints["product_recommendation"] in self.nodes:
                            current = self.routing_hints["product_recommendation"]
                            continue
                    # generation failed marker -> safe_summary
                    if payload.get("generation_failed"):
                        if "safe_summary" in self.routing_hints and self.routing_hints["safe_summary"] in self.nodes:
                            current = self.routing_hints["safe_summary"]
                            continue
            except Exception:
                # ignore fallback evaluation errors and continue to normal edges
                pass

            next_nodes = [to_n for (f, to_n) in self.edges if f == current]
            current = next_nodes[0] if next_nodes else None
        return payload


def build_default_graph() -> 'WorkflowGraph':
    """Attempt to build a default workflow graph by wiring known nodes.

    This function imports node modules if available and wires the common
    path: segmentation -> retrieval -> offers -> generation. It also
    registers a routing hint for `offers`.
    """
    g = WorkflowGraph()
    try:
        from app.nodes import segmentation_node
        g.add_node("segmentation", segmentation_node.segmentation_node)
    except Exception:
        pass
    try:
        from app.nodes import retrieval_node
        g.add_node("retrieval", retrieval_node.retrieval_node)
    except Exception:
        pass
    try:
        from app.nodes.offers_node import offers_node
        g.add_node("offers", offers_node)
        g.add_routing_hint("offers", "offers")
    except Exception:
        pass
    try:
        from app.nodes import generation_node
        g.add_node("generation", generation_node.generation_node)
    except Exception:
        pass
    try:
        from app.nodes import safety_node
        g.add_node("safety", safety_node.safety_node)
    except Exception:
        pass
    try:
        from app.nodes import hitl_node
        g.add_node("hitl", hitl_node.hitl_node)
    except Exception:
        pass
    try:
        from app.nodes import delivery_node
        g.add_node("delivery", delivery_node.delivery_node)
    except Exception:
        pass
    # connect if nodes present
    if "segmentation" in g.nodes and "retrieval" in g.nodes:
        g.connect("segmentation", "retrieval")
    if "retrieval" in g.nodes and "offers" in g.nodes:
        g.connect("retrieval", "offers")
    if "offers" in g.nodes and "generation" in g.nodes:
        g.connect("offers", "generation")
    if "generation" in g.nodes and "safety" in g.nodes:
        g.connect("generation", "safety")
    if "safety" in g.nodes and "hitl" in g.nodes:
        g.connect("safety", "hitl")
    if "hitl" in g.nodes and "delivery" in g.nodes:
        g.connect("hitl", "delivery")
    # delivery will be optionally added if implemented
    return g
