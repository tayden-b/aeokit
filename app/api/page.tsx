import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/aeokit/site-header'
import { SiteFooter } from '@/components/aeokit/site-footer'
import { CopyBlock } from '@/components/aeokit/copy-block'

const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL ?? 'https://aeokit.fly.dev/mcp'

export const metadata: Metadata = {
  title: 'API reference — aeokit',
  description:
    'The aeokit MCP tools: status, measure_product, and get_measurement — parameters, responses, and error behavior.',
}

const STATUS_RESPONSE = `{
  "ready": true,
  "engines_measured": ["openai", "gemini"],
  "your_free_probes_remaining_today": 3,
  "shared_daily_budget_remaining_usd": 1.98,
  "resets": "00:00 UTC",
  "how_long": "a live measurement takes roughly 45-90 seconds"
}`

const MEASURE_CALL = `measure_product(
  product     = "Acme",
  description = "invoicing software for freelancers"
)`

const MEASURE_RESPONSE = `{
  "ok": true,
  "job_id": "bbed103ead",
  "state": "running",
  "measuring": {
    "product": "Acme",
    "engines": ["openai", "gemini"],
    "questions": 4,
    "samples_per_question_per_engine": 2
  },
  "next_step": "Wait about 45 seconds, then call get_measurement with this job_id."
}`

const RESULT_RESPONSE = `{
  "ok": true,
  "headline": "Acme was named in 5 of 16 AI answers (31%) to your buyers' questions.",
  "questions_asked": [
    { "intent": "problem",    "question": "I'm drowning in unpaid invoices..." },
    { "intent": "category",   "question": "What's the best invoicing tool for freelancers?" },
    { "intent": "comparison", "question": "What should I use instead of spreadsheets..." },
    { "intent": "constraint", "question": "What's an affordable invoicing option..." }
  ],
  "by_engine": [
    {
      "engine": "gemini",
      "you_named_in": "5 of 8 answers",
      "rate_range_95ci": "31%–86%",
      "named_most_often_instead": [{ "product": "FreshBooks", "in": "7 of 8" }]
    },
    {
      "engine": "openai",
      "you_named_in": "0 of 8 answers",
      "rate_range_95ci": "0%–32%",
      "named_most_often_instead": [{ "product": "Wave", "in": "8 of 8" }]
    }
  ],
  "cross_engine_differences": [
    {
      "finding": "You are named in 5 of 8 gemini answers but 0 of 8 on openai",
      "difference_95ci_pp": [17.0, 86.3],
      "statistically_real": true
    }
  ],
  "how_engines_describe_you": ["simple", "freelancer-focused", "affordable"],
  "cited_sources": [
    {
      "domain": "example-reviews.com",
      "url": "https://example-reviews.com/best-invoicing-2026",
      "cited_times": 4,
      "you_are_named_on_this_page": false,
      "competitors_named_on_this_page": ["FreshBooks", "Wave"]
    }
  ],
  "do_next": [
    {
      "do": "Get Acme onto example-reviews.com",
      "why": "Engines cited this page 4x and it names FreshBooks, Wave but not you.",
      "evidence": "https://example-reviews.com/best-invoicing-2026"
    }
  ],
  "confidence_and_limits": ["directional only — n=8 per engine is a first look, ..."],
  "method": {
    "samples_per_question_per_engine": 2,
    "grounding_modes": { "grounded": 8, "web_search": 8 },
    "judge": "gpt-4o-mini (judge-0.1, agreement not yet validated)"
  }
}`

