"""Application bootstrap helper to construct a default workflow graph.

This file provides `create_app_graph()` which calls `build_default_graph()` and
registers common fallback routing hint mappings when fallback nodes are present.
It also exposes a small CLI diagnostic to print the wired nodes and mappings.
"""
import logging
from typing import Optional

from app.graph.workflow_graph import build_default_graph, WorkflowGraph

logger = logging.getLogger("app.bootstrap")
logging.basicConfig(level=logging.INFO)


def create_app_graph() -> WorkflowGraph:
    """Build and return the default workflow graph, registering common
    fallback routing mappings when the nodes exist.
    """
    g = build_default_graph()

    # Wire common fallback routing hints to nodes if they exist in the graph
    hint_map = {
        "fallback_retrieval": "fallback_retrieval",
        "product_recommendation": "product_recommendation",
        "safe_summary": "safe_summary",
    }
    for hint, node_name in hint_map.items():
        if node_name in g.nodes:
            g.add_routing_hint(hint, node_name)
            logger.info("Registered fallback routing hint %s -> %s", hint, node_name)
    return g


def main(argv: Optional[list] = None) -> int:
    g = create_app_graph()
    print("Wired nodes:")
    for n in sorted(g.nodes.keys()):
        print(" -", n)
    print("Routing hints:")
    for h, v in g.routing_hints.items():
        print(f" - {h} -> {v}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
