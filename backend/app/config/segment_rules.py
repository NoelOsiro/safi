"""Central segment rules used by nodes to influence retrieval and generation.

This module exposes `SEGMENT_RULES` as a reusable dictionary mapping segment
identifiers to messaging and retrieval guidance. Keep this small and
easy-to-extend for new personas.
"""

SEGMENT_RULES = {
    "loyalist": {
        "tone": "warm, grateful, exclusive",
        "must_include": ["loyalty appreciation"],
        "product_focus": "frequently purchased categories",
        "cta": "exclusive previews / offers",
    },
    "bargain_hunter": {
        "tone": "deal-focused, exciting",
        "must_include": ["discounts", "price drops"],
        "product_focus": "most discounted categories",
        "cta": "flash sales, limited time offers",
    },
    "power_user": {
        "tone": "direct, concise",
        "must_include": ["clear options"],
        "product_focus": "high-utility categories",
        "cta": "fast checkout",
    },
    "window_shopper": {
        "tone": "friendly, inspiring",
        "must_include": ["curated picks"],
        "product_focus": "trending categories",
        "cta": "view full collection",
    },
    "impulse_buyer": {
        "tone": "quick-hit, energetic",
        "must_include": ["easy checkout"],
        "product_focus": "fast-moving items",
        "cta": "buy now",
    },
    "general": {
        "tone": "helpful, friendly",
        "must_include": [],
        "product_focus": "popular items",
        "cta": "view deals",
    },
}
