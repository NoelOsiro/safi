from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import logging
from fastapi import Path

try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None

# WorkflowState typing available via app.state.workflow_state if needed

app = FastAPI(title="safi-retail-assistant", version="0.1")


class StatePayload(BaseModel):
    state: Dict[str, Any]


class SegmentResponse(BaseModel):
    segment: Dict[str, Any]
    segment_reason: Optional[str]
    segment_scores: Optional[Dict[str, float]]


class RetrievedDoc(BaseModel):
    id: str
    title: Optional[str]
    text: Optional[str]
    source: Optional[str]
    score: Optional[float]


class RetrievalResponse(BaseModel):
    retrieved_docs: List[RetrievedDoc]
    retrieval_context: Optional[str]


class OfferItem(BaseModel):
    id: str
    product_id: Optional[str]
    title: Optional[str]
    brand: Optional[str]
    price: Optional[float]
    discount: Optional[bool]
    in_stock: Optional[bool]


class OffersResponse(BaseModel):
    offers: List[OfferItem]
    offers_metadata: Optional[Dict[str, Any]]


class GenerationResponse(BaseModel):
    answer: str
    model_metadata: Dict[str, Any]


class AssistantResponse(BaseModel):
    final_answer: Optional[str]
    safety_metadata: Optional[Dict[str, Any]]
    full_state: Dict[str, Any]



@app.on_event("startup")
async def startup_event():
    # Load .env if python-dotenv is available (improves local dev UX)
    if load_dotenv is not None:
        try:
            load_dotenv()
        except Exception:
            logging.getLogger("app.api.main").warning("load_dotenv() failed; continuing")

    # lazy import of the graph builder and fail-fast if graph cannot be built
    try:
        from app.graph.workflow_graph import build_default_graph

        app.state.graph = build_default_graph()
        logging.getLogger("app.api.main").info("workflow graph initialized with nodes: %s", list(app.state.graph.nodes.keys()))
    except Exception as e:
        # Fail startup so the server doesn't run silently without core graph
        logging.getLogger("app.api.main").exception("Failed to build workflow graph on startup: %s", e)
        raise


@app.get("/health/live")
async def live():
    return {"status": "alive"}


@app.get("/health/ready")
async def ready():
    g = getattr(app.state, "graph", None)
    if g is None:
        raise HTTPException(status_code=503, detail="workflow graph not initialized")
    return {"status": "ready"}


