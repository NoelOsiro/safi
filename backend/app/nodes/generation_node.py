import logging
import os
from typing import Dict, Any

try:
    from langsmith import traceable
except Exception:
    def traceable(func=None, **_kwargs):
        if func is None:
            def _decorator(f):
                return f
            return _decorator
        return func

from app.state.workflow_state import WorkflowState

logger = logging.getLogger("generation_node")
logging.basicConfig(level=logging.INFO)


# Reusable segment rules schema to drive tone, required elements, and CTAs.
# Each entry maps a segment label to messaging guidance used by both template
# fallback and for prompt steering when calling an LLM.
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
    # Keep a default fallback
    "general": {
        "tone": "helpful, friendly",
        "must_include": [],
        "product_focus": "popular items",
        "cta": "view deals",
    },
}


def _template_generate(state: Dict[str, Any]) -> str:
    """Simple template-based generator used when no LLM is available.
    Keeps message concise and honors segment/loyalty/category hints.
    """
    seg_raw = state.get("segment") or "general"
    # allow segment to be either dict (auditable) or simple string
    if isinstance(seg_raw, dict):
        seg = (seg_raw.get("segment_id") or seg_raw.get("segment") or "general").lower()
    else:
        seg = str(seg_raw).lower()
    profile = state.get("customer_profile") or {}
    tier = profile.get("tier") or profile.get("loyalty_tier") or "Bronze"
    pref = profile.get("preferred_category") or profile.get("preferred_category") or "your preferred category"
    ctx = state.get("retrieval_context") or ""

    lines = []
    # Consult SEGMENT_RULES for tone and required elements
    rule = SEGMENT_RULES.get(seg, SEGMENT_RULES["general"])
    tone = rule.get("tone")
    must_include = rule.get("must_include", [])
    cta = rule.get("cta")

    if seg == "cart_abandoner":
        lines.append("We noticed you left items in your cart — here are quick ways to complete checkout and save:")
    elif seg == "frequent_browser":
        lines.append("You’ve been browsing a lot — here are curated picks and comparisons based on your interests:")
    elif seg == "high_value":
        lines.append("Thanks for being a valued customer — here are some premium picks and exclusive offers for you:")
    elif seg == "new_user":
        lines.append("Welcome! Here are some top picks to help you get started:")
    else:
        # Generic opening guided by tone
        lines.append(f"{tone.split(',')[0].capitalize()} picks for you:")

    if pref:
        lines.append(f"Category focus: {pref}.")

    if tier and tier.lower() in ("gold", "platinum"):
        lines.append(f"As a valued {tier} member, enjoy early access to select deals.")

    if ctx:
        # include a short excerpt from retrieval_context if present
        excerpt = ctx.strip().splitlines()[:3]
        if excerpt:
            lines.append("Relevant items:")
            for e in excerpt:
                lines.append(f"- {e[:200]}")

    # Ensure must-have elements are present for the persona
    for req in must_include:
        if req.lower() == "discounts" and not any("%" in line or "off" in line.lower() or "deal" in line.lower() for line in lines):
            lines.append("P.S. We found discounts matching your interests — don't miss out!")
        elif req.lower() == "loyalty appreciation":
            lines.append("P.S. Thanks for being with us — enjoy this exclusive perk.")
        elif req.lower() == "curated picks" and "Relevant items:" not in "\n".join(lines):
            lines.append("Relevant items:")
    # final CTA guided by persona cta
    lines.append(cta.capitalize() + ".")

    # join and ensure under ~120 words
    msg = " ".join(lines)
    words = msg.split()
    if len(words) > 120:
        msg = " ".join(words[:120]) + "..."
    return msg


