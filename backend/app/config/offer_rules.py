"""Config-driven offer rules for segments.

This file contains high-level rules that guide the `offers_node` behavior
and make the node data-driven for easier experimentation.
"""

OFFER_RULES = {
    "bargain_hunter": {
        "preferred_deals": ["discount", "clearance", "bundle"],
        "max_offer_count": 3,
        "discount_threshold": 0.20,
        "cta_style": "savings",
        "max_per_brand": 1,
    },
    "power_user": {
        "preferred_deals": ["new_arrival", "high_end"],
        "max_offer_count": 2,
        "cta_style": "premium",
    },
    "high_value": {
        "preferred_deals": ["exclusive", "bundle"],
        "max_offer_count": 2,
        "cta_style": "exclusive",
    },
    "general": {
        "max_offer_count": 3,
    },
}
