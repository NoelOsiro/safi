"""Simple inventory service interface.

This module provides a lightweight `is_in_stock` function that can be
monkeypatched in tests or replaced by a real inventory provider in production.
"""
from typing import Dict

# Default in-memory inventory (product_id -> in_stock flag)
_INVENTORY: Dict[str, bool] = {}


def is_in_stock(product_id: str) -> bool:
    """Return True if product is in stock. By default returns True unless
    explicitly set to False in `_INVENTORY`.
    """
    if product_id is None:
        return False
    # Return explicit inventory value if present, otherwise assume True
    return bool(_INVENTORY.get(str(product_id), True))


def set_inventory_map(mapping: Dict[str, bool]):
    """Replace the internal inventory map (useful for tests)."""
    global _INVENTORY
    _INVENTORY = {str(k): bool(v) for k, v in (mapping or {}).items()}
