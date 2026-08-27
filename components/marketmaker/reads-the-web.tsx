import { Bot, Braces, Check, Radar, Wrench } from 'lucide-react'

const steps = [
  { icon: Bot, title: 'Your agent sends context', body: 'A short product brief and the question you want measured. The call starts from the agent conversation you already use.' },
  { icon: Radar, title: 'The tool samples live engines', body: 'marketmaker writes buyer questions and asks real answer engines repeatedly, because one generated answer is noise.' },
  { icon: Braces, title: 'Structured evidence returns', body: 'Your agent gets rankings, competitors, exact answer language, and influential sources as data it can explain or act on.' },
]

const engines = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity']

export function ReadsTheWeb() {
  return (
    <section className="border-b border-border bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="font-mono text-xs font-medium tracking-widest text-brand">INSIDE THE TOOL CALL</p><h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">How a live probe works.</h2></div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">Your agent invokes one MCP tool. marketmaker does the measurement work and returns evidence—not another interface.</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-muted p-3 sm:p-5">
          <div className="grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[0.9fr_auto_1.2fr_auto_0.9fr] lg:items-stretch">
            <div className="flex flex-col justify-between gap-8 p-5 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"><Wrench className="size-4" aria-hidden="true" /> MCP request</div>
              <div className="flex flex-col gap-3"><p className="font-mono text-xs text-brand">marketmaker.measure</p><p className="text-sm leading-relaxed">Project management for small teams. Measure whether AI assistants recommend us.</p><span className="w-fit rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">sent by your agent</span></div>
            </div>
            <div className="hidden w-px bg-border lg:block" aria-hidden="true" />
            <div className="flex flex-col gap-5 border-y border-border p-5 sm:p-7 lg:border-y-0">
              <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"><Radar className="size-4" aria-hidden="true" /> Live sampling</div><span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"><span className="size-1.5 rounded-full bg-brand" aria-hidden="true" /> Running</span></div>
              <div className="flex flex-col gap-2">{engines.map((engine, index) => <div key={engine} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5"><span className="font-mono text-xs">{engine}</span><span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">{index === 0 ? '24 / 24' : index === 1 ? '24 / 24' : index === 2 ? '20 / 24' : '18 / 24'}{index < 2 && <Check className="size-3.5 text-brand" aria-label="Complete" />}</span></div>)}</div>
            </div>
            <div className="hidden w-px bg-border lg:block" aria-hidden="true" />
            <div className="flex flex-col justify-between gap-8 p-5 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"><Braces className="size-4" aria-hidden="true" /> MCP response</div>
              <div className="flex flex-col gap-3"><div className="flex items-end justify-between gap-4 border-b border-border pb-3"><span className="text-sm text-muted-foreground">Named in</span><strong className="font-mono text-2xl font-medium tabular-nums">3 of 20</strong></div><div className="flex items-center justify-between gap-4 text-xs text-muted-foreground"><span>rankings[] · sources[] · actions[]</span><Check className="size-4 text-brand" aria-label="Response ready" /></div><span className="w-fit rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">returned to your agent</span></div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">{steps.map(({ icon: Icon, title, body }, index) => <article key={title} className="group border-t border-border pt-5 transition-transform duration-200 ease-out hover:-translate-y-0.5"><div className="flex items-center gap-3"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><Icon className="size-4 text-muted-foreground" aria-hidden="true" /></div><h3 className="mt-4 text-lg font-medium">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></article>)}</div>
      </div>
    </section>
  )
}
