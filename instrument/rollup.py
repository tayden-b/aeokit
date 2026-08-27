"""
Build daily rollups from stored runs.

Reads a day's raw runs + routings out of SQLite, groups them by
(engine, category, capability), reuses the same routing-share logic from
metrics.py, and writes one rollup row per product. Also writes a 'blended'
engine row (all engines pooled) so the read API can show per-engine and
overall views.

Run automatically at the end of run.py; can also be invoked standalone to
rebuild a date:  python rollup.py [YYYY-MM-DD]
"""

from __future__ import annotations

import sys
from collections import defaultdict
from types import SimpleNamespace

import db
from metrics import normalize, routing_share


def _extractions_from_runs(conn, runs) -> list:
    """Rebuild lightweight Extraction-like objects (so metrics.py can consume them)."""
    out = []
    for run in runs:
        routings = db.fetch_routings(conn, run["id"])
        products = [
            SimpleNamespace(
                name=r["product"], role=r["role"],
                position=r["position"], sentiment=r["sentiment"],
            )
            for r in routings
        ]
        out.append(SimpleNamespace(products=products))
    return out


def _write_group(conn, run_date, engine, category, capability, extractions, spec_version) -> int:
    shares = routing_share(extractions)
    n = len(extractions)
    for product, m in shares.items():
        s = m["sentiment"]
        db.upsert_rollup(conn, {
            "run_date": run_date, "engine": engine, "category": category,
            "capability": capability, "product": product,
            "routing_share": m["routing_share"], "mention_rate": m["mention_rate"],
            "avg_position": m["avg_position"], "n_samples": n,
            "sentiment_positive": s["positive"], "sentiment_neutral": s["neutral"],
            "sentiment_negative": s["negative"], "spec_version": spec_version,
        })
    return len(shares)


def build_rollups(conn, run_date: str) -> int:
    # clear this date's rollups first so rebuilds are idempotent (no stale rows
    # when normalization/aliases change)
    conn.execute("DELETE FROM rollups WHERE run_date = ?", (run_date,))
    runs = db.fetch_runs(conn, run_date)
    by_engine = defaultdict(list)
    by_blended = defaultdict(list)
    for run in runs:
        by_engine[(run["engine"], run["category"], run["capability"])].append(run)
        by_blended[("blended", run["category"], run["capability"])].append(run)

    written = 0
    for (engine, category, capability), grp in {**by_engine, **by_blended}.items():
        exts = _extractions_from_runs(conn, grp)
        spec_version = grp[0]["spec_version"]
        written += _write_group(conn, run_date, engine, category, capability, exts, spec_version)
    conn.commit()
    return written


if __name__ == "__main__":
    conn = db.connect()
    db.init_db(conn)
    dates = [sys.argv[1]] if len(sys.argv) > 1 else db.distinct_run_dates(conn)
    for d in dates:
        print(f"{d}: {build_rollups(conn, d)} rollup rows")
    conn.close()
