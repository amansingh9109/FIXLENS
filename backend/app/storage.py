"""Local SQLite persistence for sessions and validated evidence bytes."""
import json
import sqlite3
from contextlib import contextmanager

from .config import DATA_DIR


@contextmanager
def connect():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATA_DIR / "fixlens.sqlite3", timeout=30)
    try:
        with connection:
            connection.execute("CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, payload TEXT NOT NULL)")
            connection.execute("CREATE TABLE IF NOT EXISTS evidence (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, data BLOB NOT NULL, mime TEXT NOT NULL)")
            yield connection
    finally:
        connection.close()


def save_session(session):
    with connect() as connection:
        connection.execute("INSERT OR REPLACE INTO sessions VALUES (?, ?)", (session["session_id"], json.dumps(session)))


def load_session(session_id):
    with connect() as connection:
        row = connection.execute("SELECT payload FROM sessions WHERE id = ?", (session_id,)).fetchone()
    return json.loads(row[0]) if row else None


def save_evidence(evidence_id, session_id, data, mime):
    with connect() as connection:
        connection.execute("INSERT INTO evidence VALUES (?, ?, ?, ?)", (evidence_id, session_id, data, mime))


def load_evidence(evidence_id, session_id):
    with connect() as connection:
        row = connection.execute("SELECT data, mime FROM evidence WHERE id = ? AND session_id = ?", (evidence_id, session_id)).fetchone()
    return tuple(row) if row else None
