from fastapi.testclient import TestClient
from app.api.main import app


def main():
    # Ensure graph is available even if startup event didn't run in this context
    try:
        from app.graph.workflow_graph import build_default_graph

        if getattr(app.state, "graph", None) is None:
            app.state.graph = build_default_graph()
    except Exception:
        # proceed; endpoints will return 503 if graph truly unavailable
        pass

    client = TestClient(app)
    state = {
        "user": {"message": "Do you have deals on electronics?"},
        "segment": "frequent_browser",
        "customer_profile": {
            "preferred_category": "electronics.smartphone",
            "preferred_brand": "Acme",
        },
        "behavior_summary": {"views_last_7d": 30, "cart_events_last_7d": 1, "purchases_last_30d": 0},
    }

    resp = client.post("/assistant", json={"state": state})
    print("status_code:", resp.status_code)
    try:
        j = resp.json()
        print("json:", j)
        print('\nfinal_answer:', j.get('final_answer'))
        print('safety_metadata:', j.get('safety_metadata'))
    except Exception:
        print("text:", resp.text)


if __name__ == "__main__":
    main()