@app.post("/segment")
async def segment_endpoint(payload: StatePayload) -> SegmentResponse:
    g = getattr(app.state, "graph", None)
    if g is None:
        raise HTTPException(status_code=503, detail="workflow graph not initialized")
    try:
        # Allow tests to bypass segmentation/start later in the graph by setting `bypass_segmentation`.
        start_node = "segmentation"
        if isinstance(payload.state, dict) and payload.state.get("bypass_segmentation"):
            # start from retrieval when bypassing segmentation (useful for tests)
            start_node = "retrieval"
        out = g.run(start_node, payload.state)
        return SegmentResponse(
            segment=out.get("segment") or {},
            segment_reason=out.get("segment_reason"),
            segment_scores=out.get("segment_scores"),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger("app.api.main").exception("segment endpoint failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/retrieve")
async def retrieve_endpoint(payload: StatePayload) -> RetrievalResponse:
    g = getattr(app.state, "graph", None)
    if g is None:
        raise HTTPException(status_code=503, detail="workflow graph not initialized")
    try:
        out = g.run("retrieval", payload.state)
        return RetrievalResponse(
            retrieved_docs=out.get("retrieved_docs") or [],
            retrieval_context=out.get("retrieval_context"),
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger("app.api.main").exception("retrieve endpoint failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/offers")
async def offers_endpoint(payload: StatePayload) -> OffersResponse:
    g = getattr(app.state, "graph", None)
    if g is None:
        raise HTTPException(status_code=503, detail="workflow graph not initialized")
    try:
        out = g.run("offers", payload.state)
        return OffersResponse(offers=out.get("offers") or [], offers_metadata=out.get("offers_metadata"))
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger("app.api.main").exception("offers endpoint failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate")
async def generate_endpoint(payload: StatePayload) -> GenerationResponse:
    g = getattr(app.state, "graph", None)
    if g is None:
        raise HTTPException(status_code=503, detail="workflow graph not initialized")
    try:
        out = g.run("generation", payload.state)
        return GenerationResponse(answer=out.get("answer") or "", model_metadata=out.get("model_metadata") or {})
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger("app.api.main").exception("generate endpoint failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/assistant")
async def assistant_endpoint(payload: StatePayload):
    """Run the full workflow graph from segmentation -> retrieval -> offers -> generation.

    The graph's `run` method accepts a start node and a payload.
    We'll start from `segmentation` for the full pipeline.
    """
    g = getattr(app.state, "graph", None)
    if g is None:
        raise HTTPException(status_code=503)
    try:
        out = g.run("segmentation", payload.state)
        # Ensure safety ran and expose final_answer + safety_metadata for API consumers
        final = out.get("final_answer") or out.get("answer") or ""
        safety = out.get("safety_metadata")
        return AssistantResponse(final_answer=final, safety_metadata=safety, full_state=out)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/hitl/{hitl_id}/approve")
async def hitl_approve(hitl_id: str = Path(...), reviewer: Dict[str, str] = None):
    """Approve a pending HITL review. This will mark the review approved and
    return the updated review record. In a full implementation this would
    resume the workflow (delivery) or trigger the delivery node.
    """
    try:
        from app.services.hitl_store import approve_review, get_review

        rec = get_review(hitl_id)
        if not rec:
            raise HTTPException(status_code=404, detail="hitl review not found")
        reviewer_name = (reviewer or {}).get("reviewer") if isinstance(reviewer, dict) else None
        if not reviewer_name:
            reviewer_name = "console"
        updated = approve_review(hitl_id, reviewer_name)
        if not updated:
            raise HTTPException(status_code=500, detail="failed to approve")
        # Attempt to resume workflow by invoking delivery node with the stored full_state
        try:
            from app.nodes.delivery_node import delivery_node
            # use the stored full_state and prefer any modified_text
            state = updated.get("full_state") or {}
            if updated.get("modified_text"):
                # replace final_answer in the state with the modified_text
                state = dict(state)
                state["final_answer"] = updated.get("modified_text")
                state["answer"] = updated.get("modified_text")
            delivery_result = delivery_node(state)
            return {"review": updated, "delivery": delivery_result}
        except Exception:
            # If delivery fails, still return the review record
            return {"review": updated}
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger("app.api.main").exception("hitl approve failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/hitl/{hitl_id}")
async def hitl_get(hitl_id: str = Path(...)):
    try:
        from app.services.hitl_store import get_review

        rec = get_review(hitl_id)
        if not rec:
            raise HTTPException(status_code=404, detail="hitl review not found")
        return rec
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger("app.api.main").exception("hitl get failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/hitl/submit")
async def hitl_submit(payload: StatePayload):
    """Submit a state for manual review (used by nodes or external systems).

    Accepts a JSON body with `state` key containing the workflow state.
    Returns the created `hitl_id` and the stored review record.
    """
    try:
        from app.services.hitl_store import create_review, get_review

        state = payload.state or {}
        # build minimal review record
        review_payload = {
            "trace_id": (state.get("offers_metadata") or {}).get("trace_id") or (state.get("model_metadata") or {}).get("trace_id"),
            "final_answer": state.get("final_answer") or state.get("answer"),
            "safety_metadata": state.get("safety_metadata"),
            "full_state": state,
        }
        hitl_id = create_review(review_payload)
        rec = get_review(hitl_id)
        return {"hitl_id": hitl_id, "review": rec}
    except Exception as e:
        logging.getLogger("app.api.main").exception("hitl submit failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

