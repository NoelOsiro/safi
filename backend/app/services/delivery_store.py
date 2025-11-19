import sqlite3
from pathlib import Path
from typing import Optional, Dict, Any
import json

# Keep same name for monkeypatching in tests
_DEFAULT_PATH = Path(__file__).resolve().parents[2] / "data" / "delivery.db"
_DEFAULT_PATH.parent.mkdir(parents=True, exist_ok=True)


def _get_conn(path: Optional[Path] = None):
    path = Path(path) if path is not None else _DEFAULT_PATH
    conn = sqlite3.connect(str(path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS delivery_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hitl_id TEXT,
            trace_id TEXT,
            delivered_at TEXT,
            channel TEXT,
            message TEXT
        )
        """
    )
    conn.commit()
    return conn


def create_event(payload: Dict[str, Any], path: Optional[Path] = None) -> Dict[str, Any]:
    conn = _get_conn(path)
    conn.execute(
        "INSERT INTO delivery_events(hitl_id, trace_id, delivered_at, channel, message) VALUES (?, ?, ?, ?, ?)",
        (payload.get("hitl_id"), payload.get("trace_id"), payload.get("delivered_at"), payload.get("channel"), payload.get("message")),
    )
    conn.commit()
    conn.close()
    return payload


def get_event(hitl_id: str, path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    conn = _get_conn(path)
    cur = conn.execute("SELECT * FROM delivery_events WHERE hitl_id = ?", (hitl_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {"hitl_id": row["hitl_id"], "trace_id": row["trace_id"], "delivered_at": row["delivered_at"], "channel": row["channel"], "message": row["message"]}
