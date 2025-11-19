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
from app.config.segment_rules import SEGMENT_RULES

logger = logging.getLogger("generation_node")
logging.basicConfig(level=logging.INFO)


# Use shared SEGMENT_RULES from config


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
    persona_signals = state.get("persona_signals") or {}
    routing_hint = state.get("routing_hint") or (seg_raw.get("routing_hint") if isinstance(seg_raw, dict) else None)

    lines = []
    # Consult SEGMENT_RULES for guidance (tone, length, must_include, cta)
    rule = SEGMENT_RULES.get(seg, SEGMENT_RULES.get("general", {}))
    tone = rule.get("tone") or "friendly"
    must_include = rule.get("must_include", [])
    cta = rule.get("cta") or "Shop now"
    preferred_length = rule.get("preferred_length") or 120

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

    # join and ensure under preferred length (words). Guarantee CTA is present.
    msg = " ".join(lines)
    words = msg.split()
    max_words = int(preferred_length) if isinstance(preferred_length, (int, float)) else 120
    cta_text = (cta.capitalize() + ".") if cta else ""

    # Finalize message while enforcing preferred_length and guaranteeing CTA.
    cta_words = cta_text.split() if cta_text else []

    if len(words) > max_words:
        truncated_words = words[:max_words]
        # If CTA not present in truncated words, ensure CTA words occupy the end
        if cta_words and (cta_text.rstrip('.') not in " ".join(truncated_words)):
            if len(cta_words) >= max_words:
                new_words = cta_words[:max_words]
            else:
                new_words = truncated_words[: max_words - len(cta_words)] + cta_words
        else:
            new_words = truncated_words
        msg = " ".join(new_words)
    else:
        # Not truncated: ensure CTA present but do not exceed max_words
        current_words = msg.split()
        if cta_words and (cta_text.rstrip('.') not in msg):
            if len(current_words) + len(cta_words) > max_words:
                keep = max_words - len(cta_words)
                if keep < 0:
                    # CTA longer than max, truncate CTA to fit
                    new_words = cta_words[:max_words]
                else:
                    new_words = current_words[:keep] + cta_words
            else:
                new_words = current_words + cta_words
            msg = " ".join(new_words)

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

    # Ensure persona signals and routing hint are defined for later use
    persona_signals = state.get("persona_signals") or {}
    routing_hint = state.get("routing_hint") or (segment.get("routing_hint") if isinstance(segment, dict) else None)

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

    # Augment prompt with explicit LLM guidance from SEGMENT_RULES when available
    seg_rule = SEGMENT_RULES.get(segment.lower() if isinstance(segment, str) else (segment.get("segment_id") if isinstance(segment, dict) else "general"), {})
    llm_tone = seg_rule.get("tone")
    llm_length = seg_rule.get("preferred_length")
    llm_cta = seg_rule.get("cta")
    if llm_tone or llm_length or llm_cta or persona_signals:
        guidance_lines = ["LLM_HINTS:"]
        if llm_tone:
            guidance_lines.append(f"- Tone: {llm_tone}")
        if llm_length:
            guidance_lines.append(f"- Target length (words): {llm_length}")
        if llm_cta:
            guidance_lines.append(f"- Prefer CTA: {llm_cta}")
        if persona_signals:
            guidance_lines.append(f"- Persona signals: {persona_signals}")
        if routing_hint:
            guidance_lines.append(f"- Routing hint: {routing_hint}")
        prompt += "\n" + "\n".join(guidance_lines) + "\n"

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
                "persona_signals": persona_signals,
                "routing_hint": routing_hint,
            })

    # attach trace_id from upstream offers if present for observability
    trace_id = None
    try:
        if isinstance(state, dict):
            offers_meta = state.get("offers_metadata")
            if isinstance(offers_meta, dict) and offers_meta.get("trace_id"):
                trace_id = offers_meta.get("trace_id")
    except Exception:
        trace_id = None

    model_metadata = {"model_used": used_model}
    if trace_id:
        model_metadata["trace_id"] = trace_id

    # Return merged state so upstream keys (e.g. `offers`) are preserved
    out_state = dict(state) if isinstance(state, dict) else {}
    out_state.update({"answer": answer, "model_metadata": model_metadata})
    return out_state
