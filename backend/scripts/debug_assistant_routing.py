from fastapi.testclient import TestClient
from app.api.main import app
from app.graph.workflow_graph import build_default_graph
import json

# ensure graph
if getattr(app.state, 'graph', None) is None:
    app.state.graph = build_default_graph()

client = TestClient(app)
state = {'bypass_segmentation': True, 'segment': 'sensitive', 'routing_hint': 'require_manual_review', 'customer_profile': {'preferred_category':'electronics'}}
resp = client.post('/assistant', json={'state': state})
print('status', resp.status_code)
try:
    print(json.dumps(resp.json(), indent=2))
except Exception:
    print(resp.text)
