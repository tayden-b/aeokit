import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/aeokit/site-header'
import { SiteFooter } from '@/components/aeokit/site-footer'

export const metadata: Metadata = {
  title: 'Documentation — aeokit',
  description:
    'How aeokit measures AI answer-engine recommendations: the method, the statistics, and the limits.',
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-14 scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">Documentation</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance">How aeokit works</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          aeokit answers one question: when someone asks an AI assistant what to use, does it
          recommend your product? This page explains how that gets measured, why the method is
          shaped the way it is, and what the numbers can and cannot tell you.
        </p>

        <nav aria-label="On this page" className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">On this page</p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {[
              ['#why-measure', 'Why this needs measuring'],
              ['#pipeline', 'The measurement pipeline'],
              ['#statistics', 'The statistics'],
              ['#reading-results', 'Reading a result'],
              ['#limits', 'Known limits'],
              ['#hosted-vs-local', 'Hosted vs. self-run'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Section id="why-measure" title="Why this needs measuring at all">
          <p>
            Ask ChatGPT the same buying question twice and you can get two different answers. That
            is not a bug in aeokit&apos;s method — it is the reason the method exists. A single answer
            is one draw from a distribution, so &quot;I asked ChatGPT and it said Jira&quot; tells you almost
            nothing about what the next hundred buyers will hear.
          </p>
          <p>
            The only honest way to know how engines treat a product is to ask the way a buyer would,
            ask repeatedly, and count. That is the entire design: repeated sampling, structured
            counting, and refusing to claim more than the sample supports.
          </p>
        </Section>

        <Section id="pipeline" title="The measurement pipeline">
          <p>A measurement runs in four stages, all on the server, in about a minute:</p>
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <span className="font-medium text-foreground">Question derivation.</span> From your
              product name and one-line description, a model writes the questions your buyers would
              plausibly ask an assistant — spread across four intents: a problem to solve, a
              best-in-category ask, a comparison, and a constrained ask (team size, budget). The
              questions never name your product. Asking &quot;is Acme good?&quot; measures whether the model
              recognizes Acme; asking &quot;what should I use for invoicing?&quot; measures whether it
              recommends Acme unprompted, which is the thing that matters.
            </li>
            <li>
              <span className="font-medium text-foreground">Live sampling.</span> Each question goes
              to each engine several times, through the real APIs with web search grounding enabled.
              The engines currently measured on the hosted tier are OpenAI and Gemini.
            </li>
            <li>
              <span className="font-medium text-foreground">Structured extraction.</span> A separate
              model reads each answer and records every product it recommended, in what order, and
              with what descriptive language — forced into a fixed schema so the output is countable
              rather than a vibe.
            </li>
            <li>
              <span className="font-medium text-foreground">Source verification.</span> Grounded
              answers cite web pages. aeokit fetches the most-cited ones directly and checks whether
              your product&apos;s name appears in the page text. This step involves no statistics at
              all, and it is usually the most actionable part of a report: these are the pages
              shaping the answers, and either you are on them or you are not.
            </li>
          </ol>
        </Section>

        <Section id="statistics" title="The statistics, and what aeokit refuses to do">
          <p>
            Every rate ships as a count with its denominator — &quot;named in 5 of 16 answers&quot; — plus a
            95% Wilson confidence interval. At small samples those intervals are wide, and the report
            says so instead of hiding it.
          </p>
          <p>
            Cross-engine comparisons get a stricter test. At a handful of samples per engine, two{' '}
            <em>identical</em> engines will show a different top answer about half the time by pure
            chance. So aeokit only reports &quot;these engines treat you differently&quot; when the
            confidence interval on the difference excludes zero. If a gap is not statistically
            distinguishable from noise, the report says no claimable difference was found — which is
            itself information.
          </p>
          <p>Some things are deliberately absent:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>No composite score, letter grade, or &quot;AI visibility index&quot;. A number without a denominator is marketing, not measurement.</li>
            <li>No sentiment score. In roughly a thousand extractions our judge produced almost no negative ratings, which means the field is a constant, and reporting a constant as insight would be dishonest.</li>
            <li>No trend claims from a single run. Movement over time requires runs over time.</li>
          </ul>
        </Section>

        <Section id="reading-results" title="Reading a result">
          <p>A report has four load-bearing parts:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-foreground">Where you appear</span> — your count per
              engine, with the interval. Zero mentions on an engine is a finding, not an error.
            </li>
            <li>
              <span className="font-medium text-foreground">Who is named instead</span> — the
              products engines actually recommend for your buyers&apos; questions, with their counts.
            </li>
            <li>
              <span className="font-medium text-foreground">The cited sources</span> — real URLs the
              engines drew on, each marked with whether your product is named on that page and which
              competitors are.
            </li>
            <li>
              <span className="font-medium text-foreground">Next actions</span> — each one anchored
              to a specific URL or engine. &quot;Get listed on the comparison page engines cited four
              times, which names three competitors and not you&quot; is an action; &quot;improve your AI
              visibility&quot; is not, and aeokit will not say it.
            </li>
          </ul>
        </Section>

        <Section id="limits" title="Known limits">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-foreground">API surface, not chat apps.</span>{' '}
              Measurements run against search-grounded engine APIs. The consumer ChatGPT and Gemini
              apps run different builds with different system prompts, and their answers can differ.
              Quantifying that gap is open work; until then, treat results as measuring the model
              layer.
            </li>
            <li>
              <span className="font-medium text-foreground">Derived questions, not measured demand.</span>{' '}
              The buyer questions are inferred from your description. They model how buyers plausibly
              ask; tools with consumer panel data know what people actually ask. Treat the question
              set as a hypothesis.
            </li>
            <li>
              <span className="font-medium text-foreground">Small free-tier samples.</span> A free
              measurement is sized to find gaps — a competitor dominating, an engine ignoring you, a
              cited page you are absent from — not to certify precise rates. Pinning a rate to
              ±10 points takes roughly 90 answers per engine.
            </li>
          </ul>
        </Section>

        <Section id="hosted-vs-local" title="Hosted vs. running it yourself">
          <p>
            The hosted server at <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">aeokit.fly.dev/mcp</code>{' '}
            runs on aeokit&apos;s own API keys, which is why free usage is capped. The same engine is
            published as{' '}
            <a href="https://pypi.org/project/aeokit-mcp/" className="underline underline-offset-4 hover:text-foreground">
              aeokit-mcp on PyPI
            </a>{' '}
            — run it locally with your own OpenAI or Gemini key and there is no cap and no
            middleman; you pay the engines directly, a few cents per measurement. The{' '}
            <Link href="/setup" className="underline underline-offset-4 hover:text-foreground">setup page</Link>{' '}
            has both paths, and the{' '}
            <a href="https://github.com/tayden-b/aeokit" className="underline underline-offset-4 hover:text-foreground">
              source
            </a>{' '}
            is public if you want to read exactly what runs.
          </p>
        </Section>

        <p className="mt-16 text-sm text-muted-foreground">
          Looking for the tool-by-tool details? See the{' '}
          <Link href="/api" className="underline underline-offset-4 hover:text-foreground">API reference</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
