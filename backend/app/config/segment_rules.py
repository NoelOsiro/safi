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
        "preferred_length": "short",  # prefer concise VIP notes
        "priority": 10,
        "boosts": {
            "base": 0.12,
            "product_focus": 0.08,
            "must_include": 0.06,
            "brand": 0.12,
        },
        "persona_signals": {"preferred_brands": True, "recent_repeat_purchases": True},
    },
    "bargain_hunter": {
        "tone": "deal-focused, exciting",
        "must_include": ["discounts", "price drops"],
        "product_focus": "most discounted categories",
        "cta": "flash sales, limited time offers",
        "preferred_length": "short",
        "priority": 6,
        "boosts": {
            "base": 0.08,
            "product_focus": 0.12,
            "must_include": 0.1,
            "discount": 0.25,
        },
        "persona_signals": {"discount_seeking": True},
    },
    "power_user": {
        "tone": "direct, concise",
        "must_include": ["clear options"],
        "product_focus": "high-utility categories",
        "cta": "fast checkout",
        "preferred_length": "very_short",
        "priority": 9,
        "boosts": {
            "base": 0.1,
            "product_focus": 0.06,
            "must_include": 0.05,
            "in_stock": 0.08,
        },
        "persona_signals": {"engagement_high": True, "pages_per_session_high": True},
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
        "boosts": {"base": 0.02},
    },
}
