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


settings = Settings()
