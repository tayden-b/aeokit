import { AlertTriangle, BarChart3, Check, FileText, Globe2 } from 'lucide-react'

const shares = [
  { name: 'Asana', count: '12 of 20', width: 60 },
  { name: 'Trello', count: '8 of 20', width: 40 },
  { name: 'Flowlane', count: '3 of 20', width: 15 },
  { name: 'Other', count: '5 of 20', width: 25 },
]

export function AgentHandsFile() {
  return (
    <section id="report" className="border-b border-border bg-background px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-medium tracking-widest text-brand">THE OUTPUT</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">What you get back.</h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">Not a generic SEO score. A measured view of how answer engines see your market right now, with the evidence behind every claim.</p>
          <div className="mt-8 flex flex-col gap-4">
            {[
              [BarChart3, 'Where you appear', 'How often engines name you, by engine and by question, always as a count, never a score.'],
              [Globe2, 'Competitor map', 'Who is recommended instead, and where they beat you.'],
              [FileText, 'Answer language', 'The exact positioning, strengths, and objections AI repeats.'],
              [AlertTriangle, 'Source gap', 'The sites shaping answers, and where you are absent.'],
            ].map(([Icon, title, body]) => <div key={String(title)} className="flex gap-3"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Icon className="size-4 text-brand" /></span><div><h3 className="text-sm font-medium">{title as string}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body as string}</p></div></div>)}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
          <div className="flex items-center justify-between border-b border-border px-5 py-4"><span className="font-medium">Flowlane · AI visibility report</span><span className="font-mono text-xs text-muted-foreground">LIVE · 20 ANSWERS</span></div>
          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-brand/20 bg-brand/10 p-4"><p className="font-mono text-xs text-brand">NAMED IN</p><p className="mt-2 text-2xl font-semibold">3 of 20 answers</p></div><div className="rounded-xl bg-muted p-4"><p className="font-mono text-xs text-muted-foreground">NAMED MOST OFTEN</p><p className="mt-2 text-2xl font-semibold">Asana</p><p className="mt-1 text-xs text-muted-foreground">in 12 of 20 answers</p></div></div>
            <div><p className="text-sm font-medium">Share of recommendations</p><div className="mt-3 flex flex-col gap-3">{shares.map(({ name, count, width }) => <div key={name} className="grid grid-cols-[70px_1fr_60px] items-center gap-3 text-xs"><span>{name}</span><span className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-brand" style={{ width: `${width}%` }} /></span><span className="text-right font-mono text-muted-foreground">{count}</span></div>)}</div></div>
            <div className="rounded-xl border border-border p-4"><p className="text-sm font-medium">Next best move</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Publish a direct “Flowlane vs Asana for teams under 20” comparison. Three of the five most influential sources lack a small-team alternative.</p><p className="mt-3 flex items-center gap-1 text-xs font-medium text-brand"><Check className="size-3" /> backed by 14 observed answers</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}
