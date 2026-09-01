import { Bot, Check, FileSearch, Radar, SearchCheck } from 'lucide-react'

const steps = [
  { icon: Bot, title: 'Ask from your agent', body: 'Describe what you sell and who buys it. Your agent passes that context to aeokit. No dashboard, tracking code, or site changes.' },
  { icon: Radar, title: 'We ask the engines live', body: 'aeokit writes the questions your buyers would actually ask, then samples the real engines repeatedly because one answer is noise.' },
  { icon: SearchCheck, title: 'Your agent gets the evidence', body: 'Rankings, competitors, exact answer language, and the websites shaping those answers return to the conversation where you started.' },
]

const engines = ['ChatGPT', 'Gemini']

export function ReadsTheWeb() {
  return (
    <section id="how-it-works" className="border-b border-border bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">How a live probe works.</h2>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-muted p-3 sm:p-5">
          <div className="grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[1fr_auto_1.15fr_auto_1fr] lg:items-stretch">
            <div className="flex flex-col justify-between gap-8 p-5 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Bot className="size-4" aria-hidden="true" /> Your agent
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm leading-relaxed">Project management for small teams. Do AI assistants recommend us?</p>
                <span className="w-fit rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">1 product brief</span>
              </div>
            </div>

            <div className="hidden w-px bg-border lg:block" aria-hidden="true" />
            <div className="flex flex-col gap-5 border-y border-border p-5 sm:p-7 lg:border-y-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <Radar className="size-4" aria-hidden="true" /> Live sampling
                </div>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" /> Running
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {engines.map((engine, index) => (
                  <div key={engine} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                    <span className="font-mono text-xs">{engine}</span>
                    <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                      {index === 0 ? '8 / 8' : '8 / 8'}
                      {index < 2 && <Check className="size-3.5 text-brand" aria-label="Complete" />}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden w-px bg-border lg:block" aria-hidden="true" />
            <div className="flex flex-col justify-between gap-8 p-5 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <FileSearch className="size-4" aria-hidden="true" /> Evidence report
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">Named in</span>
                  <strong className="font-mono text-2xl font-medium tabular-nums">3 of 16</strong>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                  <span>Rankings · citations · competitors</span>
                  <Check className="size-4 text-brand" aria-label="Report ready" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <article key={title} className="group border-t border-border pt-5 transition-transform duration-200 ease-out hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
