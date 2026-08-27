"""
SQLite persistence layer (libSQL-compatible; ports to Turso by swapping the connection).

Schema v2 — every sampled answer is traceable to the exact method that produced it:
spec version, prompt-set version + variant, engine model, grounding mode, judge
version. A number that can't name its method is not publishable; the schema
enforces that at write time.

Tables:
  runs      — one row per (engine, capability, variant) sample: raw answer + full method metadata
  routings  — products the judge extracted from each run (the structured signal)
  citations — source URLs the engine itself cited (grounded runs populate this)
  rollups   — daily aggregates per capability/product (what the API and site read)
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "marketmaker.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    ts             TEXT NOT NULL,
    run_date       TEXT NOT NULL,
    engine         TEXT NOT NULL,
    model          TEXT NOT NULL,
    grounding_mode TEXT NOT NULL,     -- 'web_search' | 'grounded' | 'native' | 'none'
    temperature    REAL,
    category       TEXT NOT NULL,
    capability     TEXT NOT NULL,
    prompt_set     TEXT NOT NULL,     -- prompt-set version, e.g. 'ps-0.1'
    variant        TEXT NOT NULL,     -- prompt variant id within the set
    prompt         TEXT NOT NULL,
    spec_version   TEXT NOT NULL,
    raw_answer     TEXT
);
CREATE TABLE IF NOT EXISTS routings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id        INTEGER NOT NULL REFERENCES runs(id),
    product       TEXT NOT NULL,
    role          TEXT,               -- 'primary' | 'alternative' | 'mention'
    position      INTEGER,
    sentiment     TEXT,
    attributes    TEXT,               -- JSON array
    judge_model   TEXT NOT NULL,
    judge_version TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS citations (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES runs(id),
    url    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rollups (
    run_date       TEXT NOT NULL,
    engine         TEXT NOT NULL,     -- an engine name, or 'blended'
    category       TEXT NOT NULL,
    capability     TEXT NOT NULL,
    product        TEXT NOT NULL,
    routing_share  REAL,
    mention_rate   REAL,
    avg_position   REAL,
    n_samples      INTEGER,
    sentiment_positive INTEGER,
    sentiment_neutral  INTEGER,
    sentiment_negative INTEGER,
    spec_version   TEXT NOT NULL,
    PRIMARY KEY (run_date, engine, category, capability, product)
);
CREATE INDEX IF NOT EXISTS idx_runs_lookup ON runs (category, capability, engine, run_date);
CREATE INDEX IF NOT EXISTS idx_rollups_lookup ON rollups (category, capability, run_date);
"""


def connect(path: Path | None = None) -> sqlite3.Connection:
    conn = sqlite3.connect(path or DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA)
    conn.commit()


# --- writes ---

def insert_run(conn, *, ts, run_date, engine, model, grounding_mode, temperature,
               category, capability, prompt_set, variant, prompt, spec_version,
               raw_answer) -> int:
    cur = conn.execute(
        "INSERT INTO runs (ts, run_date, engine, model, grounding_mode, temperature,"
        " category, capability, prompt_set, variant, prompt, spec_version, raw_answer)"
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (ts, run_date, engine, model, grounding_mode, temperature, category,
         capability, prompt_set, variant, prompt, spec_version, raw_answer),
    )
    return cur.lastrowid


def insert_routing(conn, *, run_id, product, role, position, sentiment,
                   attributes, judge_model, judge_version) -> None:
    conn.execute(
        "INSERT INTO routings (run_id, product, role, position, sentiment,"
        " attributes, judge_model, judge_version) VALUES (?,?,?,?,?,?,?,?)",
        (run_id, product, role, position, sentiment, attributes, judge_model, judge_version),
    )


def insert_citation(conn, *, run_id, url) -> None:
    conn.execute("INSERT INTO citations (run_id, url) VALUES (?,?)", (run_id, url))


def upsert_rollup(conn, row: dict) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO rollups (run_date, engine, category, capability,"
        " product, routing_share, mention_rate, avg_position, n_samples,"
        " sentiment_positive, sentiment_neutral, sentiment_negative, spec_version)"
        " VALUES (:run_date, :engine, :category, :capability, :product,"
        " :routing_share, :mention_rate, :avg_position, :n_samples,"
        " :sentiment_positive, :sentiment_neutral, :sentiment_negative, :spec_version)",
        row,
    )


# --- reads ---

def fetch_runs(conn, run_date: str):
    return conn.execute("SELECT * FROM runs WHERE run_date = ?", (run_date,)).fetchall()


def fetch_routings(conn, run_id: int):
    return conn.execute("SELECT * FROM routings WHERE run_id = ?", (run_id,)).fetchall()


def distinct_run_dates(conn) -> list[str]:
    return [r[0] for r in conn.execute("SELECT DISTINCT run_date FROM runs ORDER BY run_date")]
