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

Optional extra engines: `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`.

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
