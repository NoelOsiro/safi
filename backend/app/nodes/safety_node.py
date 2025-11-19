import os
import logging


try:
    from langsmith import traceable
except Exception:
    def traceable(func):
        return func

try:
    from langchain_openai import ChatOpenAI
except Exception:
    ChatOpenAI = None

from app.state.workflow_state import WorkflowState


logger = logging.getLogger("safety_node")
logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------
# Utility: load LLM lightweight checker model
# ---------------------------------------------------------
def _load_safety_model():
    """
    Loads a lightweight model for safety classification.
    Prefer small models for cheap / fast evaluation.
    """
    API_HOST = os.getenv("API_HOST", "github")

    model_name = os.getenv("SAFETY_MODEL", "gpt-4o-mini")

    if ChatOpenAI is None:
        raise RuntimeError("langchain_openai.ChatOpenAI is required for safety checks")

    if API_HOST == "github":
        return ChatOpenAI(
            model=os.getenv("GITHUB_MODEL", model_name),
            base_url="https://models.inference.ai.azure.com",
            api_key=os.environ.get("GITHUB_TOKEN"),
            temperature=0,
        )

    elif API_HOST == "azure":
        import azure.identity

        token_provider = azure.identity.get_bearer_token_provider(
            azure.identity.DefaultAzureCredential(),
            "https://cognitiveservices.azure.com/.default",
        )

        return ChatOpenAI(
            model=os.environ.get("AZURE_OPENAI_CHAT_DEPLOYMENT"),
            base_url=os.environ["AZURE_OPENAI_ENDPOINT"] + "/openai/v1",
            api_key=token_provider,
            temperature=0,
        )

    elif API_HOST == "ollama":
        return ChatOpenAI(
            model=os.getenv("OLLAMA_SAFETY_MODEL", "llama3.1"),
            base_url=os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434/v1"),
            api_key="none",
            temperature=0,
        )

    return ChatOpenAI(model=model_name, temperature=0)


# ---------------------------------------------------------
# Safety Scoring Prompt
# ---------------------------------------------------------
SAFETY_SYSTEM_PROMPT = """
You are a safety classifier.

Given a piece of text, classify it using the following JSON format strictly:

{
  "contains_pii": true/false,
  "contains_hate": true/false,
  "contains_self_harm": true/false,
  "contains_violence": true/false,
  "contains_toxic_language": true/false,
  "is_hallucination": true/false,
  "needs_blocking": true/false,
  "explanation": "short explanation here"
}

Rules:
- If any unsafe category is true → needs_blocking = true.
- Consider hallucination as: content contradicts user-provided context (summarize based on message_sent and retrieval_context).
- Output MUST be valid JSON.
"""


# ---------------------------------------------------------
# Safety Node
# ---------------------------------------------------------
@traceable
def safety_node(state: WorkflowState) -> WorkflowState:
    """
    Evaluate the generated answer for safety.
    Inputs:
      - state["answer"]
      - state["retrieval_context"]
      - state["user"]["message"]

    Output:
      - safety_metadata
      - (optionally) rewritten safe answer
    """

    answer = state.get("answer")
    retrieval_context = state.get("retrieval_context", "")
    user_message = None

    if isinstance(state.get("user"), dict):
        user_message = state["user"].get("message")

    if not answer:
        logger.warning("safety_node: No answer provided. Skipping.")
        return {"safety_metadata": {"skipped": True}}

    # Prepare prompt
    content_to_check = f"""
User message:
{user_message}

Retrieved context:
{retrieval_context}

Model answer:
{answer}
"""

    messages = [
        {"role": "system", "content": SAFETY_SYSTEM_PROMPT},
        {"role": "user", "content": content_to_check},
    ]

    # Load safety model
    try:
        model = _load_safety_model()
    except Exception as e:
        logger.exception("Failed to load safety model: %s", e)
        return {"safety_metadata": {"error": "model_load_failure"}}

    # Run safety analysis
    try:
        response = model.invoke(messages)
        raw_text = response.content.strip()
    except Exception as e:
        logger.exception("Safety analysis failed: %s", e)
        return {"safety_metadata": {"error": "safety_eval_failed"}}

    # Parse JSON response
    import json

    try:
        safety_json = json.loads(raw_text)
    except Exception:
        logger.error("Safety JSON parse error, raw response: %s", raw_text)
        return {"safety_metadata": {"error": "invalid_json", "raw": raw_text}}

    # If unsafe → rewrite answer
    if safety_json.get("needs_blocking"):
        rewritten_answer = (
            "I cannot provide that information safely. "
            "Here is a safer alternative:\n\n"
            "I’m here to help, but I cannot provide unsafe or harmful content based on your request."
        )

        return {
            "safety_metadata": safety_json,
            "answer": rewritten_answer,
        }

    # Otherwise allow the answer as-is
    return {
        "safety_metadata": safety_json
    }
class SafetyNode:
    """Placeholder safety node."""

    def process(self, payload):
        raise NotImplementedError("Safety checks not implemented")
