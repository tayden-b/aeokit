"""
Cost estimation and spend caps.

Two independent guards, because they fail differently:
  - PER-PROBE cap: bounds any single request (a runaway loop or a huge n).
  - DAILY HOUSE cap: bounds total spend on the operator's own keys across all
    users and all probes in a day. This is the one that stops a hosted server
    from bankrupting its owner overnight.

User-key (BYOK) spend is metered and reported but never capped — it's their
money and their call.

Prices are published-rate ESTIMATES as of 2026-08; they are labeled as such
everywhere they surface. Verify against the provider dashboards before quoting
these to anyone.
"""

from __future__ import annotations

import datetime as dt
import os
import sqlite3
from pathlib import Path

def _ledger_path() -> Path:
    import os

    if os.getenv("AEOKIT_SPEND_DB"):
        return Path(os.environ["AEOKIT_SPEND_DB"])
    local = Path(__file__).parent / "spend.db"
    if local.exists() or (Path(__file__).parent / "aeokit.db").exists():
        return local
    home = Path.home() / ".aeokit"
    home.mkdir(parents=True, exist_ok=True)
    return home / "spend.db"


LEDGER_PATH = _ledger_path()

# USD per grounded answer call. These are ESTIMATES from published rates (Aug 2026)
# and have a history of being wrong — an earlier version priced OpenAI at $0.027 by
# assuming the legacy per-search fee, when the non-preview web_search tool actually
# bills search content as a flat ~8k input tokens (~20x cheaper). Verify against the
# provider dashboards before quoting any of this; the reserve path deliberately
# over-estimates, so being wrong here costs quota, not money.
COST_PER_CALL = {
    "openai": 0.0020,      # gpt-4o-mini + web_search: ~8k input tokens + output
    "gemini": 0.0350,      # $35/1k grounded prompts BEYOND the free 1,500/day
    "anthropic": 0.0130,   # $10/1k searches + tokens
    "perplexity": 0.0060,  # sonar: tokens + built-in search
}
# Gemini grounding is free for the first 1,500 prompts/day on 2.5 models, so in
# practice a small deployment pays ~nothing for it. We still reserve at the paid
# rate — over-reserving is the safe direction.
COST_PER_JUDGE_CALL = 0.0003   # ~0 when the judge runs on a free tier (Groq/Gemini)
DEFAULT_COST = 0.01

# Gemini grounding is free for the first N prompts per day. Reserving those at the
# paid rate would burn the daily cap on spend that never happens, so we count the
# day's Gemini calls and price only the overflow.
GEMINI_FREE_GROUNDED_PER_DAY = int(os.getenv("AEOKIT_GEMINI_FREE_QUOTA", "1500"))

PER_PROBE_CALL_CAP = 60          # max engine calls in one probe request
DAILY_HOUSE_USD_CAP = 5.00       # max spend on the operator's own keys per day

SCHEMA = """
CREATE TABLE IF NOT EXISTS spend (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    ts       TEXT NOT NULL,
    day      TEXT NOT NULL,
    source   TEXT NOT NULL,   -- 'house' | 'user'
    engine   TEXT NOT NULL,
    calls    INTEGER NOT NULL,
    est_usd  REAL NOT NULL,
    label    TEXT
);
CREATE INDEX IF NOT EXISTS idx_spend_day ON spend (day, source);
"""


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(LEDGER_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def calls_today(engine: str) -> int:
    day = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")
    conn = _conn()
    row = conn.execute(
        "SELECT COALESCE(SUM(calls), 0) FROM spend WHERE day = ? AND engine = ?", (day, engine)
    ).fetchone()
    conn.close()
    return int(row[0])


def estimate(engine: str, calls: int, judge_calls: int = 0) -> float:
    """Estimated USD for `calls` on an engine, accounting for free daily quota."""
    billable = calls
    if engine == "gemini":
        used = calls_today("gemini")
        free_left = max(0, GEMINI_FREE_GROUNDED_PER_DAY - used)
        billable = max(0, calls - free_left)
    return round(
        billable * COST_PER_CALL.get(engine, DEFAULT_COST) + judge_calls * COST_PER_JUDGE_CALL, 4
    )


def record(source: str, engine: str, calls: int, est_usd: float, label: str = "") -> None:
    now = dt.datetime.now(dt.timezone.utc)
    conn = _conn()
    conn.execute(
        "INSERT INTO spend (ts, day, source, engine, calls, est_usd, label) VALUES (?,?,?,?,?,?,?)",
        (now.isoformat(), now.strftime("%Y-%m-%d"), source, engine, calls, est_usd, label),
    )
    conn.commit()
    conn.close()


def house_spent_today() -> float:
    day = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")
    conn = _conn()
    row = conn.execute(
        "SELECT COALESCE(SUM(est_usd), 0) FROM spend WHERE day = ? AND source = 'house'", (day,)
    ).fetchone()
    conn.close()
    return round(row[0], 4)


def house_remaining() -> float:
    return round(max(0.0, DAILY_HOUSE_USD_CAP - house_spent_today()), 4)


def check_house_budget(planned_usd: float) -> tuple[bool, str | None]:
    """Can a house-key probe of this estimated size proceed?"""
    remaining = house_remaining()
    if planned_usd <= remaining:
        return True, None
    return False, (
        f"Free trial budget for today is used up (${house_spent_today():.2f} of "
        f"${DAILY_HOUSE_USD_CAP:.2f} spent; this probe needs about ${planned_usd:.2f}). "
        "Add your own API keys to run probes on your own credits — the corpus tools "
        "stay free and unlimited either way."
    )


def summary() -> dict:
    return {
        "house_spent_today_usd": house_spent_today(),
        "house_daily_cap_usd": DAILY_HOUSE_USD_CAP,
        "house_remaining_usd": house_remaining(),
        "per_probe_call_cap": PER_PROBE_CALL_CAP,
        "note": "costs are estimates from published provider rates (2026-08), not billed amounts",
    }
