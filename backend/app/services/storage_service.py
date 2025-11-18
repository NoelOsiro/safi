from typing import Any, Dict


class StorageService:
    """Minimal storage service interface placeholder."""

    def __init__(self):
        self._store: Dict[str, Any] = {}

    def save(self, key: str, value: Any):
        self._store[key] = value

    def get(self, key: str, default=None):
        return self._store.get(key, default)
