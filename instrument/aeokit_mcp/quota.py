"""
Quota and spend control for the hosted server.

The operator's own API keys pay for every hosted probe, so this module is the
thing standing between a curious stranger and the operator's credit card. Two
independent guards, because they fail differently:

  1. GLOBAL DAILY CAP — the real protection. A hard dollar ceiling across all
     users per UTC day. When it's reached the server refuses everyone, including
     the operator. This bounds worst-case loss to a number chosen in advance.
  2. PER-CLIENT FREE PROBES — stops one casual user consuming the whole day.
     Client identity here is best-effort (forwarded IP); it is trivially evaded
     by anyone determined, which is fine, because guard #1 is what actually
     limits the damage.

Reservation happens BEFORE any engine call and is settled after, so a crash
mid-probe leaves the reservation in place rather than under-counting spend.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import os
import sqlite3
from pathlib import Path

DAILY_USD_CAP = float(os.getenv("AEOKIT_DAILY_USD_CAP", "5.00"))
FREE_PROBES_PER_CLIENT_PER_DAY = int(os.getenv("AEOKIT_FREE_PROBES_PER_CLIENT", "1"))
COST_SAFETY_MULTIPLIER = 1.35
CONTACT = os.getenv("AEOKIT_CONTACT", "hello@aeokit.ai")


def _path() -> Path:
    if os.getenv("AEOKIT_QUOTA_DB"):
        return Path(os.environ["AEOKIT_QUOTA_DB"])
    base = Path(os.getenv("AEOKIT_DATA_DIR", str(Path.home() / ".aeokit")))
    base.mkdir(parents=True, exist_ok=True)
    return base / "quota.db"


SCHEMA = """
CREATE TABLE IF NOT EXISTS reservations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ts          TEXT NOT NULL,
    day         TEXT NOT NULL,
    client      TEXT NOT NULL,
    reserved_usd REAL NOT NULL,
    actual_usd  REAL,
    settled     INTEGER NOT NULL DEFAULT 0,
    note        TEXT
);
CREATE INDEX IF NOT EXISTS idx_res_day ON reservations (day);
CREATE INDEX IF NOT EXISTS idx_res_client ON reservations (day, client);
"""


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_path(), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def _today() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")


def client_id(raw: str | None) -> str:
    """Hash whatever identity we have. Never store a raw IP."""
    return hashlib.sha256((raw or "anonymous").encode()).hexdigest()[:16]


def spent_today() -> float:
    conn = _conn()
    row = conn.execute(
        "SELECT COALESCE(SUM(CASE WHEN settled=1 THEN actual_usd ELSE reserved_usd END), 0)"
        " FROM reservations WHERE day = ?", (_today(),)).fetchone()
    conn.close()
    return round(row[0], 4)


def remaining_today() -> float:
    return round(max(0.0, DAILY_USD_CAP - spent_today()), 4)


def probes_used_by(client: str) -> int:
    conn = _conn()
    row = conn.execute(
        "SELECT COUNT(*) FROM reservations WHERE day = ? AND client = ?",
        (_today(), client)).fetchone()
    conn.close()
    return row[0]


def reserve(client: str, estimated_usd: float, note: str = "") -> tuple[bool, str | None, int | None]:
    """Try to reserve budget for a probe. Returns (allowed, refusal_message, reservation_id)."""
    used = probes_used_by(client)
    if used >= FREE_PROBES_PER_CLIENT_PER_DAY:
        return False, (
            f"You've used your {FREE_PROBES_PER_CLIENT_PER_DAY} free probe for today. "
            f"aeokit runs measurements on real engine APIs, which cost real money, so free "
            f"usage is limited while this is in early access. Want more? Email {CONTACT} — "
            f"happy to open it up."
        ), None

    planned = round(estimated_usd * COST_SAFETY_MULTIPLIER, 4)
    if planned > remaining_today():
        return False, (
            f"aeokit's shared daily measurement budget is used up for today "
            f"(resets at 00:00 UTC). This is a hard cap, not a queue. "
            f"Try tomorrow, or email {CONTACT} if you need it sooner."
        ), None

    conn = _conn()
    cur = conn.execute(
        "INSERT INTO reservations (ts, day, client, reserved_usd, note) VALUES (?,?,?,?,?)",
        (dt.datetime.now(dt.timezone.utc).isoformat(), _today(), client, planned, note))
    conn.commit()
    rid = cur.lastrowid
    conn.close()
    return True, None, rid


def settle(reservation_id: int, actual_usd: float) -> None:
    """Record what the probe actually cost. Must commit — an unsettled reservation
    stays charged at the inflated estimate, which is the safe direction to fail."""
    conn = _conn()
    conn.execute(
        "UPDATE reservations SET actual_usd = ?, settled = 1 WHERE id = ?",
        (round(actual_usd, 4), reservation_id))
    conn.commit()
    conn.close()


def status(client: str) -> dict:
    used = probes_used_by(client)
    return {
        "free_probes_remaining_today": max(0, FREE_PROBES_PER_CLIENT_PER_DAY - used),
        "free_probes_per_day": FREE_PROBES_PER_CLIENT_PER_DAY,
        "shared_budget_remaining_usd": remaining_today(),
        "shared_budget_daily_usd": DAILY_USD_CAP,
        "resets": "00:00 UTC",
        "contact": CONTACT,
    }
