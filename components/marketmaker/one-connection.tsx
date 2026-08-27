'use client'

import { useState } from 'react'
import { ArrowRight, Bot, Check, Copy, Database, Radio, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

const config = `{
  "mcpServers": {
    "marketmaker": {
      "url": "https://mcp.marketmaker.ai"
    }
  }
}`

export function OneConnection() {
  const [copied, setCopied] = useState(false)

  async function copyConfig() {
    await navigator.clipboard.writeText(config)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section id="add-to-agent" className="border-b border-border bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-medium tracking-widest text-brand">ADD ONE CAPABILITY</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">It lives inside the agent you already use.</h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">Connect marketmaker once. Then Claude, ChatGPT, Cursor, or your own agent can call it whenever a question needs live market evidence.</p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted"><Bot className="size-5" aria-hidden="true" /></span>
            <div><p className="font-mono text-[10px] tracking-widest text-muted-foreground">01 · YOUR WORKSPACE</p><h3 className="mt-2 text-lg font-medium">Your agent</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">You ask naturally, in the same conversation where the rest of your work happens.</p></div>
          </div>
          <div className="hidden items-center lg:flex"><ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" /></div>
          <div className="flex flex-col gap-5 border-y border-border bg-muted/40 p-6 sm:p-8 lg:border-x lg:border-y-0">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-brand-foreground"><Wrench className="size-5" aria-hidden="true" /></span>
            <div><p className="font-mono text-[10px] tracking-widest text-brand">02 · MCP TOOL</p><h3 className="mt-2 text-lg font-medium">marketmaker.measure</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">The agent sends a product brief and receives measured, structured evidence.</p></div>
          </div>
          <div className="hidden items-center lg:flex"><ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" /></div>
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted"><Radio className="size-5" aria-hidden="true" /></span>
            <div><p className="font-mono text-[10px] tracking-widest text-muted-foreground">03 · LIVE SOURCES</p><h3 className="mt-2 text-lg font-medium">Answer engines</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">marketmaker samples real engines repeatedly, then returns rankings, competitors, language, and sources.</p></div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-foreground text-background">
            <div className="flex items-center justify-between border-b border-background/15 px-5 py-3"><span className="font-mono text-xs text-background/60">mcp.json</span><Button size="sm" variant="ghost" className="text-background hover:bg-background/10 hover:text-background" onClick={copyConfig}><Copy data-icon="inline-start" />{copied ? 'Copied' : 'Copy config'}</Button></div>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-background/80"><code>{config}</code></pre>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border p-6">
            <div><Database className="size-5 text-brand" aria-hidden="true" /><h3 className="mt-4 font-medium">Building your own agent?</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Call the same measurement capability through the API. MCP stays the fastest path.</p></div>
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-brand">View API docs <ArrowRight className="size-4" aria-hidden="true" /></a>
          </div>
        </div>
        <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-brand" aria-hidden="true" /> No separate dashboard, seats, or workflow required.</p>
      </div>
    </section>
  )
}
