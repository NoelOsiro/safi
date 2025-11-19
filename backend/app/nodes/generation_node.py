import os
import logging
import time

try:
    from langsmith import traceable
except Exception:
    # Fallback no-op decorator when langsmith isn't installed (helps local dev/test)
    def traceable(func):
        return func


from app.state.workflow_state import WorkflowState


logger = logging.getLogger("generation_node")
logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------
# Utility: load LLM safely using your repo's environment logic
# ---------------------------------------------------------
def _load_model():
    """Load the LLM model according to your backend preference."""
    API_HOST = os.getenv("API_HOST", "github")

    # Import ChatOpenAI lazily to avoid import-time failures when the package
    # isn't installed in lightweight test environments.
    try:
        from langchain_openai import ChatOpenAI
    except Exception as e:
        raise RuntimeError(
            "langchain_openai is required to load the model. Install it or set up a mock adapter."
        ) from e

    if API_HOST == "azure":
        import azure.identity

        token_provider = azure.identity.get_bearer_token_provider(
            azure.identity.DefaultAzureCredential(),
            "https://cognitiveservices.azure.com/.default",
        )
        return ChatOpenAI(
            model=os.environ.get("AZURE_OPENAI_CHAT_DEPLOYMENT"),
            base_url=os.environ["AZURE_OPENAI_ENDPOINT"] + "/openai/v1",
            api_key=token_provider,
            temperature=float(os.getenv("GENERATION_TEMPERATURE", 0.2)),
        )

    elif API_HOST == "github":
        return ChatOpenAI(
            model=os.getenv("GITHUB_MODEL", "gpt-4o"),
            base_url="https://models.inference.ai.azure.com",
            api_key=os.environ.get("GITHUB_TOKEN"),
            temperature=float(os.getenv("GENERATION_TEMPERATURE", 0.2)),
        )

    elif API_HOST == "ollama":
        return ChatOpenAI(
            model=os.getenv("OLLAMA_MODEL", "llama3.1"),
            base_url=os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434/v1"),
            api_key="none",
            temperature=float(os.getenv("GENERATION_TEMPERATURE", 0.2)),
        )

    # fallback OpenAI
    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        temperature=float(os.getenv("GENERATION_TEMPERATURE", 0.2)),
    )


# ---------------------------------------------------------
# Retry wrapper for generation
# ---------------------------------------------------------
def _safe_generate(model, messages: list, retries: int = 2, backoff: float = 0.5):
    last_exc = None

    for attempt in range(1, retries + 2):
        try:
            start = time.time()
            response = model.invoke(messages)
            latency = int((time.time() - start) * 1000)
            return response, latency
        except Exception as e:
            last_exc = e
            logger.warning(f"Generation attempt {attempt} failed: {e}")
            time.sleep(backoff * attempt)

    raise last_exc


# ---------------------------------------------------------
# GENERATION NODE
# ---------------------------------------------------------
@traceable
def generation_node(state: WorkflowState) -> WorkflowState:
    """
    The final generation step.
    Consumes:
        - state["retrieval_context"]
        - state["user"]["message"]
        - optional state["segment"]

    Produces:
        - state["answer"]
        - state["model_metadata"]
    """

    user_msg = None
    if isinstance(state.get("user"), dict):
        user_msg = state["user"].get("message")

    if not user_msg:
        logger.warning("generation_node: No user message found.")
        return {"answer": "(No user query provided.)", "model_metadata": None}

    retrieval_context = state.get("retrieval_context", "")
    segment = state.get("segment")

    # ---------------------------------------------------------
    # Construct prompts
    # ---------------------------------------------------------
    system_prompt = (
        "You are an assistant that answers ONLY using the provided retrieval context.\n"
        "If the context is empty, say 'I do not have enough information to answer that.'\n"
        "Be clear, concise, and helpful."
    )

    if segment:
        system_prompt += f"\n\nThis query belongs to the segment: '{segment}'. Prioritize relevant extracted content."

    if not retrieval_context:
        # Provide a graceful fallback instruction
        retrieval_context = "(No retrieved documents provided.)"

    # Final LLM inputs
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "assistant", "content": f"Retrieved context:\n{retrieval_context}"},
        {"role": "user", "content": user_msg},
    ]

    # ---------------------------------------------------------
    # Load model
    # ---------------------------------------------------------
    try:
        model = _load_model()
    except Exception as e:
        logger.exception("Failed to load model: %s", e)
        return {"answer": "Model loading failed.", "model_metadata": None}

    # ---------------------------------------------------------
    # Generate with retry
    # ---------------------------------------------------------
    try:
        response, latency = _safe_generate(model, messages)
    except Exception as e:
        logger.exception("Generation failed: %s", e)
        return {"answer": "Generation failed.", "model_metadata": None}

    answer = response.content if hasattr(response, "content") else str(response)

    # ---------------------------------------------------------
    # Build metadata for observability
    # ---------------------------------------------------------
    metadata = {
        "model": getattr(model, "model", None),
        "latency_ms": latency,
        "segment": segment,
        "context_length": len(retrieval_context),
    }

    # ---------------------------------------------------------
    # Return state update
    # ---------------------------------------------------------
    return {
        "answer": answer,
        "model_metadata": metadata,
    }
