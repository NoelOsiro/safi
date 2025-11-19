"""Lightweight analytics helpers used by local tests and telemetry hooks.

This module provides a minimal `log_a_b_result` implementation so the
retriever can persist observability rows without requiring external
infrastructure. For production, replace this with a connector to your
analytics backend (BigQuery, Datadog, S3, etc.).
"""
import json
import logging
import os
from typing import Dict, Any

logger = logging.getLogger("app.agents.analytics")
logging.basicConfig(level=logging.INFO)


def _get_local_path() -> str:
	d = os.path.join(os.getcwd(), "data")
	try:
		os.makedirs(d, exist_ok=True)
	except Exception:
		pass
	return os.path.join(d, "analytics_ab_results.jsonl")


def log_a_b_result(row: Dict[str, Any]) -> bool:
	"""Persist a single observability/AB row locally as JSONL and log it.

	Returns True if persisted, False on error. This is intentionally
	lightweight and synchronous to keep test behavior deterministic.
	"""
	try:
		path = _get_local_path()
		with open(path, "a", encoding="utf-8") as fh:
			fh.write(json.dumps(row, default=str) + "\n")
		logger.info("analytics: persisted ab row: %s", {"top_ids": row.get("top_ids")})
		return True
	except Exception:
		logger.exception("analytics: failed to persist ab row")
		return False


def noop(*_args, **_kwargs):
	return None


# Backwards-compatible aliases
persist_observation = log_a_b_result
