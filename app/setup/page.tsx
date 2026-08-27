import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/aeokit/site-header'
import { SiteFooter } from '@/components/aeokit/site-footer'
import { CopyBlock } from '@/components/aeokit/copy-block'

export const metadata: Metadata = {
  title: 'Add aeokit to your agent',
  description:
    'Connect aeokit to Claude Code, Claude Desktop, or Cursor in one command. Runs on your own API keys.',
}

const CLAUDE_CODE = `claude mcp add aeokit \\
  --env AEOKIT_USER_OPENAI_API_KEY=sk-your-key \\
  -- uvx aeokit-mcp`

const CLAUDE_DESKTOP = `{
  "mcpServers": {
    "aeokit": {
      "command": "uvx",
      "args": ["aeokit-mcp"],
      "env": {
        "AEOKIT_USER_OPENAI_API_KEY": "sk-your-key"
      }
    }
  }
}`

const CURSOR = `{
  "mcpServers": {
    "aeokit": {
      "command": "uvx",
      "args": ["aeokit-mcp"],
      "env": { "AEOKIT_USER_OPENAI_API_KEY": "sk-your-key" }
    }
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
          <h2 className="text-lg font-semibold">Before you start</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">
                You do not need all four keys — one is enough to start.
              </span>{' '}
              The minimum is a single OpenAI <em>or</em> Gemini key: either one can both write your
              buyer questions and read the answers. Every key you add is one more engine measured.
            </li>
            <li>
              <span className="font-medium text-foreground">Probes run on your key.</span> aeokit adds
              nothing on top; you pay the engines directly. A typical probe is a few dozen calls,
              roughly the price of a coffee.
            </li>
            <li>
              <span className="font-medium text-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">uvx</code> runs it
                without installing anything.
              </span>{' '}
              It ships with{' '}
              <a
                href="https://docs.astral.sh/uv/"
                className="underline underline-offset-4 hover:text-foreground"
              >
                uv
              </a>
              . No clone, no virtualenv, no Python setup.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h3 className="text-sm font-semibold">What each key adds</h3>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Key</th>
                  <th className="px-4 py-2.5 font-medium">What it gets you</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[13px]">OpenAI</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    Measures ChatGPT, and can write questions and read answers
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[13px]">Gemini</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    Measures Gemini, and can write questions and read answers
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[13px]">Anthropic</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Measures Claude</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[13px]">Perplexity</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    Measures Perplexity, always search-grounded
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            One key works. Two is the real recommendation — the most useful thing aeokit finds is
            engines <em>disagreeing</em> about who to recommend, and that needs at least two to
            compare. Add keys by putting more{' '}
            <code className="font-mono text-[13px]">AEOKIT_USER_*_API_KEY</code> entries in the same
            config.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Claude Code</h2>
          <p className="mt-2 text-sm text-muted-foreground">One command in your terminal.</p>
          <CopyBlock code={CLAUDE_CODE} />
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Claude Desktop</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Settings → Developer → Edit Config, then add the <code className="font-mono">aeokit</code>{' '}
            entry and restart Claude.
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
            anything looks wrong, ask your agent to <code className="font-mono text-[13px]">check_setup</code>{' '}
            first — it reports which engines you can measure before anything is spent.
          </p>
          <CopyBlock code={FIRST_ASK} />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Your agent will write the questions your buyers would actually ask, sample the engines
            repeatedly, and come back with where you appear, who is recommended instead, and which
            cited pages name your competitors but not you.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">About your keys</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Keys are read only from the MCP server&apos;s environment — the config above. aeokit never
            accepts a key as a tool argument, because anything passed as a tool argument is written
            into the conversation transcript and your model&apos;s context. Your keys stay in your own
            config file, are never sent to us, and never appear in any result.
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
