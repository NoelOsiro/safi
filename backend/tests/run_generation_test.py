from app.nodes.generation_node import generation_node


state = {
    "user": {"message": "Any deals on phones?"},
    "segment": "frequent_browser",
    "behavior_summary": {"views_last_7d": 20, "cart_events_last_7d": 0, "purchases_last_30d": 0},
    "customer_profile": {"tier": "Bronze", "preferred_category": "electronics.smartphone"},
    "retrieval_context": "- Doc: Galaxy S21 price drop\n  Category: electronics.smartphone\n  Brand: Samsung\n  Price: 299"
}

out = generation_node(state)
print("answer:\n", out.get("answer"))
print("model_metadata:\n", out.get("model_metadata"))
