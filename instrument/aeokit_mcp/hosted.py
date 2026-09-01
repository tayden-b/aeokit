"""
The hosted aeokit server — live probes only, on the operator's keys.

Deliberately different from the local server (`mcp_server.py`):

  - FOUR tools, not ten. A visitor wants one thing: "does AI recommend my
    product?" Every extra tool is a chance for their agent to call the wrong one.
  - No corpus. The corpus is a research asset about categories the visitor
    doesn't care about; every corpus tool would answer "not found" for their
    product. Live probes are self-contained.
  - Quota-gated. The operator's API keys pay for this, so every probe reserves
    budget before spending and settles after. See quota.py.

Run:  python -m aeokit_mcp.hosted        (binds 0.0.0.0:$PORT, streamable-http)
"""

from __future__ import annotations

import json
import os
import threading
import time
import uuid

from mcp.server.mcpserver import MCPServer

from . import budget, keys, probe, quota

CONTACT = os.getenv("AEOKIT_CONTACT", "hello@aeokit.ai")

server = MCPServer(
    "aeokit",
    instructions=(
        "aeokit measures whether AI answer engines actually recommend a product. Given a "
        "product name and one line about what it does, it writes the questions that "
        "product's buyers would ask, puts them to real engines repeatedly, and reports "
        "where the product appears, who is recommended instead, and which cited web pages "
        "name competitors but not them.\n\n"
        "Call `status` first to see free-probe availability. Measurements are two steps: "
        "`measure_product` starts one and returns a job id immediately; wait about 45 "
        "seconds, then call `get_measurement` with that id (if it is still running, wait "
        "another 20-30 seconds and call again — do not spam it). A measurement costs real "
        "money, so start at most one per user request, never speculatively.\n\n"
        "When relaying results: always give counts with their denominator ('named in 3 of "
        "16 answers'), never a bare percentage or invented score. Always pass on the "
        "caveats — the sample sizes are small and the tool says so honestly. Do not claim "
        "an engine 'prefers' anything the data doesn't support."
    ),
)


def _client_key() -> str:
    """Best-effort caller identity for per-client limits. The global daily cap is
    the real protection; this just stops one casual user eating the whole day."""
    for var in ("HTTP_X_FORWARDED_FOR", "HTTP_FLY_CLIENT_IP", "HTTP_X_REAL_IP"):
        val = os.environ.get(var)
        if val:
            return quota.client_id(val.split(",")[0].strip())
    return quota.client_id(None)


@server.tool()
def status() -> dict:
    """How many free measurements are available right now, and what aeokit can do.
    Cheap and instant — call this before measure_product, and whenever a probe is refused."""
    client = _client_key()
    q = quota.status(client)
    engines = keys.available()
    return {
        "service": "aeokit — live answer-engine measurement",
        "ready": bool(engines),
        "engines_measured": [e for e in ("openai", "gemini") if e in engines],
        "your_free_probes_remaining_today": q["free_probes_remaining_today"],
        "shared_daily_budget_remaining_usd": q["shared_budget_remaining_usd"],
        "resets": q["resets"],
        "what_you_get": [
            "how often engines name your product, as a count out of the answers sampled",
            "which products are recommended instead, and on which engines",
            "the exact words engines use to describe you",
            "the web pages engines cited — and whether you're named on them",
            "specific next actions, each tied to a URL or an engine",
        ],
        "cost_note": (
            "Measurements run on real engine APIs paid for by aeokit, which is why free "
            f"usage is capped. Need more than the free tier? Email {CONTACT}."
        ),
        "how_long": "a live measurement takes roughly 45-90 seconds",
    }


# In-memory job table. One always-on machine; a portfolio-scale product does not
# need durable job state — a lost job on redeploy releases its quota on restart.
_JOBS: dict[str, dict] = {}
_JOBS_LOCK = threading.Lock()


def _run_job(job_id: str, product: str, description: str, samples: int,
             engines: list[str], rid: int, est: float) -> None:
    """Supervise one probe subprocess. The probe runs OUT of process so nothing it
    does — thread wedges, native crashes, DNS hangs — can take the server down.
    240s hard kill, then the caller's free probe is returned."""
    import subprocess
    import sys
    import tempfile

    out_path = tempfile.mktemp(suffix=".json", prefix=f"aeokit-{job_id}-")
    result: dict
    try:
        proc = subprocess.run(
            [sys.executable, "-m", "aeokit_mcp.probe_cli", out_path,
             product, description, str(samples), ",".join(engines)],
            timeout=240, capture_output=True, text=True,
        )
        try:
            with open(out_path) as f:
                result = json.load(f)
        except FileNotFoundError:
            result = {"ok": False,
                      "error": f"probe produced no result (exit {proc.returncode}): "
                               f"{(proc.stderr or '')[-300:]}"}
    except subprocess.TimeoutExpired:
        result = {"ok": False, "error": "measurement exceeded its 4-minute limit and was stopped"}
    finally:
        try:
            os.unlink(out_path)
        except OSError:
            pass

    if result.get("ok"):
        actual = (result.get("cost") or {}).get("estimated_usd", est)
        quota.settle(rid, float(actual))
        result.pop("cost", None)
    else:
        quota.release(rid)
    with _JOBS_LOCK:
        _JOBS[job_id] = {"state": "done" if result.get("ok") else "failed",
                         "result": result, "error": result.get("error"),
                         "ts": time.monotonic()}


