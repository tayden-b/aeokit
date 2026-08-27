"""
Export the corpus → JSON snapshots any frontend or API can serve.

The clean seam between the instrument (owns data) and every consumer (site
pages, MCP tools, raw downloads). The export is neutral: no product is special —
the instrument measures a board, it doesn't root for anyone on it.

    python export.py   ->   exports/data.json
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import db
from metrics import normalize

OUT = Path(__file__).parent / "exports" / "data.json"


def _attributes_for_latest(conn, latest: str) -> dict[tuple, list[str]]:
    """(capability, normalized product) -> top descriptive attributes on the latest date."""
    rows = conn.execute(
        "SELECT r.capability AS capability, rt.product AS product, rt.attributes AS attrs "
        "FROM routings rt JOIN runs r ON rt.run_id = r.id WHERE r.run_date = ?",
        (latest,),
    ).fetchall()
    counts: dict[tuple, Counter] = defaultdict(Counter)
    for row in rows:
        prod = normalize(row["product"])
        try:
            attrs = json.loads(row["attrs"] or "[]")
        except (json.JSONDecodeError, TypeError):
            attrs = []
        for a in attrs:
            a = (a or "").strip().lower()
            if a:
                counts[(row["capability"], prod)][a] += 1
    return {k: [a for a, _ in c.most_common(6)] for k, c in counts.items()}


def export() -> Path:
    conn = db.connect()
    db.init_db(conn)
    dates = db.distinct_run_dates(conn)
    if not dates:
        raise SystemExit("Corpus is empty — run collect.py first.")
    latest = dates[-1]
    attrs_map = _attributes_for_latest(conn, latest)
    rollups = conn.execute("SELECT * FROM rollups ORDER BY run_date").fetchall()

    caps: dict[tuple, dict] = {}
    for r in rollups:
        key = (r["category"], r["capability"])
        caps.setdefault(key, {"engines": defaultdict(list), "trend": defaultdict(list)})
        if r["run_date"] == latest:
            caps[key]["engines"][r["engine"]].append({
                "product": r["product"],
                "routing_share": r["routing_share"],
                "mention_rate": r["mention_rate"],
                "avg_position": r["avg_position"],
                "n": r["n_samples"],
                "sentiment": {
                    "positive": r["sentiment_positive"],
                    "neutral": r["sentiment_neutral"],
                    "negative": r["sentiment_negative"],
                },
                "attributes": attrs_map.get((r["capability"], r["product"]), []),
                "spec_version": r["spec_version"],
            })
        if r["engine"] == "blended":
            caps[key]["trend"][r["product"]].append({
                "date": r["run_date"], "routing_share": r["routing_share"],
            })

    capabilities = []
    for (category, capability), data in sorted(caps.items()):
        engines = {
            eng: sorted(rows, key=lambda x: -(x["routing_share"] or 0))
            for eng, rows in data["engines"].items()
        }
        blended = engines.get("blended", [])
        for series in data["trend"].values():
            series.sort(key=lambda x: x["date"])
        capabilities.append({
            "category": category,
            "capability": capability,
            "leader": blended[0]["product"] if blended else None,
            "engines": engines,
            "trend": dict(data["trend"]),
        })

    engines_present = sorted({r["engine"] for r in rollups if r["engine"] != "blended"})
    grounding = dict(conn.execute(
        "SELECT grounding_mode, COUNT(*) FROM runs WHERE run_date = ? GROUP BY grounding_mode",
        (latest,),
    ).fetchall())

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "latest_date": latest,
        "dates": dates,
        "engines": engines_present,
        "grounding_modes": grounding,
        "n_capabilities": len(capabilities),
        "capabilities": capabilities,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2))
    conn.close()
    return OUT


if __name__ == "__main__":
    print(f"wrote {export()}")
