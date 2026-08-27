'use client'

import { useState } from 'react'
import { Check, Copy, Layers } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

const query = 'how does Flowlane show up in AI search?'
const offRows = ["One engine's guess about itself", 'No competitor comparison', 'No numbers, no sources, nothing to act on']
const onRows = ['You appear in 12% of answers · #6 of 11', 'Invisible on Gemini · Asana wins 8 of 10', 'The 5 sites shaping those answers ↓']

export function LiveDataDemo() {
  const [live, setLive] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copyPrompt() {
    await navigator.clipboard.writeText(query)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section id="how-it-works" aria-label="The same agent, with measurement switched on." className="border-b border-border bg-background px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">The same agent, with measurement switched on.</h2>
        <div className="mt-9 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3"><span className="font-mono text-xs tracking-widest text-muted-foreground">MEASUREMENT</span><Switch checked={live} onCheckedChange={setLive} aria-label="MEASUREMENT" /></div>
          <p role="status" className="text-sm text-muted-foreground">{live ? "Measurement is on. Your agent has evidence." : 'Measurement is off. Your agent is guessing.'}</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4 text-sm font-medium"><Layers className="size-4" /> marketmaker <span className="text-muted-foreground">+</span> Agent</div>
          <div className="flex flex-col gap-4 p-6">
            <p className="ml-auto w-fit max-w-[90%] rounded-2xl bg-muted px-4 py-2.5 text-sm">{query}</p>
            {!live && <p className="text-sm leading-relaxed">Flowlane seems fairly well known, it probably comes up for project management…</p>}
            <div key={String(live)} className="flex animate-in flex-col divide-y divide-border rounded-xl border border-border fade-in duration-300">
              {(live ? onRows : offRows).map((row, index) => (
                <div key={row} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>{row}</span>{live ? <Check className="size-4 shrink-0 text-brand" /> : <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">UNVERIFIED</span>}
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{live ? "Measured live: 8 buyer questions, 2 engines, 5 samples each. An AI can't tell you this about itself." : 'Measurement is off. Your agent is guessing.'}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2"><Button size="lg" className="rounded-full px-6" onClick={copyPrompt}><Copy data-icon="inline-start" /> {copied ? 'Copied' : 'Try it'}</Button><p className="text-sm text-muted-foreground">Copies the prompt above so you can run it in your own agent.</p></div>
      </div>
    </section>
  )
}