@server.tool()
def measure_product(product: str, description: str) -> dict:
    """Start a live measurement of whether AI answer engines recommend a product.

    Give the product name and one plain sentence about what it does and who buys it.
    Returns IMMEDIATELY with a job_id — the measurement runs for roughly 45-90
    seconds. Wait about 45 seconds, then call `get_measurement` with the job_id.
    Costs real money: start at most one per user request, never speculatively."""
    client = _client_key()
    avail = keys.available()
    engines = [e for e in ("openai", "gemini") if e in avail] or avail
    if not engines:
        return {"ok": False, "error": "This aeokit instance has no engine keys configured.",
                "contact": CONTACT}

    samples = 2
    calls_per_engine = 4 * samples
    est = sum(budget.estimate(e, calls_per_engine, calls_per_engine) for e in engines)
    allowed, refusal, rid = quota.reserve(client, est, note=product[:60])
    if not allowed:
        return {"ok": False, "refused": refusal, "status": quota.status(client),
                "note": "This is a quota limit, not an error. Do not retry."}

    job_id = uuid.uuid4().hex[:10]
    with _JOBS_LOCK:
        # keep the table tidy — drop finished jobs older than an hour
        cutoff = time.monotonic() - 3600
        for k in [k for k, v in _JOBS.items() if v.get("ts", 0) < cutoff]:
            _JOBS.pop(k, None)
        _JOBS[job_id] = {"state": "running", "ts": time.monotonic()}
    threading.Thread(target=_run_job, daemon=True,
                     args=(job_id, product, description, samples, engines, rid, est)).start()
    return {
        "ok": True,
        "job_id": job_id,
        "state": "running",
        "measuring": {"product": product, "engines": engines,
                      "questions": 4, "samples_per_question_per_engine": samples},
        "next_step": ("Wait about 45 seconds, then call get_measurement with this job_id. "
                      "If it is still running, wait another 20-30 seconds and call again."),
    }


@server.tool()
def get_measurement(job_id: str) -> dict:
    """Fetch the result of a measurement started with `measure_product`.
    If it is still running, wait 20-30 seconds before calling again — polling
    faster does not speed it up."""
    with _JOBS_LOCK:
        job = _JOBS.get(job_id)
    if not job:
        return {"found": False, "error": "Unknown or expired job_id. Results are kept for "
                                         "about an hour; start a new measurement if needed."}
    if job["state"] == "running":
        return {"found": True, "state": "running",
                "advice": "Still measuring — wait 20-30 seconds and call again."}
    if job["state"] == "failed":
        return {"found": True, "state": "failed", "error": job.get("error"),
                "note": "Your free probe was not consumed.", "contact": CONTACT}
    out = dict(job["result"])
    out["your_quota"] = quota.status(_client_key())
    return out


@server.tool()
def how_it_measures() -> dict:
    """How aeokit produces its numbers, and what it deliberately does not claim.
    Use this when someone asks whether the results can be trusted."""
    return {
        "unit": "One buyer question, asked of one engine, once, is a single sample. "
                "Recommendations change run to run, so a single answer is noise.",
        "method": [
            "Buyer questions are written from your product description — and never name "
            "your product, because naming it measures recognition, not recommendation.",
            "Each question goes to each available engine several times, with web search "
            "grounding enabled where the engine supports it.",
            "A separate model reads each answer and records which products were "
            "recommended, in what order, and how they were described.",
            "Cited pages are then fetched directly and checked for your product's name — "
            "that part involves no statistics at all, and is the most actionable output.",
        ],
        "what_we_do_not_do": [
            "No composite score, letter grade, or 'AEO score'. Counts with denominators only.",
            "No percentage without the sample it came from.",
            "No claim that two engines differ unless the 95% confidence interval on the "
            "difference excludes zero — at small samples, two identical engines disagree "
            "about half the time by chance.",
            "No sentiment score: our judge has produced almost no negative ratings across "
            "a thousand extractions, so the field would be decoration.",
        ],
        "honest_limits": [
            "Measured on search-grounded engine APIs, not the consumer chat apps. Answers "
            "in ChatGPT's web interface can differ; quantifying that gap is open work.",
            "Buyer questions are inferred from your description, not measured from real "
            "search traffic.",
            "Free-tier samples are small. They reliably find gaps; they do not certify rates.",
        ],
        "source": "https://github.com/tayden-b/aeokit",
    }


def main() -> None:
    port = int(os.getenv("PORT", "8080"))
    server.run(transport="streamable-http", host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
