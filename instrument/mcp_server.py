"""
marketmaker MCP server — measured AEO data for AI agents.

Design rules:
- Tools answer the questions a product owner's agent actually asks: where do I
  rank, what's being said about me, who wins this capability, what's measured.
- Every response carries a `method` block (spec version, prompt set, dates,
  engines, grounding, n) and honest `caveats` — the tool NEVER overclaims thin
  data. A small corpus with honest error bars beats a big claim.
- Reads are free and local (SQLite). No tool here mutates the corpus; probe
  requests only append to a demand queue file.

Run locally (stdio):        python mcp_server.py
Run hosted (later):         python mcp_server.py --http
Connect from Claude Code:   claude mcp add marketmaker -- <venv-python> mcp_server.py
"""

from __future__ import annotations

import datetime as dt
import difflib
import json
import sys
from collections import defaultdict
from pathlib import Path

from mcp.server.mcpserver import MCPServer

import db
from metrics import normalize
from stats import confidence_note, wilson_interval

QUEUE_PATH = Path(__file__).parent / "exports" / "probe_queue.jsonl"

server = MCPServer(
    "marketmaker",
    instructions=(
        "marketmaker is a measurement instrument for AI answer engines: it repeatedly "
        "samples ChatGPT, Gemini, and other engines with buyer-intent questions and "
        "records which products they recommend. Use `coverage` to see what's measured, "
        "`product_report` for where a product ranks and what's said about it, "
        "`capability_ranking` for who wins a capability, and `request_measurement` "
        "when something isn't in the corpus yet. Numbers are measured distributions, "
        "not opinions — always relay the caveats and sample sizes to the user."
    ),
)


# --- shared helpers ---

def _conn():
    conn = db.connect()
    db.init_db(conn)
    return conn


def _method_block(conn) -> dict:
    dates = db.distinct_run_dates(conn)
    if not dates:
        return {"corpus": "empty"}
    row = conn.execute("SELECT spec_version, prompt_set FROM runs ORDER BY id DESC LIMIT 1").fetchone()
    engines = [r[0] for r in conn.execute("SELECT DISTINCT engine FROM runs")]
    grounding = dict(conn.execute("SELECT grounding_mode, COUNT(*) FROM runs GROUP BY grounding_mode").fetchall())
    return {
        "spec_version": row["spec_version"],
        "prompt_set": row["prompt_set"],
        "dates": {"first": dates[0], "latest": dates[-1], "collection_days": len(dates)},
        "engines": engines,
        "grounding_modes": grounding,
        "note": "measured by repeated sampling of live engine APIs (search-grounded where supported); "
                "not the consumer chat UIs — see the spec's scope of claims",
    }


def _known_products(conn) -> list[str]:
    return [r[0] for r in conn.execute("SELECT DISTINCT product FROM routings")]


def _match(name: str, candidates: list[str]) -> tuple[str | None, list[str]]:
    """Exact/normalized match, else fuzzy suggestions."""
    norm = normalize(name)
    by_lower = {c.lower(): c for c in candidates}
    if norm.lower() in by_lower:
        return by_lower[norm.lower()], []
    hit = next((c for c in candidates if norm.lower() in c.lower() or c.lower() in norm.lower()), None)
    if hit:
        return hit, []
    return None, difflib.get_close_matches(norm, candidates, n=5, cutoff=0.5)


def _latest_shares(conn, capability: str | None = None):
    """Latest-date rollup rows, grouped per (capability, engine), products ordered by share."""
    dates = db.distinct_run_dates(conn)
    if not dates:
        return {}
    q = "SELECT * FROM rollups WHERE run_date = ?"
    args: list = [dates[-1]]
    if capability:
        q += " AND capability = ?"
        args.append(capability)
    grouped: dict[tuple, list] = defaultdict(list)
    for r in conn.execute(q, args):
        grouped[(r["category"], r["capability"], r["engine"])].append(dict(r))
    for rows in grouped.values():
        rows.sort(key=lambda x: -(x["routing_share"] or 0))
    return grouped


