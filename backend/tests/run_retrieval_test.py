from app.nodes.retrieval_node import retrieval_node


state = {
    "user": {"message": "Do you have deals on electronics?"},
    "segment": "frequent_browser",
    "behavior_summary": {
        "views_last_7d": 30,
        "cart_events_last_7d": 1,
        "purchases_last_30d": 0,
    },
    "customer_profile": {
        "preferred_category": "electronics.smartphone",
        "preferred_brand": "Samsung",
    },
}

out = retrieval_node(state)
print("retrieved_docs:", out.get("retrieved_docs"))
print("retrieval_context:\n", out.get("retrieval_context"))
