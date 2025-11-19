import logging
import re
import json
from typing import Dict, Any
from langsmith import traceable

logger = logging.getLogger("safety_node")
logging.basicConfig(level=logging.INFO)


PII_PATTERNS = {
    "email": re.compile(r"[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}", re.IGNORECASE),
    "phone": re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "credit_card": re.compile(r"\b(?:\d[ -]*?){13,16}\b"),
}

PRICING_PHRASES = [
    r"always in stock",
    r"guarantee(d)?\b",
    r"price match",
    r"lowest price",
    r"best price",
    r"only \d+ left",
    r"limited stock",
]

HALLUCINATION_PHRASES = [r"only \d+ left", r"in stock at", r"available now", r"limited stock"]


def _redact_pii(text: str) -> tuple[str, list]:
    flags = []
    out = text
    for name, pat in PII_PATTERNS.items():
        if pat.search(out):
            flags.append(f"redacted_{name}")
            if name == "email":
                out = pat.sub("[REDACTED_EMAIL]", out)
            elif name == "phone":
                out = pat.sub("[REDACTED_PHONE]", out)
            elif name == "ssn":
                out = pat.sub("[REDACTED_SSN]", out)
            elif name == "credit_card":
                out = pat.sub("[REDACTED_CC]", out)
    return out, flags


def _detect_pricing_claims(text: str) -> list:
    found = []
    lower = text.lower()
    for p in PRICING_PHRASES:
        if re.search(p, lower):
            found.append("pricing_claim")
            break
    return found


def _detect_hallucinated_inventory(text: str, offers: list | None, retrieved: list | None) -> list:
    flags = []
    lower = text.lower()
    for p in HALLUCINATION_PHRASES:
        if re.search(p, lower):
            # if offers/retrieved include inventory checks or in_stock flags, we assume safe
            has_inventory_info = False
            for s in (offers or []) + (retrieved or []):
                if isinstance(s, dict) and (s.get("in_stock") is not None or s.get("inventory_checked") is not None):
                    has_inventory_info = True
                    break
            if not has_inventory_info:
                flags.append("hallucinated_inventory")
            break
    return flags


def _append_disclaimer(text: str) -> str:
    disclaimer = " Prices and availability are subject to change; see product page for current details."
    if disclaimer.strip() in text:
        return text
    # Attempt to place disclaimer before final CTA (a period followed by capitalized CTA), otherwise append
    return text.strip() + disclaimer


def _load_safety_model():
    """Lazy loader for an external safety model client.

    Tests monkeypatch this function to return a DummyModel, so keep
    the default implementation simple and fail-open (return None)
    when no external model is available.
    """
    # In production this could return an LLM/moderation client instance.
    return None

@traceable
def safety_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Inspect and sanitize the assistant answer.

    - Redact PII/PHI
    - Detect pricing guarantees and hallucinated inventory
    - Optionally rewrite the answer to remove risky claims and append disclaimers
    - Return merged state including `safety_metadata` and `final_answer`
    """
    try:
        if not isinstance(state, dict):
            return state
        answer = str(state.get("answer") or "")
        offers = state.get("offers") or []
        retrieved = state.get("retrieved_docs") or []

        safety_flags = []
        rewritten = False

        # 1) Redact PII/PHI
        redacted, pii_flags = _redact_pii(answer)
        if pii_flags:
            safety_flags.extend(pii_flags)
            answer = redacted
            rewritten = True

        # 2) Detect pricing claims
        pricing_flags = _detect_pricing_claims(answer)
        if pricing_flags:
            safety_flags.extend(pricing_flags)
            # remove explicit numeric 'only N left' claims
            answer = re.sub(r"only \d+ left", "availability may vary", answer, flags=re.IGNORECASE)
            # append disclaimer
            answer = _append_disclaimer(answer)
            rewritten = True

        # 3) Detect hallucinated inventory
        halluc_flags = _detect_hallucinated_inventory(answer, offers, retrieved)
        if halluc_flags:
            safety_flags.extend(halluc_flags)
            # sanitize numeric availability claims
            answer = re.sub(r"only \d+ left", "availability may vary", answer, flags=re.IGNORECASE)
            answer = _append_disclaimer(answer)
            rewritten = True

        # 4) Optional model-based safety checks (moderation/classifier)
        model = None
        try:
            model = _load_safety_model()
        except Exception:
            model = None

        model_needs_blocking = False
        model_explanation = None
        if model is not None:
            try:
                # Model contract: .invoke(messages) -> object with .content
                payload = {
                    "text": answer,
                    "user": state.get("user"),
                    "retrieval_context": state.get("retrieval_context"),
                }
                resp = model.invoke(payload)
                if hasattr(resp, "content") and resp.content:
                    parsed = json.loads(resp.content)
                    # Merge model-supplied flags if present
                    for k in ("contains_pii", "contains_hate", "is_hallucination"):
                        if parsed.get(k):
                            safety_flags.append(k)
                    model_needs_blocking = bool(parsed.get("needs_blocking"))
                    model_explanation = parsed.get("explanation")
            except Exception:
                logger.exception("safety_node: safety model invocation failed")

        # 5) Build safety metadata
        safety_metadata = {
            "flags": safety_flags,
            "rewritten": rewritten,
            "needs_blocking": model_needs_blocking,
        }
        if model_explanation:
            safety_metadata["explanation"] = model_explanation

        # propagate trace id if present in offers_metadata or model_metadata
        trace_id = None
        offers_meta = state.get("offers_metadata") or {}
        if isinstance(offers_meta, dict) and offers_meta.get("trace_id"):
            trace_id = offers_meta.get("trace_id")
        else:
            model_meta = state.get("model_metadata") or {}
            if isinstance(model_meta, dict) and model_meta.get("trace_id"):
                trace_id = model_meta.get("trace_id")
        if trace_id:
            safety_metadata["trace_id"] = trace_id

        # If the model requested blocking, replace the answer with a safe message
        if model_needs_blocking:
            answer = "I'm sorry, I cannot provide that content."
            safety_metadata["rewritten"] = True

        # Write back merged state
        out = dict(state)
        out["answer"] = answer
        out["final_answer"] = answer
        out["safety_metadata"] = safety_metadata
        return out
    except Exception:
        logger.exception("safety_node: unexpected error")
        # On failure, return original state with a failure marker
        out = dict(state) if isinstance(state, dict) else {"answer": ""}
        out["safety_metadata"] = {"flags": ["safety_node_failed"], "rewritten": False}
        return out
