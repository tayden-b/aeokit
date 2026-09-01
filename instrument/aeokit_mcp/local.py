"""
The local BYOK server — what `uvx aeokit-mcp` runs.

This is the bring-your-own-key experience: the same measurement pipeline as the
hosted service, on the user's machine, with the user's engine keys, and no
quota — there is nothing of ours to meter.

Differences from the hosted server (`hosted.py`), on purpose:
  - `measure_product` is SYNCHRONOUS. Local stdio has no proxy between the agent
    and the server, so there is nothing to time out; a single call that takes a
    minute is simpler and more reliable than a job table.
  - No quota, no spend ledger. The user's keys, the user's bill — typically a
    few cents per measurement, and the result includes the estimate.
  - `check_keys` replaces `status`: the question a local user actually has is
    "did my keys get picked up?", not "how much free tier is left?".
"""

from __future__ import annotations

import os

from mcp.server.mcpserver import MCPServer

from . import keys, probe

server = MCPServer(
    "aeokit",
    instructions=(
        "aeokit measures whether AI answer engines actually recommend a product. Given a "
        "product name and one line about what it does, it writes the questions that "
        "product's buyers would ask, puts them to the engines repeatedly on the user's "
        "own API keys, and reports where the product appears, who is recommended instead, "
        "and which cited web pages name competitors but not them.\n\n"
        "Call `check_keys` once after setup to confirm keys were picked up. "
        "`measure_product` runs the full measurement in one call — it takes one to two "
        "minutes and spends a few cents of the user's API credits, so run at most one per "
        "user request, never speculatively.\n\n"
        "When relaying results: always give counts with their denominator ('named in 3 of "
        "16 answers'), never a bare percentage or invented score, and always pass on the "
        "caveats — sample sizes are small and the tool says so honestly."
    ),
)


@server.tool()
def check_keys() -> dict:
    """Verify aeokit picked up your API keys. Instant and free — call once after
    installing, or whenever a measurement fails."""
    src = keys.describe_source()
    have = [e for e, s in src["by_engine"].items() if s != "none"]
    measured = [e for e in ("openai", "gemini") if e in have]
    can_derive = bool(keys.resolve("openai") or keys.resolve("gemini"))
    if not have:
        advice = ("No keys found. Add at least one to this MCP server's env in your client "
                  "config (AEOKIT_USER_OPENAI_API_KEY or AEOKIT_USER_GEMINI_API_KEY), then "
                  "restart the client. Never paste a key into the chat itself.")
    elif not can_derive:
        advice = ("You have keys, but none that can write buyer questions — add an OpenAI "
                  "or Gemini key.")
    elif len(measured) == 1:
        advice = (f"Ready, measuring {measured[0]} only. Adding the other key lets aeokit "
                  "compare engines — disagreement between them is usually the most useful finding.")
    else:
        advice = "Ready. Both engines will be measured and compared."
    return {"ready": bool(measured) and can_derive, "engines_measured": measured,
            "advice": advice}


@server.tool()
def measure_product(product: str, description: str, samples_per_question: int = 2) -> dict:
    """Measure whether AI answer engines recommend a product, live, on your own keys.

    Give the product name and one plain sentence about what it does and who buys it.
    Runs the full measurement in this one call — expect one to two minutes and a few
    cents of API spend. Run at most one per user request."""
    avail = keys.available()
    engines = [e for e in ("openai", "gemini") if e in avail]
    if not engines:
        return {"ok": False,
                "error": "No engine keys found — run check_keys for setup instructions."}
    samples_per_question = max(1, min(4, samples_per_question))
    return probe.run_probe(
        product=product, description=description,
        samples_per_question=samples_per_question,
        engine_list=engines, max_questions=4, check_sources=True,
    )


@server.tool()
def how_it_measures() -> dict:
    """How aeokit produces its numbers, and what it deliberately does not claim."""
    return {
        "unit": "One buyer question, asked of one engine, once, is a single sample. "
                "Recommendations change run to run, so a single answer is noise.",
        "method": [
            "Buyer questions are derived from your product description and never name "
            "your product — naming it would measure recognition, not recommendation.",
            "Each question goes to each engine repeatedly, with web search grounding.",
            "A judge model extracts which products each answer recommended.",
            "The most-cited pages are fetched and checked for your product's name.",
        ],
        "what_we_do_not_do": [
            "No composite score, letter grade, or index — counts with denominators only.",
            "No cross-engine claim unless the 95% interval on the difference excludes zero.",
            "No sentiment score: the judge produces almost no negatives, so the field "
            "would be decoration.",
        ],
        "honest_limits": [
            "Measured on search-grounded engine APIs, not the consumer chat apps.",
            "Buyer questions are inferred, not measured from real traffic.",
            "Default samples find gaps; they do not certify precise rates.",
        ],
        "source": "https://github.com/tayden-b/aeokit",
        "docs": "https://aeokit.vercel.app/docs",
    }


def main() -> None:
    server.run()


if __name__ == "__main__":
    main()
