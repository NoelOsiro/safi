from typing import Dict, List


# Try to use pydantic BaseSettings (for production env var overrides).
# Fall back to a lightweight plain Settings class when pydantic is
# unavailable in the runtime environment (common in lightweight test
# environments).
try:
    # pydantic v1 exposed BaseSettings here; pydantic v2 moved it to
    # pydantic-settings package. Try both locations.
    try:
        from pydantic import BaseSettings  # type: ignore
    except Exception:
        from pydantic_settings import BaseSettings  # type: ignore
except Exception:
    BaseSettings = None  # type: ignore


DEFAULT_PRODUCT_PATHS: List[str] = ["/product", "/products", "/store"]
DEFAULT_SEGMENTER_KEYWORDS: Dict[str, List[str]] = {
    "payment": ["payment plan", "payment", "installment", "pay in", "checkout"],
    "support": ["help", "question", "support", "how do i", "how can i", "refund"],
}


if BaseSettings is not None:
    class Settings(BaseSettings):
        ENV: str = "development"
        DEBUG: bool = True

        # Segmentation defaults (can be overridden via env vars)
        SEGMENTER_VERSION: str = "1.1"
        SEGMENTER_PRODUCT_PATHS: List[str] = DEFAULT_PRODUCT_PATHS
        SEGMENTER_KEYWORDS: Dict[str, List[str]] = DEFAULT_SEGMENTER_KEYWORDS
        # Segmentation thresholds (tunable)
        SEGMENT_BASELINE_AOV: float = 100.0
        SEGMENT_THRESHOLD_MONETARY_HIGH: float = 0.8
        SEGMENT_THRESHOLD_FREQUENCY_HIGH: float = 0.6
        SEGMENT_THRESHOLD_FREQUENCY_LOYAL: float = 0.7
        SEGMENT_THRESHOLD_RECENCY_HIGH: float = 0.8
        SEGMENT_THRESHOLD_ENGAGEMENT_POWER: float = 30.0
        SEGMENT_THRESHOLD_PPS_POWER: float = 5.0
        SEGMENT_THRESHOLD_CONV_NORM_POWER: float = 0.05
        SEGMENT_THRESHOLD_DISCOUNT_VIEW_RATE: float = 0.4
        SEGMENT_THRESHOLD_CART_ABANDON_BARGAIN: float = 0.3
        SEGMENT_THRESHOLD_CART_ABANDONER_RATE: float = 0.6
        SEGMENT_THRESHOLD_CART_EVENTS_FOR_ABANDON: int = 2
        SEGMENT_THRESHOLD_VIEWS_FREQUENT: int = 20
        SEGMENT_THRESHOLD_VIEWS_NEW: int = 2

        # Confidence bands for rule-based segmentation
        SEGMENT_CONFIDENCE_HIGH: float = 0.90
        SEGMENT_CONFIDENCE_MID: float = 0.75
        SEGMENT_CONFIDENCE_LOW: float = 0.60

        # Retriever tuning knobs (diversity / novelty)
        RETRIEVER_ENABLE_DIVERSITY_POSTPROCESSING: bool = True
        RETRIEVER_ENABLE_NOVELTY_DEDUP: bool = True
        RETRIEVER_MAX_PER_BRAND: int = 2
        RETRIEVER_MAX_PER_CATEGORY: int = 2
        RETRIEVER_NOVELTY_THRESHOLD: float = 0.8
        # Allow toggling persona/segment boost behavior (fallback)
        RETRIEVER_USE_SEGMENT_RULE_BOOSTS: bool = True

        class Config:
            # Allow environment variables with upper-case names by default
            env_prefix = ""


else:
    class Settings:
        ENV: str = "development"
        DEBUG: bool = True

        # Segmentation defaults (can be overridden by replacing this object)
        SEGMENTER_VERSION: str = "1.1"
        SEGMENTER_PRODUCT_PATHS: List[str] = DEFAULT_PRODUCT_PATHS
        SEGMENTER_KEYWORDS: Dict[str, List[str]] = DEFAULT_SEGMENTER_KEYWORDS
        # Segmentation thresholds (tunable)
        SEGMENT_BASELINE_AOV: float = 100.0
        SEGMENT_THRESHOLD_MONETARY_HIGH: float = 0.8
        SEGMENT_THRESHOLD_FREQUENCY_HIGH: float = 0.6
        SEGMENT_THRESHOLD_FREQUENCY_LOYAL: float = 0.7
        SEGMENT_THRESHOLD_RECENCY_HIGH: float = 0.8
        SEGMENT_THRESHOLD_ENGAGEMENT_POWER: float = 30.0
        SEGMENT_THRESHOLD_PPS_POWER: float = 5.0
        SEGMENT_THRESHOLD_CONV_NORM_POWER: float = 0.05
        SEGMENT_THRESHOLD_DISCOUNT_VIEW_RATE: float = 0.4
        SEGMENT_THRESHOLD_CART_ABANDON_BARGAIN: float = 0.3
        SEGMENT_THRESHOLD_CART_ABANDONER_RATE: float = 0.6
        SEGMENT_THRESHOLD_CART_EVENTS_FOR_ABANDON: int = 2
        SEGMENT_THRESHOLD_VIEWS_FREQUENT: int = 20
        SEGMENT_THRESHOLD_VIEWS_NEW: int = 2

        # Confidence bands for rule-based segmentation
        SEGMENT_CONFIDENCE_HIGH: float = 0.90
        SEGMENT_CONFIDENCE_MID: float = 0.75
        SEGMENT_CONFIDENCE_LOW: float = 0.60

        # Retriever tuning knobs (diversity / novelty)
        RETRIEVER_ENABLE_DIVERSITY_POSTPROCESSING: bool = True
        RETRIEVER_ENABLE_NOVELTY_DEDUP: bool = True
        RETRIEVER_MAX_PER_BRAND: int = 2
        RETRIEVER_MAX_PER_CATEGORY: int = 2
        RETRIEVER_NOVELTY_THRESHOLD: float = 0.8
        # Allow toggling persona/segment boost behavior (fallback)
        RETRIEVER_USE_SEGMENT_RULE_BOOSTS: bool = True


import os

# Sanitize environment values that are empty strings for complex-typed settings.
# Pydantic attempts to `json.loads` env values for list/dict fields; an empty
# string will raise JSONDecodeError. Remove any empty-string env entries so
# the Settings defaults are used instead.
for _k in ("SEGMENTER_PRODUCT_PATHS", "SEGMENTER_KEYWORDS"):
    try:
        v = os.environ.get(_k)
        if v is not None and isinstance(v, str) and v.strip() == "":
            del os.environ[_k]
    except Exception:
        # Be defensive; don't crash config loading for unexpected envs
        pass

try:
    settings = Settings()
except Exception as _exc:
    # Defensive fallback: if environment parsing fails (common when an env
    # variable is present but empty), construct a simple settings object using
    # the class defaults so the app can continue running in development.
    import logging
    logging.getLogger(__name__).warning("Settings load failed (%s); using defaults", _exc)

    class _FallbackSettings:
        pass

    settings = _FallbackSettings()
    # copy uppercase attributes from the Settings class defaults
    for _k, _v in getattr(Settings, "__dict__", {}).items():
        if _k.isupper():
            try:
                setattr(settings, _k, _v)
            except Exception:
                pass
