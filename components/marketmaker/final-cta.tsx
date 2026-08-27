import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl font-medium tracking-tight text-foreground text-balance md:text-5xl">
          See what AI recommends — live
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Connect marketmaker.ai to your agent and run a measured probe across the answer engines your buyers use.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="h-12 gap-2 rounded-full bg-brand px-7 text-base text-brand-foreground hover:bg-brand/90">
            Get started free
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-border px-7 text-base text-foreground hover:bg-muted"
          >
            Read the docs
          </Button>
        </div>
        <p className="mt-5 font-mono text-xs tracking-wide text-muted-foreground">
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  )
}
