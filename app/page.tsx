"use client";

import { useEffect, useState } from "react";

const CAPS = ["secrets management", "drift detection", "secret scanning", "remote state"];
const AGENTS = ["Claude", "ChatGPT", "Cursor", "Gemini"];
const ENGINES = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

function Rotator({ words, className }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);
  return <span className={className}>{words[i]}</span>;
}

function DemoCard() {
  return (
    <div className="mx-auto mt-14 w-full max-w-2xl rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-left shadow-sm">
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span className="font-semibold text-neutral-800">marketmaker</span>
        <span>+</span>
        <span className="rounded-full border border-neutral-300 bg-white px-2 py-0.5">Claude</span>
      </div>
      <p className="mt-4 rounded-xl bg-white p-3 text-sm text-neutral-800 ring-1 ring-neutral-200">
        how do we show up in AI search for <b>secrets management</b> — and who&apos;s winning it?
      </p>
      <div className="mt-3 space-y-2 text-sm">
        {[
          ["Read corpus — 4 engines, grounded", "160 samples"],
          ["Checked drift vs last 30 days", "6 dates"],
          ["Methodology", "spec v0.1"],
        ].map(([l, r]) => (
          <div key={l} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-neutral-200">
            <span className="text-neutral-700">{l}</span>
            <span className="text-xs font-medium text-emerald-700">✓ {r}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[
          ["ChatGPT", "HashiCorp Vault", "72%", "−4 pts / 30d"],
          ["Gemini", "Google Secret Manager", "81%", "flat"],
          ["Perplexity", "Infisical", "59%", "+9 pts / 30d"],
        ].map(([eng, prod, share, trend]) => (
          <div key={eng} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-neutral-200 text-sm">
            <span className="w-24 text-neutral-500">{eng}</span>
            <span className="font-medium text-neutral-900">{prod}</span>
            <span className="font-mono text-neutral-700">{share}</span>
            <span className="text-xs text-neutral-500">{trend}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        Three engines, three different winners · disagreement 0.62 · every row: n=40, Wilson 95% CI →{" "}
        <span className="underline">full capability page</span>
      </p>
    </div>
  );
}

function MeasurementToggle() {
  const [on, setOn] = useState(true);
  return (
    <section className="mx-auto mt-28 max-w-3xl px-6 text-center">
      <h2 className="text-3xl font-semibold tracking-tight">The same agent, with measurement switched on.</h2>
      <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-neutral-300 p-1 text-sm">
        <button
          onClick={() => setOn(false)}
          className={`rounded-full px-4 py-1.5 ${!on ? "bg-neutral-900 text-white" : "text-neutral-500"}`}
        >
          OFF
        </button>
        <span className="text-xs uppercase tracking-widest text-neutral-400">measurement</span>
        <button
          onClick={() => setOn(true)}
          className={`rounded-full px-4 py-1.5 ${on ? "bg-emerald-600 text-white" : "text-neutral-500"}`}
        >
          ON
        </button>
      </div>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-left">
        <p className="rounded-xl bg-white p-3 text-sm ring-1 ring-neutral-200">
          who do AI engines recommend for secrets management?
        </p>
        {!on ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-neutral-600">
              From what I know, HashiCorp Vault is quite popular, and AWS Secrets Manager is widely used…
            </p>
            {["One engine, sampling itself, once", "No cross-engine view", "No sample size, no date, no trend"].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-neutral-200">
                <span className="text-neutral-600">{t}</span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">UNVERIFIED</span>
              </div>
            ))}
            <p className="text-xs text-neutral-500">Measurement is off. Your agent is guessing from its own memory.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {[
              ["ChatGPT → Vault 72%", "n=40 · CI ±9"],
              ["Gemini → Google SM 81%", "n=40 · CI ±8"],
              ["Perplexity → Infisical 59%", "n=40 · CI ±10"],
            ].map(([l, r]) => (
              <div key={l} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-neutral-200">
                <span className="font-medium text-neutral-900">{l}</span>
                <span className="font-mono text-xs text-emerald-700">{r}</span>
              </div>
            ))}
            <p className="text-xs text-neutral-500">
              Measured distribution, cross-engine, dated, spec-versioned. An agent cannot self-report this.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-sm">
        <span className="text-base font-bold tracking-tight">marketmaker</span>
        <div className="hidden gap-6 text-neutral-600 md:flex">
          {["Skills", "Engines", "Methodology", "Data", "Pricing", "Docs"].map((x) => (
            <span key={x} className="cursor-pointer hover:text-neutral-900">{x}</span>
          ))}
        </div>
        <button className="rounded-full bg-neutral-900 px-4 py-2 text-white">Connect your agent</button>
      </nav>

      <section className="mx-auto max-w-4xl px-6 pt-20 text-center">
        <h1 className="text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
          Know who owns <Rotator words={CAPS} className="text-emerald-600" />
          <br /> in the AI&apos;s mind — with <Rotator words={AGENTS} />
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-600">
          No dashboards. No black boxes. Every number carries its sample size, confidence, and the spec version that produced it.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white">Connect your agent</button>
          <button className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium">See it work</button>
        </div>
        <p className="mt-5 text-xs text-neutral-500">Free to connect · the corpus is public · methodology at /spec</p>
        <DemoCard />
      </section>

      <section className="mt-24 border-y border-neutral-100 bg-neutral-50 py-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Every answer engine · one measured corpus
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 px-6 text-sm text-neutral-700">
          {ENGINES.map((e) => (
            <span key={e} className="rounded-full border border-neutral-200 bg-white px-3 py-1">{e}</span>
          ))}
          <span className="rounded-full border border-dashed border-neutral-300 px-3 py-1 text-neutral-400">AI Overviews — planned</span>
        </div>
      </section>

      <MeasurementToggle />

      <section className="mx-auto mt-28 max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Measures the answer layer, continuously.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["Your agent", "Claude, ChatGPT, Cursor, or Gemini. One link connects it. No API key, nothing to install. Free reads."],
            ["Instrument tools", "Rank returns the measured distribution for a capability. Trace shows drift and disagreement over time. Probe queues a new measurement of your category, run under the full protocol."],
            ["The corpus", "Sampled daily across engines with search grounding, judged against a human-labeled golden set, published raw. Gaps are marked, never backfilled."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-neutral-200 p-6">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-28 border-t border-neutral-100 px-6 py-12 text-center text-xs text-neutral-500">
        <p className="font-semibold text-neutral-700">marketmaker — measured data for AI agents.</p>
        <p className="mt-2">SPEC.md · llms.txt · OpenAPI · raw data</p>
        <p className="mt-4 uppercase tracking-widest text-neutral-400">
          © 2026 marketmaker · every number carries its sample size and spec version
        </p>
      </footer>
    </main>
  );
}
