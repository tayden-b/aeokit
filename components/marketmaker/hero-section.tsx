'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Bot, Check, ChevronRight, Send, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

const engines = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity']
const progress = [
  ['Generated 8 buyer questions', 'complete'],
  ['Sampled 48 live answers', 'complete'],
  ['Compared 11 products', 'complete'],
]

export function HeroSection() {
  const [engine, setEngine] = useState(0)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setEngine((value) => (value + 1) % engines.length), 2200)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const timers = progress.map((_, index) => window.setTimeout(() => setShown(index + 1), 600 + index * 650))
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return (
    <section aria-label="Hero" className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center sm:pt-28">
        <p className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 font-mono text-[11px] font-medium tracking-[0.14em] text-brand">
          <Wrench className="size-3.5" aria-hidden="true" /> MCP-FIRST TOOL FOR AI AGENTS
        </p>
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">
          Give your agent one tool to measure
          <span className="mt-1 block sm:mt-2">
            what <span className="text-brand" aria-live="polite">{engines[engine]}</span> recommends.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          marketmaker is an MCP tool your existing agent calls to run live, repeatable probes across answer engines. No dashboard to monitor. No new workflow to learn.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="rounded-full px-6" render={<a href="#add-to-agent">Add to your agent <ChevronRight data-icon="inline-end" /></a>} />
          <Button size="lg" variant="ghost" className="rounded-full px-5" render={<a href="#how-it-works">See the tool call <ArrowUpRight data-icon="inline-end" /></a>} />
        </div>
        <p className="mt-4 font-mono text-xs text-muted-foreground">MCP in minutes · API available · first probe free</p>
      </div>

      <div id="live-probe" className="mx-auto max-w-3xl px-4 pb-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2 text-sm font-medium"><Bot className="size-4" aria-hidden="true" /> Your agent</div>
            <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] tracking-wide text-muted-foreground">MCP CONNECTED</span>
          </div>
          <div className="flex flex-col gap-4 px-5 py-5 sm:px-7">
            <p className="ml-auto max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-sm">Do AI assistants recommend Flowlane for small teams?</p>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2.5">
                <span className="flex items-center gap-2 font-mono text-xs font-medium"><Wrench className="size-3.5 text-brand" /> marketmaker.measure</span>
                <span className="font-mono text-[10px] text-brand">TOOL CALL</span>
              </div>
              <div className="flex flex-col gap-2 p-3" aria-live="polite">
                {progress.map(([label], index) => (
                  <div key={label} className={`flex items-center justify-between gap-4 px-1 py-1.5 text-sm transition-all duration-500 ${index < shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                    <span>{label}</span><Check className="size-3.5 text-brand" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-foreground p-4 text-background">
              <div className="flex items-center justify-between gap-4"><span className="font-mono text-[10px] text-background/60">STRUCTURED RESULT</span><span className="font-mono text-[10px] text-background/60">48 ANSWERS</span></div>
              <p className="mt-3 text-sm font-medium">Flowlane appears in 3 of 20 recommendations, ranking #6 of 11. Asana leads.</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">The evidence returns inside the conversation, ready for your agent to explain, save, or act on.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-5 py-3.5 text-muted-foreground"><span className="flex-1 text-sm">Ask your agent a follow-up...</span><span className="flex size-7 items-center justify-center rounded-full bg-brand text-brand-foreground"><Send className="size-3.5" /></span></div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Example figures shown. marketmaker is the tool call, not another place to work.</p>
      </div>

      <div id="sources" className="mt-12 border-y border-border bg-foreground py-10 text-background">
        <p className="text-center font-mono text-[11px] tracking-[0.16em] text-background/60">ONE TOOL · LIVE ACCESS TO THE ENGINES YOUR BUYERS USE</p>
        <div className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-2 px-6">
          {engines.map((name) => <span key={name} className="rounded-full border border-background/20 px-4 py-2 text-sm">{name}</span>)}
          <span className="rounded-full border border-dashed border-background/30 px-4 py-2 text-sm text-background/45">Google AI Overviews (planned)</span>
          <span className="rounded-full bg-background px-4 py-2 text-sm text-foreground">MCP-first</span>
          <span className="rounded-full bg-background px-4 py-2 text-sm text-foreground">API compatible</span>
        </div>
      </div>
    </section>
  )
}
