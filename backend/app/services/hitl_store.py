import sqlite3
import uuid
from pathlib import Path
from typing import Optional, Dict, Any
import json

# Keep the same name for tests to monkeypatch
_DEFAULT_PATH = Path(__file__).resolve().parents[2] / "data" / "hitl.db"
_DEFAULT_PATH.parent.mkdir(parents=True, exist_ok=True)


def _get_conn(path: Optional[Path] = None):
    path = Path(path) if path is not None else _DEFAULT_PATH
    conn = sqlite3.connect(str(path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # ensure table exists
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS hitl_reviews (
            hitl_id TEXT PRIMARY KEY,
            status TEXT,
            reviewer TEXT,
            approved_at TEXT,
            modified_text TEXT,
            trace_id TEXT,
            final_answer TEXT,
            safety_metadata TEXT,
            full_state TEXT
        )
        """
    )
    conn.commit()
    return conn


def create_review(payload: Dict[str, Any], path: Optional[Path] = None) -> str:
    conn = _get_conn(path)
    hitl_id = str(uuid.uuid4())
    safety_json = json.dumps(payload.get("safety_metadata")) if payload.get("safety_metadata") is not None else None
    full_state_json = json.dumps(payload.get("full_state")) if payload.get("full_state") is not None else None
    conn.execute(
        "INSERT INTO hitl_reviews(hitl_id, status, trace_id, final_answer, safety_metadata, full_state) VALUES (?, ?, ?, ?, ?, ?)",
        (hitl_id, "pending", payload.get("trace_id"), payload.get("final_answer"), safety_json, full_state_json),
    )
    conn.commit()
    conn.close()
    return hitl_id


def get_review(hitl_id: str, path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    conn = _get_conn(path)
    cur = conn.execute("SELECT * FROM hitl_reviews WHERE hitl_id = ?", (hitl_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "hitl_id": row["hitl_id"],
        "status": row["status"],
        "reviewer": row["reviewer"],
        "approved_at": row["approved_at"],
        "modified_text": row["modified_text"],
        "trace_id": row["trace_id"],
        "final_answer": row["final_answer"],
        "safety_metadata": json.loads(row["safety_metadata"]) if row["safety_metadata"] else None,
        "full_state": json.loads(row["full_state"]) if row["full_state"] else None,
    }


def approve_review(hitl_id: str, reviewer: str, modified_text: Optional[str] = None, path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    conn = _get_conn(path)
    approved_at = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    conn.execute(
        "UPDATE hitl_reviews SET status = ?, reviewer = ?, approved_at = ?, modified_text = ? WHERE hitl_id = ?",
        ("approved", reviewer, approved_at, modified_text, hitl_id),
    )
    conn.commit()
    conn.close()
    return get_review(hitl_id, path)
