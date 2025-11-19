from app.nodes.segmentation_node import segmentation_node


state = {
    "user": {"id": "u123", "message": "I'm looking for phone cases"},
    "customer_profile": {
        "views_last_7d": 25,
        "cart_events_last_7d": 1,
        "purchases_last_30d": 0,
        "avg_order_value": 0,
        "last_purchase_days_ago": None,
    },
}

out = segmentation_node(state)
print(out)
