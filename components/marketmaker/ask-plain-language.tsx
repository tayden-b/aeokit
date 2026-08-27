import { Paperclip, SlidersHorizontal, ArrowUp, FileSpreadsheet } from 'lucide-react'

export function AskPlainLanguage() {
  return (
    <section className="bg-brand px-6 py-24 text-brand-foreground lg:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <h2 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Ask in
          <br />
          plain
          <br />
          English.
        </h2>

        <div className="rounded-2xl bg-background p-6 text-foreground shadow-xl">
          <p className="text-lg leading-snug">
            Find 20 heads of operations at European logistics companies who posted about hiring this month, with
            a work email for each.
            <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-foreground align-middle" />
          </p>

          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Lead list
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Paperclip className="size-4" aria-hidden="true" />
              <SlidersHorizontal className="size-4" aria-hidden="true" />
            </div>
            <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
              <ArrowUp className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