function Tool({
  name,
  summary,
  children,
}: {
  name: string
  summary: string
  children: React.ReactNode
}) {
  return (
    <section id={name} className="mt-14 scroll-mt-24 border-t border-border pt-10 first:border-t-0 first:pt-0">
      <h2 className="font-mono text-lg font-semibold tracking-tight">{name}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{summary}</p>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

function Params({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="px-4 py-2.5 font-medium">Parameter</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([name, type, desc]) => (
            <tr key={name}>
              <td className="px-4 py-2.5 font-mono text-[13px]">{name}</td>
              <td className="px-4 py-2.5 font-mono text-[13px] text-muted-foreground">{type}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ApiPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">API reference</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance">The aeokit tools</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          aeokit&apos;s API is its MCP surface: three tools your agent calls on your behalf. There is
          deliberately no separate REST layer to integrate — connect the endpoint once and every
          capability below is available in plain conversation.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Endpoint</p>
          <p className="mt-2 font-mono text-sm text-foreground">{MCP_URL}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Transport: MCP over streamable HTTP. No authentication for the free tier — identity is
            per-connection, limits are enforced server-side. Connection instructions per client are
            on the <Link href="/setup" className="underline underline-offset-4 hover:text-foreground">setup page</Link>.
          </p>
        </div>

        <Tool
          name="status"
          summary="Instant, free. Reports whether the service is up, which engines are measured, and how much free usage you have left today. Agents are instructed to call this before starting a measurement."
        >
          <p className="font-medium text-foreground">Parameters</p>
          <p>None.</p>
          <p className="font-medium text-foreground">Response (abridged)</p>
          <CopyBlock code={STATUS_RESPONSE} language="json" />
        </Tool>

        <Tool
          name="measure_product"
          summary="Starts a live measurement and returns immediately with a job id. The measurement itself — question derivation, sampling both engines, extraction, and source verification — runs server-side for roughly 45–90 seconds."
        >
          <p className="font-medium text-foreground">Parameters</p>
          <Params
            rows={[
              ['product', 'string', 'The product name, exactly as it would appear in an answer.'],
              ['description', 'string', 'One plain sentence: what it does and who buys it. Used to derive buyer questions — keep positioning language out of it.'],
            ]}
          />
          <p className="font-medium text-foreground">Call</p>
          <CopyBlock code={MEASURE_CALL} />
          <p className="font-medium text-foreground">Response</p>
          <CopyBlock code={MEASURE_RESPONSE} language="json" />
          <p>
            A refusal (free tier exhausted, or the shared daily budget spent) comes back as{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">ok: false</code>{' '}
            with a plain-language reason. Refusals are limits, not errors — retrying does not help,
            and agents are told so in the payload.
          </p>
        </Tool>

        <Tool
          name="get_measurement"
          summary="Fetches the result for a job id. Instant. If the measurement is still running it says so and asks the agent to wait 20–30 seconds before polling again."
        >
          <p className="font-medium text-foreground">Parameters</p>
          <Params rows={[['job_id', 'string', 'The id returned by measure_product.']]} />
          <p className="font-medium text-foreground">Response, completed (abridged)</p>
          <CopyBlock code={RESULT_RESPONSE} language="json" />
          <p className="font-medium text-foreground">Guarantees worth knowing</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Every rate carries its denominator and a 95% confidence interval. No composite scores.</li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">cross_engine_differences</code>{' '}
              only contains findings whose interval excludes zero — statistically defensible ones.
            </li>
            <li>Every action in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">do_next</code> cites a URL or an engine as evidence.</li>
            <li>A failed measurement returns your free probe. Results are kept for about an hour.</li>
          </ul>
        </Tool>

        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-lg font-semibold tracking-tight">Rate limits</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Limit</th>
                  <th className="px-4 py-2.5 font-medium">Value</th>
                  <th className="px-4 py-2.5 font-medium">When it resets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">Free measurements, per person</td>
                  <td className="px-4 py-2.5 font-mono text-[13px]">3 / day</td>
                  <td className="px-4 py-2.5 text-muted-foreground">00:00 UTC</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">Shared measurement budget, all users</td>
                  <td className="px-4 py-2.5 font-mono text-[13px]">hard daily cap</td>
                  <td className="px-4 py-2.5 text-muted-foreground">00:00 UTC</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Running it on your own keys via{' '}
            <a href="https://pypi.org/project/aeokit-mcp/" className="underline underline-offset-4 hover:text-foreground">
              aeokit-mcp
            </a>{' '}
            has no limits at all — see{' '}
            <Link href="/setup" className="underline underline-offset-4 hover:text-foreground">setup</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
