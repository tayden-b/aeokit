import { ArrowRight, Bot, Radar, SearchCheck } from 'lucide-react'

const steps = [
  { icon: Bot, title: 'You describe your product', body: 'One sentence — what you sell and who buys it. Your agent passes it along. No setup, no tracking code, no site changes.' },
  { icon: Radar, title: 'We ask the engines, live', body: 'marketmaker writes the questions your buyers would actually ask, then asks the real engines many times each — because AI answers change run to run, and one answer is noise.' },
  { icon: SearchCheck, title: 'You get something to act on', body: 'Where you rank on each engine, who wins instead, the exact words the engines use about you, and the websites shaping those answers — which is where your next content goes.' },
]

export function ReadsTheWeb() {
  return (
    <section className="border-b border-border bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How a live probe works.</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <article key={title} className="group">
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-muted transition-colors group-hover:bg-secondary">
                <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card"><Icon className="size-5 text-brand" /></span>
                  {index < 2 && <ArrowRight className="size-4" />}
                  <span>{index === 0 ? 'your agent' : index === 1 ? 'live probe' : 'AI engines'}</span>
                </div>
              </div>
              <h3 className="mt-5 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center font-mono text-xs text-muted-foreground">your agent → live probe → ChatGPT / Gemini / Claude / Perplexity</p>
      </div>
    </section>
  )
}
