import type { Metadata } from 'next'

// The live MCP endpoint. Uses the free Fly subdomain until aeokit.ai is pointed at it —
// change this one constant and every command on the page updates.
const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL ?? 'https://aeokit.fly.dev/mcp'
import Link from 'next/link'
import { SiteHeader } from '@/components/aeokit/site-header'
import { SiteFooter } from '@/components/aeokit/site-footer'
import { CopyBlock } from '@/components/aeokit/copy-block'

export const metadata: Metadata = {
  title: 'Add aeokit to your agent',
  description:
    'One free test, no keys. Then bring your own key for unlimited measurements.',
}

const CLAUDE_CODE = `claude mcp add --transport http aeokit ${MCP_URL}`

const BYOK_CLAUDE_CODE = `claude mcp add aeokit \\
  --env AEOKIT_USER_OPENAI_API_KEY=sk-your-key \\
  -- uvx aeokit-mcp`

const BYOK_JSON = `{
  "mcpServers": {
    "aeokit": {
      "command": "uvx",
      "args": ["aeokit-mcp"],
      "env": { "AEOKIT_USER_OPENAI_API_KEY": "sk-your-key" }
    }
  }
}`

const CLAUDE_DESKTOP = MCP_URL

const CURSOR = `{
  "mcpServers": {
    "aeokit": { "url": "${MCP_URL}" }
  }
}`

const FIRST_ASK = `I sell Acme — invoicing software for freelancers.
Do AI assistants ever recommend us?`

export default function SetupPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">Setup</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance">
          Add aeokit to your agent
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          aeokit is an MCP server. You add it once to the agent you already use, and from then on you
          can ask about your product&apos;s standing in AI answers without leaving the conversation.
        </p>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Two ways in</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Try it free.</span> Connect the hosted
              URL below — no keys, no account — and run a free test measurement on us.
            </li>
            <li>
              <span className="font-medium text-foreground">Bring your own key for unlimited.</span>{' '}
              Run aeokit locally with your own OpenAI or Gemini API key. You pay the engines
              directly at cost — a measurement is a few cents — and there is no limit.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Free test — Claude Code</h2>
          <p className="mt-2 text-sm text-muted-foreground">One command. No keys, no install.</p>
          <CopyBlock code={CLAUDE_CODE} />
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Free test — Claude Desktop</h2>
          <p className="mt-2 text-sm text-muted-foreground">
Settings → Connectors → Add custom connector, then paste this URL.
          </p>
          <CopyBlock code={CLAUDE_DESKTOP} language="json" />
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Free test — Cursor</h2>
          <p className="mt-2 text-sm text-muted-foreground">
Settings → MCP → Add new global MCP server, then paste this into{' '}
            <code className="font-mono">~/.cursor/mcp.json</code>.
          </p>
          <CopyBlock code={CURSOR} language="json" />
        </section>

        <section className="mt-16">
          <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">Unlimited</p>
          <h2 className="mt-2 text-lg font-semibold">Bring your own key</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One command. <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">uvx</code>{' '}
            (ships with <a href="https://docs.astral.sh/uv/" className="underline underline-offset-4 hover:text-foreground">uv</a>)
            fetches and runs aeokit — nothing to clone or install. Swap in your real key.
          </p>
          <CopyBlock code={BYOK_CLAUDE_CODE} />
          <p className="mt-4 text-sm text-muted-foreground">
            Claude Desktop or Cursor: same idea, as JSON config.
          </p>
          <CopyBlock code={BYOK_JSON} language="json" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            One OpenAI <em>or</em> Gemini key is enough; add both (
            <code className="font-mono text-[13px]">AEOKIT_USER_GEMINI_API_KEY</code>) to measure and
            compare both engines. Your key stays in your own config — it is never sent to aeokit,
            never accepted in chat, and never appears in results.
          </p>
        </section>

        <section className="mt-16 rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="text-lg font-semibold">Then ask your agent this</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Replace with your own product and who buys it. That&apos;s the whole interface. If
            anything looks wrong, ask your agent to <code className="font-mono text-[13px]">status</code>{' '}
            first — it reports how many free measurements you have left before anything runs.
          </p>
          <CopyBlock code={FIRST_ASK} />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Your agent will write the questions your buyers would actually ask, sample the engines
            repeatedly, and come back with where you appear, who is recommended instead, and which
            cited pages name your competitors but not you.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Why the free tier is small</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every measurement puts dozens of real questions to real answer engines, which costs real
            money — and on the hosted server, that money is ours. So the free tier is a taste: enough
            to see exactly what you get. When you want more, bring your own key above and it costs
            you cents, not a subscription.
          </p>
        </section>

        <p className="mt-16 text-sm text-muted-foreground">
          Something not working?{' '}
          <a
            href="https://github.com/tayden-b/aeokit/issues"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Open an issue
          </a>{' '}
          — or read the{' '}
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            overview
          </Link>{' '}
          again.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