def _row_view(r: dict) -> dict:
    n = r["n_samples"] or 0
    hits = round((r["routing_share"] or 0) * n)
    low, high = wilson_interval(hits, n)
    return {
        "product": r["product"],
        "routing_share": r["routing_share"],
        "share_95ci": [round(low, 3), round(high, 3)],
        "mention_rate": r["mention_rate"],
        "avg_position": r["avg_position"],
        "n": n,
        "sentiment": {
            "positive": r["sentiment_positive"],
            "neutral": r["sentiment_neutral"],
            "negative": r["sentiment_negative"],
        },
    }


# --- tools ---

@server.tool()
def coverage() -> dict:
    """What the corpus currently measures: categories, capabilities, engines,
    collection dates, and total samples. Call this first to learn what you can ask —
    and to avoid asking about things that aren't measured yet."""
    conn = _conn()
    caps = conn.execute(
        "SELECT category, capability, COUNT(*) AS n FROM runs GROUP BY 1, 2 ORDER BY 1, 2"
    ).fetchall()
    out = {
        "categories": defaultdict(list),
        "total_samples": conn.execute("SELECT COUNT(*) FROM runs").fetchone()[0],
        "products_seen": len(_known_products(conn)),
        "method": _method_block(conn),
    }
    for r in caps:
        out["categories"][r["category"]].append({"capability": r["capability"], "samples": r["n"]})
    out["categories"] = dict(out["categories"])
    conn.close()
    return out


@server.tool()
def product_report(product: str, category: str | None = None) -> dict:
    """Where a product stands in AI answers: its rank and share of recommendations
    for every measured capability, per engine, with confidence intervals, sentiment,
    and who leads instead. THE tool for 'how does my product rank in AI search?'"""
    conn = _conn()
    match, suggestions = _match(product, _known_products(conn))
    if not match:
        conn.close()
        return {
            "found": False,
            "asked_for": product,
            "close_matches": suggestions,
            "advice": "The corpus hasn't seen this product in any sampled answer. Either it "
                      "genuinely doesn't appear for the measured capabilities (itself a finding), "
                      "or its category isn't measured yet — check `coverage`, and use "
                      "`request_measurement` to queue it.",
        }
    standings, caveats = [], set()
    for (cat, capability, engine), rows in sorted(_latest_shares(conn).items()):
        if category and cat != category:
            continue
        if engine == "blended":
            continue
        rank = next((i + 1 for i, r in enumerate(rows) if r["product"] == match), None)
        entry = {
            "category": cat, "capability": capability, "engine": engine,
            "rank": rank, "of": len(rows),
            "leader": rows[0]["product"] if rows else None,
        }
        if rank:
            entry.update(_row_view(rows[rank - 1]))
            note = confidence_note(entry["n"])
            if note:
                caveats.add(note)
        else:
            entry["note"] = "not mentioned in any sampled answer for this capability on this engine"
        standings.append(entry)
    method = _method_block(conn)
    conn.close()
    mentioned = [s for s in standings if s.get("rank")]
    return {
        "found": True,
        "product": match,
        "summary": {
            "capabilities_measured": len({(s["category"], s["capability"]) for s in standings}),
            "appears_in": len(mentioned),
            "leads": sum(1 for s in mentioned if s["rank"] == 1),
            "invisible_on": [
                f"{s['capability']} ({s['engine']})" for s in standings if not s.get("rank")
            ][:10],
        },
        "standings": standings,
        "caveats": sorted(caveats) or None,
        "method": method,
    }


