import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/aeokit/site-header'
import { SiteFooter } from '@/components/aeokit/site-footer'
import { CopyBlock } from '@/components/aeokit/copy-block'

export const metadata: Metadata = {
  title: 'Add aeokit to your agent',
  description:
    'Connect aeokit to Claude Code, Claude Desktop, or Cursor. No API keys, no account, no install.',
}

const CLAUDE_CODE = `claude mcp add --transport http aeokit https://mcp.aeokit.ai/mcp`

const CLAUDE_DESKTOP = `https://mcp.aeokit.ai/mcp`

const CURSOR = `{
  "mcpServers": {
    "aeokit": { "url": "https://mcp.aeokit.ai/mcp" }
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
          <h2 className="text-lg font-semibold">There is nothing to set up</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">No API keys.</span> aeokit runs the
              measurements on its own engine accounts. You connect a URL and ask a question.
            </li>
            <li>
              <span className="font-medium text-foreground">No account, no card.</span> Every visitor
              gets a free measurement each day. Measurements cost real money to run, so that free
              tier is genuinely small while this is in early access.
            </li>
            <li>
              <span className="font-medium text-foreground">Nothing to install.</span> It is a remote
              MCP server — your agent connects over HTTPS.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Claude Code</h2>
          <p className="mt-2 text-sm text-muted-foreground">One command. No keys, no install.</p>
          <CopyBlock code={CLAUDE_CODE} />
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Claude Desktop</h2>
          <p className="mt-2 text-sm text-muted-foreground">
Settings → Connectors → Add custom connector, then paste this URL.
          </p>
          <CopyBlock code={CLAUDE_DESKTOP} language="json" />
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Cursor</h2>
          <p className="mt-2 text-sm text-muted-foreground">
Settings → MCP → Add new global MCP server, then paste this into{' '}
            <code className="font-mono">~/.cursor/mcp.json</code>.
          </p>
          <CopyBlock code={CURSOR} language="json" />
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
          <h2 className="text-lg font-semibold">About the free tier</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A single measurement puts dozens of real questions to real answer engines, which costs
            real money. aeokit pays for that, so free usage is one measurement per visitor per day,
            under a shared daily ceiling. When either limit is reached the tool says so plainly
            rather than failing — and if you need more than that, get in touch and I&apos;ll open it up.
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
