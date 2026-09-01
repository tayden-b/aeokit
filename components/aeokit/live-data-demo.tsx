'use client'

import { useState } from 'react'
import { Check, Copy, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

const query = 'how does Flowlane show up in AI search?'
const offRows = ["One engine's guess about itself", 'No competitor comparison', 'No numbers, no sources, nothing to act on']
const onRows = ['You appear in 3 of 16 answers · #6 of 11', 'Invisible on Gemini · Asana wins 7 of 8', 'The 5 sites shaping those answers ↓']

export function LiveDataDemo() {
  const [live, setLive] = useState(true)
  const [copied, setCopied] = useState(false)

  async function copyPrompt() {
    await navigator.clipboard.writeText(query)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section id="demo" aria-label="The same agent, with measurement switched on." className="border-b border-border bg-background px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">The same agent, with measurement switched on.</h2>
        <div className="mt-9 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 rounded-full border border-border bg-muted p-1" role="group" aria-label="Measurement mode">
            <button type="button" onClick={() => setLive(false)} aria-pressed={!live} className={`rounded-full px-4 py-2 font-mono text-xs transition-colors ${!live ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>OFF</button>
            <span className="px-1 font-mono text-xs tracking-widest text-muted-foreground">MEASUREMENT</span>
            <button type="button" onClick={() => setLive(true)} aria-pressed={live} className={`rounded-full px-4 py-2 font-mono text-xs transition-colors ${live ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>ON</button>
          </div>
          <p role="status" className="text-sm text-muted-foreground">{live ? 'Measurement is on. Your agent has evidence.' : 'Measurement is off. Your agent is guessing.'}</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4 text-sm font-medium"><Layers className="size-4" /> aeokit <span className="text-muted-foreground">+</span> Agent</div>
          <div className="flex flex-col gap-4 p-6">
            <p className="ml-auto w-fit max-w-[90%] rounded-2xl bg-muted px-4 py-2.5 text-sm">{query}</p>
            <div key={String(live)} className="flex animate-in flex-col gap-4 fade-in duration-200">
              {!live && <p className="text-sm leading-relaxed">Flowlane seems fairly well known, it probably comes up for project management…</p>}
              <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
                {(live ? onRows : offRows).map((row) => (
                  <div key={row} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span>{row}</span>{live ? <Check className="size-4 shrink-0 text-brand" /> : <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">UNVERIFIED</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{live ? "Measured live: 4 buyer questions, 2 engines, 2 samples each — 16 answers. An AI can't tell you this about itself." : 'Nothing here is verifiable — no counts, no sources, no dates.'}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2"><Button size="lg" className="rounded-full px-6" onClick={copyPrompt}><Copy data-icon="inline-start" /> {copied ? 'Copied' : 'Try it'}</Button><p className="text-sm text-muted-foreground">Copies the prompt above so you can run it in your own agent.</p></div>
      </div>
    </section>
  )
}
