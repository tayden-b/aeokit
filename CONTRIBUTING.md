# Contributing

Thanks for looking. aeokit is small enough that the whole thing fits in your head in an afternoon, and that's deliberate — please keep it that way.

## Ground rules

**The honesty rules are not up for negotiation.** Every number reported carries its denominator and an interval. No composite scores. No cross-engine claim without a significance test. If a change would make a report sound more confident than the sample supports, it will not be merged, however nice the chart looks.

**Keys are never tool arguments.** Anything passed as an MCP tool argument lands in a conversation transcript. Engine keys arrive through the process environment only. See `SECURITY.md`.

**Fetched pages are hostile input.** Cited URLs come out of model output. Anything that fetches them goes through `pagecheck._assert_safe` — scheme allowlist, DNS resolution, private-range denial, redirect re-validation. Don't add a second fetch path.

## Setup

```bash
cd instrument
python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"
.venv/bin/pytest            # ~40 tests, all offline, sub-second
.venv/bin/ruff check aeokit_mcp tests
```

Engine keys in `instrument/.env` (`OPENAI_API_KEY`, `GEMINI_API_KEY`) are only needed to run real measurements; the test suite never touches the network.

The site:

```bash
pnpm install && pnpm dev
```

## What a good change looks like

- **Tests for logic, not for prose.** Statistics, quota accounting, the product-name filter, the URL safety check — those get tests. Copy changes don't.
- **Offline tests only.** If a test needs an API key it is a script, not a test.
- **One concern per commit**, with a subject line that says what changed and, when it's not obvious, why.
- **Docstrings explain constraints the code can't.** "Retrying a 404 once cost a probe minutes" is worth a comment; "increments the counter" is not.

## Adding an engine

An engine is an adapter in `aeokit_mcp/engines.py` returning an `EngineAnswer` with an honest `grounding_mode` — `'none'` if the grounded call fell back. Add its cost to `budget.COST_PER_CALL`, its key to `keys.ENGINE_ENV`, and note in `DEPLOY.md` whether the adapter has been exercised against the real API. Untested adapters are labeled as such; that's not a formality.

## Reporting problems

Bugs and measurement-integrity concerns: [open an issue](https://github.com/tayden-b/aeokit/issues). Security problems: see `SECURITY.md` — please don't file those publicly.
