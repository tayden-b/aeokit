import { Button } from '@/components/ui/button'
import { ArrowRight, Wrench } from 'lucide-react'

export function FinalCta() {
  return (
    <section id="get-started" className="border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-brand text-brand-foreground"><Wrench className="size-5" aria-hidden="true" /></span>
        <h2 className="mt-6 text-balance text-4xl font-medium tracking-tight text-foreground md:text-5xl">Give your agent live market evidence.</h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">Add aeokit as an MCP tool and ask your first question in the agent you already use. Nothing else to log into or learn.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="h-12 rounded-full px-7 text-base" render={<a href="#add-to-agent">Add to your agent <ArrowRight data-icon="inline-end" /></a>} />
          <Button size="lg" variant="outline" className="h-12 rounded-full px-7 text-base" render={<a href="#">Read setup docs</a>} />
        </div>
        <p className="mt-5 font-mono text-xs tracking-wide text-muted-foreground">MCP-first · API available · first probe free</p>
      </div>
    </section>
  )
}
