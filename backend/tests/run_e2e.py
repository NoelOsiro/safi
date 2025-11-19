from app.graph.router import run_graph
from app.nodes.segmentation_node import segmentation_node
from app.nodes.retrieval_node import retrieval_node
from app.nodes.generation_node import generation_node
from app.nodes.safety_node import safety_node
from app.nodes.response_node import response_node


nodes = {
    "segmentation_node": segmentation_node,
    "retrieval_node": retrieval_node,
    "generation_node": generation_node,
    "safety_node": safety_node,
    "response_node": response_node,
}


initial_state = {
    "user": {"id": "u1", "message": "Any phone deals?"},
    "customer_profile": {"preferred_category": "electronics.smartphone", "tier": "Gold", "preferred_brand": "Samsung"},
}


final = run_graph(initial_state, nodes, max_steps=10)
print("Final state keys:", list(final.keys()))
print(final.get("final_response"))
