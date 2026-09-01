# aeokit

**Find out whether AI answer engines recommend your product.**

People increasingly ask ChatGPT or Gemini what to buy instead of searching. When they do, the engine names specific products — and if you make one, you have no visibility into whether it names yours. aeokit measures that: it derives the questions your buyers would ask, puts them to the real engines repeatedly with web search grounding, and reports where you stand — as counts with confidence intervals, never a score.

**Try it:** [aeokit.vercel.app](https://aeokit.vercel.app) · **License:** MIT

## Two ways to use it

**Hosted (free tier, no keys).** Add the remote MCP server to any agent:

```bash
claude mcp add --transport http aeokit https://aeokit.fly.dev/mcp
```

Then ask your agent: *"I sell Acme, invoicing software for freelancers — do AI assistants ever recommend us?"* The hosted tier runs on aeokit's own API keys, so free usage is capped (a few measurements per person per day, under a hard daily budget).

**Bring your own key (unlimited).** Run the same engine locally on your own OpenAI or Gemini key — you pay the engines directly, a few cents per measurement:

```bash
claude mcp add aeokit \
  --env AEOKIT_USER_OPENAI_API_KEY=sk-your-key \
  -- uvx aeokit-mcp
```

Keys are read only from the server environment, never accepted as tool arguments — anything passed as a tool argument lands in conversation transcripts.

## How a measurement works

1. **Question derivation** — a model writes ~4 buyer-intent questions from your one-line description, spanning problem / category / comparison / constraint intents. The questions never name your product: naming it would measure recognition, not recommendation.
2. **Live sampling** — each question goes to each engine (OpenAI, Gemini) twice, through the real APIs with search grounding. One answer is noise; recommendations change run to run.
3. **Structured extraction** — a judge model records every product each answer recommended, in what order, with what language.
4. **Source verification** — the most-cited pages are fetched (with SSRF-guarded, redirect-validated requests) and checked for your product's name. This is the most actionable output: those pages shape the answers.

Statistical rules the code enforces: every rate ships with its denominator and a 95% Wilson interval; cross-engine differences are only reported when the interval on the difference excludes zero; no composite scores; no sentiment (the judge produces almost no negatives, so the field would be decoration); failed measurements refund the caller's quota.

## MCP surface

| Server | Tools | Flow |
|---|---|---|
| Hosted (`aeokit.fly.dev/mcp`) | `status`, `measure_product`, `get_measurement`, `how_it_measures` | Two-phase: start returns a job id instantly; poll for the result (~45–90s). Probes run in an isolated subprocess with a hard kill, so nothing can wedge the server. |
| Local (`uvx aeokit-mcp`) | `check_keys`, `measure_product`, `how_it_measures` | Single synchronous call — local stdio has nothing to time out. |
| Local corpus (`uvx aeokit-mcp --corpus`) | research tools over the versioned sampling corpus | For the methodology work in `SPEC.md`; not needed to measure a product. |

Full tool reference: [aeokit.vercel.app/api](https://aeokit.vercel.app/api) · Method details: [aeokit.vercel.app/docs](https://aeokit.vercel.app/docs)

## Repo layout

| Path | What it is |
|---|---|
| `app/`, `components/`, `lib/` | The site (Next.js 16 + React 19 + Tailwind 4), deployed on Vercel |
| `instrument/aeokit_mcp/` | The measurement engine and all three MCP servers (Python, published as [`aeokit-mcp`](https://pypi.org/project/aeokit-mcp/)) |
| `instrument/DEPLOY.md` | Runbook for the hosted server (Fly.io), including spend controls and the kill switch |
| `SPEC.md` | The measurement methodology, versioned and honest about its open TODOs |

## Developing

```bash
# site
pnpm install && pnpm dev

# instrument
cd instrument
python3 -m venv .venv && .venv/bin/pip install -e .
.venv/bin/python -m aeokit_mcp.local        # BYOK server on stdio
```

Provide at least one engine key in `instrument/.env` (`OPENAI_API_KEY` or `GEMINI_API_KEY`) for local runs.

## License

MIT — see [LICENSE](./LICENSE).
