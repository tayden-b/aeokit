# marketmaker

**The open measurement instrument for AI answer engines.**

When someone asks ChatGPT, Claude, Gemini, or Perplexity which tool to use for a job, one product gets the recommendation — it *owns that capability* in the AI's mind. marketmaker measures who owns what: continuously sampled, cross-engine, with sample sizes and confidence attached to every number, under a published, versioned methodology.

- **Connect your agent** — an MCP server any agent can attach in two minutes. Free reads over the public corpus.
- **The corpus** — capability × engine × product distributions, sampled daily, raw data public, gaps never backfilled.
- **The methodology** — [`SPEC.md`](./SPEC.md). Versioned. Every response cites the spec version that produced it.

An agent cannot self-report this data: asking a model "who do AI engines recommend?" is one engine sampling itself, once. Measurement requires an instrument.

## Status

Early build (Aug 2026). Spec v0.1 in progress; corpus seeding on the secrets-management + infrastructure-as-code landscape.

## Structure

- `app/` — the public site (Next.js)
- `SPEC.md` — the measurement methodology (the load-bearing artifact)