def _call_openai_chat(prompt: str) -> str:
    """Try to call OpenAI ChatCompletion if API key is present. Return response string or raise.
    """
    # Attempt to load a LangChain ChatOpenAI-compatible client (supports GitHub/Azure/Ollama patterns)
    API_HOST = os.getenv("API_HOST", "github")
    try:
        from langchain_openai import ChatOpenAI
    except Exception:
        ChatOpenAI = None

    if ChatOpenAI is not None:
        model_name = os.getenv("OPENAI_MODEL", os.getenv("GITHUB_MODEL", "gpt-4o-mini"))
        # Github (default), Azure, or Ollama adapters
        if API_HOST == "github":
            client = ChatOpenAI(model=model_name, base_url=os.getenv("GITHUB_MODELS_URL", "https://models.inference.ai.azure.com"), api_key=os.getenv("GITHUB_TOKEN"), temperature=0.7)
            messages = [{"role": "user", "content": prompt}]
            resp = client.invoke(messages)
            return getattr(resp, "content", str(resp)).strip()

        if API_HOST == "azure":
            import azure.identity
            token_provider = azure.identity.get_bearer_token_provider(
                azure.identity.DefaultAzureCredential(),
                "https://cognitiveservices.azure.com/.default",
            )
            client = ChatOpenAI(model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"), base_url=os.environ["AZURE_OPENAI_ENDPOINT"] + "/openai/v1", api_key=token_provider, temperature=0.7)
            messages = [{"role": "user", "content": prompt}]
            resp = client.invoke(messages)
            return getattr(resp, "content", str(resp)).strip()

        if API_HOST == "ollama":
            client = ChatOpenAI(model=os.getenv("OLLAMA_MODEL", "llama3.1"), base_url=os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434/v1"), api_key="none", temperature=0.7)
            messages = [{"role": "user", "content": prompt}]
            resp = client.invoke(messages)
            return getattr(resp, "content", str(resp)).strip()

    # Fallback: try direct OpenAI python package if available
    try:
        import openai
    except Exception:
        raise RuntimeError("No supported LLM client available")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set")
    openai.api_key = api_key
    try:
        resp = openai.ChatCompletion.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError("OpenAI call failed") from e


def _load_model():
    """Optional model loader used in tests or when an external client is available.

    Tests monkeypatch this function (`app.nodes.generation_node._load_model`) to
    return a dummy model with an `invoke(messages)` method. In normal runtime
    this attempts to load a LangChain-style client or returns None.
    """
    try:
        # Try to import a LangChain-compatible client if present
        from langchain_openai import ChatOpenAI
    except Exception:
        return None
    try:
        # Instantiate a minimal client if possible. If environment isn't
        # configured we return None so caller falls back to other paths.
        model_name = os.getenv("OPENAI_MODEL", os.getenv("GITHUB_MODEL", "gpt-4o-mini"))
        client = ChatOpenAI(model=model_name)
        return client
    except Exception:
        return None


@traceable
def generation_node(state: WorkflowState) -> WorkflowState:
    """
    Generate a retail-aware personalized message.

    Inputs used from `state`:
      - `retrieval_context` (str)
      - `segment` (str)
      - `customer_profile` (dict) -> loyalty tier, preferred_category
      - `behavior_summary` (dict)

    Outputs:
      - `answer` (str): the personalized message
      - `model_metadata` (dict): whether fallback/template or LLM was used
    """
    # build a compact prompt for LLM (if used)
    retrieval_context = state.get("retrieval_context") or ""
    segment = state.get("segment") or "general"
    profile = state.get("customer_profile") or {}
    tier = profile.get("tier") or profile.get("loyalty_tier") or "Bronze"
    preferred_category = profile.get("preferred_category") or profile.get("last_viewed_category") or ""
    behavior = state.get("behavior_summary") or {}

    behavior_lines = []
    if behavior:
        behavior_lines.append(f"views_last_7d={behavior.get('views_last_7d', 0)}")
        behavior_lines.append(f"cart_events_last_7d={behavior.get('cart_events_last_7d', 0)}")
        behavior_lines.append(f"purchases_last_30d={behavior.get('purchases_last_30d', 0)}")

    prompt = f"""
You are a retail personalization generator. Create a concise (<120 words), friendly marketing message.

CUSTOMER SEGMENT: {segment}
LOYALTY TIER: {tier}
PREFERRED CATEGORY: {preferred_category}

RECENT BEHAVIOR:
{"; ".join(behavior_lines)}

RETRIEVAL CONTEXT:
{retrieval_context}

Guidelines:
- Adjust tone for segment (e.g., cart_abandoner -> checkout help + deals; frequent_browser -> comparisons; high_value -> VIP tone).
- Mention preferred category when relevant; keep message helpful and short; add a clear CTA.
"""

    # Prefer an explicit model loader (tests patch this); otherwise try chat
    used_model = "template"
    answer = None
    model = None
    try:
        model = _load_model()
    except Exception:
        model = None

    if model is not None:
        try:
            # Accept either a sequence of messages or raw prompt depending on client
            try:
                resp = model.invoke([{"role": "user", "content": prompt}])
            except Exception:
                resp = model.invoke(prompt)
            answer = getattr(resp, "content", str(resp)).strip()
            used_model = getattr(model, "model_name", "external-model")
        except Exception:
            logger.info("Model invocation failed; falling back to chat/openai path")
            model = None

    if model is None:
        try:
            answer = _call_openai_chat(prompt)
            used_model = os.getenv("OPENAI_MODEL", "openai-chat")
        except Exception:
            logger.info("LLM call unavailable or failed; falling back to template generator")
            answer = _template_generate({
                "segment": segment,
                "customer_profile": profile,
                "retrieval_context": retrieval_context,
                "behavior_summary": behavior,
            })

    return {
        "answer": answer,
        "model_metadata": {"model_used": used_model},
    }
