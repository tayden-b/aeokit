import { Link2, Search, FileSpreadsheet, Check, ArrowRight, Sparkle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Layers } from 'lucide-react'

const steps = [
  {
    icon: Link2,
    index: '01',
    title: 'Connect your agent',
    body: 'Open one link and approve the connection.',
    preview: (
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
          <Layers className="size-4" aria-hidden="true" />
        </span>
        <Link2 className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
          <Sparkle className="size-4 text-orange-500" aria-hidden="true" />
        </span>
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-xs font-semibold">
          GPT
        </span>
      </div>
    ),
  },
  {
    icon: Search,
    index: '02',
    title: 'Ask in plain language',
    body: 'Your agent searches current public data for you.',
    preview: (
      <div className="w-full rounded-xl border border-border bg-background p-3 text-sm shadow-sm">
        <p>Find 20 heads of operations at European logistics companies.</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" aria-hidden="true" />
          Searching live sources
          <span className="ml-auto size-1.5 animate-pulse rounded-full bg-brand" />
        </p>
      </div>
    ),
  },
  {
    icon: FileSpreadsheet,
    index: '03',
    title: 'Use the sourced result',
    body: 'Open the proof or export the finished list.',
    preview: (
      <div className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-sm shadow-sm">
        <span className="flex items-center gap-2">
          <FileSpreadsheet className="size-4 text-emerald-600" aria-hidden="true" />
          prospects.csv
        </span>
        <Check className="size-4 text-emerald-600" aria-hidden="true" />
      </div>
    ),
  },
]

export function PromptToProspect() {
  return (
    <section className="border-b border-border bg-background px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">From prompt to prospect list.</h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title}>
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-muted p-6">
                {step.preview}
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-medium">
                  <step.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  {step.title}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">{step.index}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            className="gap-2 rounded-full px-6"
            render={
              <Link href="#get-started">
                Connect your agent
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
        </div>
      </div>
    </section>
  )
}
