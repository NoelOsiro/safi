"""Simple workflow graph that composes nodes into a linear pipeline.

This module wires the high-level nodes together so callers can run the
full flow as: segmentation -> retrieval -> generation. It's intentionally
minimal so you can extend routing, branching, and async execution later.
"""

from typing import Dict, Any

from app.state.workflow_state import WorkflowState, new_workflow_state

# Import nodes lazily within functions to avoid heavy imports at module import time

def run_pipeline(initial_state: Dict[str, Any]) -> WorkflowState:
	"""Run the default pipeline: segmentation -> retrieval -> generation.

	`initial_state` should be a partial WorkflowState (e.g. containing `user`).
	Returns the final merged state produced by the last node.
	"""
	# create a WorkflowState object if needed
	state = new_workflow_state()
	state.update(initial_state or {})

	# segmentation
	try:
		from app.nodes.segmentation_node import segmentation_node
		seg_updates = segmentation_node(state) or {}
		state.update(seg_updates)
	except Exception:
		# segmentation is optional; continue
		pass

	# retrieval
	try:
		from app.nodes.retrieval_node import retrieval_node
		ret_updates = retrieval_node(state) or {}
		state.update(ret_updates)
	except Exception:
		# retrieval is optional; continue
		pass

	# generation
	try:
		from app.nodes.generation_node import generation_node
		gen_updates = generation_node(state) or {}
		state.update(gen_updates)
	except Exception:
		# generation may fail if model isn't available; return partial state
		pass

	return state

