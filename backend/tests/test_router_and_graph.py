from app.graph.router import router_node, run_graph
from app.state.workflow_state import new_workflow_state


def test_router_node_decisions():
    s = new_workflow_state()
    # no user
    res = router_node(s)
    assert res["next_node"] is None

    # has user, no segment
    s["user"] = {"message": "hi"}
    res = router_node(s)
    assert res["next_node"] == "segmentation_node"

    # has segment, no retrieved_docs
    s["segment"] = "billing"
    if "retrieved_docs" in s:
        del s["retrieved_docs"]
    res = router_node(s)
    assert res["next_node"] == "retrieval_node"

    # has retrieved_docs, no answer
    s["retrieved_docs"] = [{"id": "d1"}]
    if "answer" in s:
        del s["answer"]
    res = router_node(s)
    assert res["next_node"] == "generation_node"

    # has answer, no safety
    s["answer"] = "ok"
    if "safety_metadata" in s:
        del s["safety_metadata"]
    res = router_node(s)
    assert res["next_node"] == "safety_node"

    # has answer and safety
    s["safety_metadata"] = {"needs_blocking": False}
    res = router_node(s)
    assert res["next_node"] == "response_node"


def test_run_graph_with_mocks():
    # simple mocks for nodes
    def seg(state):
        return {"segment": "billing"}

    def ret(state):
        return {"retrieved_docs": [{"id": "d1", "text": "doc text"}], "retrieval_context": "doc text"}

    def gen(state):
        return {"answer": "Generated answer"}

    def safe(state):
        return {"safety_metadata": {"needs_blocking": False}}

    def resp(state):
        return {"final_response": {"answer": state.get("answer")}}

    nodes = {
        "segmentation_node": seg,
        "retrieval_node": ret,
        "generation_node": gen,
        "safety_node": safe,
        "response_node": resp,
    }

    s = new_workflow_state()
    s["user"] = {"message": "hi"}

    final = run_graph(s, nodes, max_steps=10)
    assert "final_response" in final
    assert final["final_response"]["answer"] == "Generated answer"