@server.tool()
def capability_ranking(capability: str, engine: str | None = None) -> dict:
    """Who wins a capability: the measured distribution of product recommendations
    per engine, with confidence intervals — and whether the engines disagree about
    the winner. For 'who do AI engines recommend for X?'"""
    conn = _conn()
    known = [r[0] for r in conn.execute("SELECT DISTINCT capability FROM runs")]
    match, suggestions = _match(capability, known)
    if not match:
        conn.close()
        return {"found": False, "asked_for": capability, "close_matches": suggestions,
                "advice": "Not measured yet — see `coverage` for what is, or `request_measurement`."}
    result, leaders, caveats = {}, {}, set()
    for (cat, cap, eng), rows in _latest_shares(conn, match).items():
        if engine and eng != engine:
            continue
        views = [_row_view(r) for r in rows[:8]]
        for v in views:
            note = confidence_note(v["n"])
            if note:
                caveats.add(note)
        result[eng] = views
        if eng != "blended" and rows:
            leaders[eng] = rows[0]["product"]
    method = _method_block(conn)
    conn.close()
    distinct = set(leaders.values())
    return {
        "found": True,
        "capability": match,
        "engines": result,
        "engines_disagree": len(distinct) > 1,
        "leaders_by_engine": leaders,
        "disagreement_note": (
            f"{len(distinct)} different winners across {len(leaders)} engines — your buyers "
            "hear a different answer depending on where they ask" if len(distinct) > 1 else None
        ),
        "caveats": sorted(caveats) or None,
        "method": method,
    }


@server.tool()
def whats_said(product: str) -> dict:
    """What engines actually say about a product when they mention it: the
    descriptive attributes used, sentiment counts, and which capabilities trigger
    the mentions — per engine. For 'what's being said about us in AI answers?'"""
    conn = _conn()
    match, suggestions = _match(product, _known_products(conn))
    if not match:
        conn.close()
        return {"found": False, "asked_for": product, "close_matches": suggestions}
    rows = conn.execute(
        "SELECT r.engine, r.capability, rt.sentiment, rt.attributes, rt.role "
        "FROM routings rt JOIN runs r ON rt.run_id = r.id WHERE rt.product = ?",
        (match,),
    ).fetchall()
    by_engine: dict[str, dict] = defaultdict(lambda: {
        "mentions": 0, "as_primary": 0,
        "sentiment": {"positive": 0, "neutral": 0, "negative": 0},
        "attributes": defaultdict(int), "capabilities": set(),
    })
    for r in rows:
        e = by_engine[r["engine"]]
        e["mentions"] += 1
        e["as_primary"] += 1 if r["role"] == "primary" else 0
        if r["sentiment"] in e["sentiment"]:
            e["sentiment"][r["sentiment"]] += 1
        e["capabilities"].add(r["capability"])
        try:
            for a in json.loads(r["attributes"] or "[]"):
                e["attributes"][a.strip().lower()] += 1
        except (json.JSONDecodeError, AttributeError):
            pass
    out = {}
    for eng, e in by_engine.items():
        out[eng] = {
            "mentions": e["mentions"],
            "as_primary": e["as_primary"],
            "sentiment": e["sentiment"],
            "top_attributes": sorted(e["attributes"], key=e["attributes"].get, reverse=True)[:8],
            "mentioned_for": sorted(e["capabilities"]),
        }
    method = _method_block(conn)
    conn.close()
    return {"found": True, "product": match, "voice_by_engine": out,
            "method": method}


@server.tool()
def request_measurement(target: str, context: str = "") -> dict:
    """Queue a product or category for measurement when it isn't in the corpus yet.
    Appends to the demand queue (reviewed by a human); measurement is not immediate.
    Be specific: the product/category name plus what the requester wants to learn."""
    QUEUE_PATH.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "ts": dt.datetime.now(dt.timezone.utc).isoformat(),
        "target": target.strip(),
        "context": context.strip(),
    }
    with QUEUE_PATH.open("a") as f:
        f.write(json.dumps(entry) + "\n")
    return {
        "queued": True,
        "target": entry["target"],
        "honest_note": "This logs demand; it does not trigger an immediate run. Measurement of a "
                       "new category takes a prompt-set addition under the spec's derivation rules.",
    }


if __name__ == "__main__":
    if "--http" in sys.argv:
        server.run(transport="streamable-http")
    else:
        server.run()
