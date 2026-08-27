'use client'

import { useEffect, useState } from 'react'
import { Dithering } from '@paper-design/shaders-react'
import { ArrowUpRight, Check, ChevronDown, Layers, Plus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

const engines = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity']
const progress = [
  ['Wrote 8 buyer questions for your category', 'project-management'],
  ['Asked ChatGPT and Gemini, 3 times each', '48 live answers'],
  ['Found who they recommend', '11 products named'],
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
    <section aria-label="Hero" className="relative isolate overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[42%] overflow-hidden lg:block" aria-hidden="true">
        <Dithering
          className="size-full opacity-90"
          colorBack="hsl(0, 0%, 100%)"
          colorFront="hsl(232, 79%, 53%)"
          shape="warp"
          type="4x4"
          pxSize={3}
          scale={0.72}
          speed={0.16}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,transparent_42%)]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 pb-12 pt-20 text-center sm:pt-28">
        <p className="font-mono text-xs font-medium tracking-[0.18em] text-brand">AEO, MEASURED LIVE</p>
        <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">
          Find out if{' '}
          <span className="relative inline-grid min-w-[5.9em] text-left text-brand" aria-live="polite">
            {engines.map((name, index) => (
              <span
                key={name}
                className={`col-start-1 row-start-1 transition-all duration-500 ${index === engine ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'}`}
                aria-hidden={index !== engine}
              >
                {name}
              </span>
            ))}
          </span>
          <br className="hidden sm:block" /> recommends your product
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          Tell your agent what you sell. marketmaker asks the real engines your buyers&apos; real questions — live, many times over — and tells you exactly where you stand.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="rounded-full px-6">Connect your agent</Button>
          <Button size="lg" variant="ghost" className="rounded-full px-5">See a live probe <ArrowUpRight data-icon="inline-end" /></Button>
        </div>
        <p className="mt-4 font-mono text-xs text-muted-foreground">First probe free · then bring your own API keys · no seats, no contracts</p>
      </div>

      <div id="live-probe" className="mx-auto max-w-3xl px-4 pb-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2 text-sm font-medium"><Layers className="size-4" aria-hidden="true" /> marketmaker <Plus className="size-3 text-muted-foreground" /> Agent</div>
            <button type="button" className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Live probe <ChevronDown className="size-3" /></button>
          </div>
          <div className="flex flex-col gap-4 px-5 py-5 sm:px-7">
            <p className="ml-auto max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-sm">I sell Flowlane — project management for small teams. Do AI assistants ever recommend us?</p>
            <div className="flex flex-col gap-2" aria-live="polite">
              {progress.map(([label, result], index) => (
                <div key={label} className={`flex flex-col justify-between gap-1 rounded-lg border border-border px-3 py-2.5 text-sm transition-all duration-500 sm:flex-row sm:items-center ${index < shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                  <span>{label}</span><span className="flex items-center gap-1 font-mono text-xs text-brand"><Check className="size-3" /> {result}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col divide-y divide-border rounded-xl bg-muted/60 px-4">
              {['You appear in 3 of 20 answers · ranked #6 of 11', 'ChatGPT → you’re #4 · Trello and Asana lead', 'Gemini → you’re never mentioned · Asana wins 8 of 10'].map((row) => <p key={row} className="py-3 text-sm font-medium">{row}</p>)}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">Measured live just now, 48 answers · full report includes what they say about you and which sites drive it</p>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-5 py-3.5 text-muted-foreground"><span className="flex-1 text-sm">Reply...</span><span className="text-xs">Live</span><span className="flex size-7 items-center justify-center rounded-full bg-brand text-brand-foreground"><Send className="size-3.5" /></span></div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Example figures shown.</p>
      </div>

      <div id="sources" className="mt-12 border-y border-border bg-foreground py-10 text-background">
        <p className="text-center font-mono text-[11px] tracking-[0.16em] text-background/60">MEASURED LIVE, ON THE ENGINES YOUR BUYERS ACTUALLY USE</p>
        <div className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-2 px-6">
          {engines.map((name) => <span key={name} className="rounded-full border border-background/20 px-4 py-2 text-sm">{name}</span>)}
          <span className="rounded-full border border-dashed border-background/30 px-4 py-2 text-sm text-background/45">Google AI Overviews — planned</span>
          <span className="rounded-full bg-background px-4 py-2 text-sm text-foreground">any product, any category</span>
          <span className="rounded-full bg-background px-4 py-2 text-sm text-foreground">results in a few minutes</span>
        </div>
      </div>
    </section>
  )
}
