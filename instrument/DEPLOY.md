# Deploying the hosted aeokit server

The hosted server runs **live probes only**, on the operator's API keys, gated by
a hard daily spend cap. It does not use the corpus.

## One-time

```bash
brew install flyctl && fly auth login       # creates/authenticates your Fly account
cd instrument
fly launch --no-deploy --name aeokit        # reads fly.toml; creates the app
fly volumes create aeokit_data --size 1 --region iad
```

## Secrets (never in the repo)

```bash
fly secrets set \
  OPENAI_API_KEY=sk-... \
  GEMINI_API_KEY=... \
  AEOKIT_CONTACT=you@example.com
```

### Adding the other two engines

`ANTHROPIC_API_KEY` and `PERPLEXITY_API_KEY` are optional but recommended — they are
the *cheap* engines, and they roughly double coverage for ~30% more cost per probe:

| Engines | Cost/probe | Probes/day at a $5 cap |
|---|---|---|
| OpenAI + Gemini | ~$1.14 | 3 |
| all four | ~$1.50 | 2 |

Perplexity is the single most relevant engine for AEO — it is an answer engine by
design, always search-grounded, and the cheapest per call.

> **Untested code path.** Only the OpenAI and Gemini adapters have ever run against
> real APIs. The Anthropic and Perplexity adapters are written but unproven — the
> tool-type string, model name, and citation parsing are all unverified. Add those
> keys locally and run one cheap probe (`--n 1 --max-calls 2`) before relying on
> them in production.

**Also set spend limits in each provider's own dashboard.** That is a second
ceiling that does not depend on this code being correct.

## Deploy

```bash
fly deploy
```

The MCP endpoint is then `https://aeokit.fly.dev/mcp`. To use a custom domain:

```bash
fly certs add mcp.aeokit.ai      # then add the DNS record Fly prints
```

## Spend controls

| Control | Where | Default |
|---|---|---|
| Global daily cap | `AEOKIT_DAILY_USD_CAP` in fly.toml | $5.00/UTC day |
| Free probes per client | `AEOKIT_FREE_PROBES_PER_CLIENT` | 1/day |
| Provider-side cap | OpenAI/Gemini dashboards | set these yourself |

Raise or lower the cap live without redeploying:

```bash
fly secrets set AEOKIT_DAILY_USD_CAP=10.00
```

**Kill switch** — stop all spending immediately:

```bash
fly scale count 0
```

## Checking on it

```bash
fly logs
fly ssh console -C "sqlite3 /data/quota.db 'SELECT day, COUNT(*), ROUND(SUM(COALESCE(actual_usd,reserved_usd)),2) FROM reservations GROUP BY day;'"
```
