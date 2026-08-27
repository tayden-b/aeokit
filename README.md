# marketmaker

**Find out whether AI answer engines recommend your product.**

People don't search any more — they ask. When a buyer asks ChatGPT, Claude, Gemini, or Perplexity for a tool, the engine names specific products. marketmaker measures whether it names yours, and turns that into something you can act on.

Point it at any product, in any category, and it will:

- write the questions that product's buyers would actually ask (never naming the product — we measure *unprompted* recommendation)
- ask the real engines those questions, repeatedly, live, with search grounding on
- report how often you were named, **as counts with denominators, never as a score**
- fetch the pages the engines cited and check whether you're named on them
- hand back specific actions, each anchored to a URL or an engine

An AI cannot answer this about itself: asking a model "who do engines recommend?" is one engine sampling itself once, and recommendations shift run to run. Measuring it takes an instrument.

## Repo layout

| Path | What it is |
|---|---|
| `app/`, `components/`, `lib/` | The marketing site (Next.js 16 + React 19 + Tailwind 4). Managed via v0 — edit there or here. |
| `instrument/` | The measurement engine (Python). Sampling, judge extraction, statistics, cited-page inspection, and the MCP server. |
| `SPEC.md` | The measurement methodology, versioned. Every number the instrument emits cites the spec version that produced it. |

The two halves are independent: the site never imports from `instrument/`, and the instrument has no opinion about the site. v0 can keep syncing the frontend without touching the backend.

## The site

```bash
pnpm install
pnpm dev
```

## The instrument

```bash
cd instrument
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

Provide at least one engine key (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`) in `instrument/.env`.

Run a live probe:

```bash
.venv/bin/python -c "import probe, json; print(json.dumps(probe.run_probe('YourProduct', 'what it does and who buys it'), indent=2))"
```

Connect it to an agent over MCP:

```bash
claude mcp add marketmaker -- /abs/path/instrument/.venv/bin/python /abs/path/instrument/mcp_server.py
```

**Bring your own keys.** Set `MM_USER_<ENGINE>_API_KEY` in your MCP client config to run probes on your own credits. Keys are read only from the server environment — never accepted as tool parameters, because tool arguments land in conversation transcripts.

## Honesty rules the code enforces

- Every rate ships with its denominator and a 95% interval.
- No composite score, letter grade, or "AEO score".
- A cross-engine difference is only reported when its 95% interval excludes zero. (At n=10, two *identical* engines disagree on the top pick about half the time.)
- Sentiment is not reported: the judge has produced zero negatives across ~1,000 extractions, so the field is a constant.
- Derived questions are labeled as inferred, not measured demand.
- Cited pages are fetched with scheme, DNS, IP-range and redirect validation — URLs from engine output are untrusted input.
