"""
The hosted aeokit server — live probes only, on the operator's keys.

Deliberately different from the local server (`mcp_server.py`):

  - THREE tools, not ten. A visitor wants one thing: "does AI recommend my
    product?" Every extra tool is a chance for their agent to call the wrong one.
  - No corpus. The corpus is a research asset about categories the visitor
    doesn't care about; every corpus tool would answer "not found" for their
    product. Live probes are self-contained.
  - Quota-gated. The operator's API keys pay for this, so every probe reserves
    budget before spending and settles after. See quota.py.

Run:  python -m aeokit_mcp.hosted        (binds 0.0.0.0:$PORT, streamable-http)
"""

from __future__ import annotations

import os

from mcp.server.mcpserver import MCPServer

from . import keys, probe, quota

CONTACT = os.getenv("AEOKIT_CONTACT", "hello@aeokit.ai")

server = MCPServer(
    "aeokit",
    instructions=(
        "aeokit measures whether AI answer engines actually recommend a product. Given a "
        "product name and one line about what it does, it writes the questions that "
        "product's buyers would ask, puts them to real engines repeatedly, and reports "
        "where the product appears, who is recommended instead, and which cited web pages "
        "name competitors but not them.\n\n"
        "Call `status` first to see free-probe availability. Call `measure_product` to run "
        "one — it takes 1-3 minutes and costs real money, so never call it more than once "
        "per request, and never call it speculatively.\n\n"
        "When relaying results: always give counts with their denominator ('named in 3 of "
        "20 answers'), never a bare percentage or invented score. Always pass on the "
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
        "engines_measured": engines,
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
        "how_long": "a live measurement takes roughly 1-3 minutes",
    }


@server.tool()
def measure_product(product: str, description: str, samples_per_question: int = 3) -> dict:
    """Measure whether AI answer engines recommend a product, live, right now.

    Give the product name and one plain sentence about what it does and who buys it
    (e.g. "Acme", "invoicing software for freelancers"). aeokit writes the buyer
    questions itself — do NOT supply questions, and do not include the product name
    in the description's positioning claims.

    SLOW AND COSTLY: takes 1-3 minutes and spends real API budget. Call it once per
    user request. If it returns a refusal, relay the reason rather than retrying."""
    client = _client_key()
    if not keys.available():
        return {"ok": False, "error": "This aeokit instance has no engine keys configured.",
                "contact": CONTACT}

    samples_per_question = max(1, min(3, samples_per_question))
    engines = keys.available()
    est = 0.03 * 6 * len(engines) * samples_per_question  # questions x engines x samples

    allowed, refusal, rid = quota.reserve(client, est, note=product[:60])
    if not allowed:
        return {
            "ok": False,
            "refused": refusal,
            "status": quota.status(client),
            "note": "This is a quota limit, not an error. Do not retry.",
        }

    try:
        result = probe.run_probe(
            product=product,
            description=description,
            samples_per_question=samples_per_question,
            engine_list=engines,
            max_questions=6,
            check_sources=True,
        )
    except Exception as e:
        quota.settle(rid, 0.0)
        return {"ok": False, "error": f"The measurement failed: {type(e).__name__}. "
                                      "Your free probe has not been consumed.",
                "contact": CONTACT}

    actual = (result.get("cost") or {}).get("estimated_usd", est)
    quota.settle(rid, float(actual))

    if result.get("ok"):
        result.pop("cost", None)   # the visitor isn't paying; don't show them an invoice
        result["your_quota"] = quota.status(client)
    return result


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
