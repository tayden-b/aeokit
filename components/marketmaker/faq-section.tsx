import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'What exactly is marketmaker.ai?',
    a: "marketmaker.ai is an AI agent that reads the live commercial web — company sites, filings, job boards, news, and social signal — and turns a plain-language brief into a structured, sourced prospect list your team can act on immediately.",
  },
  {
    q: 'Do I need to sign a contract or buy seats?',
    a: 'No. There are no seats and no annual contracts. You pay as you go, based on the results your agent actually returns, so cost scales with value instead of headcount.',
  },
  {
    q: 'How is this different from a static B2B database?',
    a: 'Static databases go stale the moment they are scraped. marketmaker.ai reads sources live at query time, so headcount, funding, hiring, and technology signals reflect what is true right now, not what was true last quarter.',
  },
  {
    q: 'Can I connect it to the tools my team already uses?',
    a: 'Yes. marketmaker.ai plugs into Slack, your CRM, and any MCP-compatible agent framework through a single API key, so sales, marketing, and RevOps can all pull from the same live source of truth.',
  },
  {
    q: 'What does my agent hand back?',
    a: 'A structured, sourced deliverable — a ranked account list, an enriched CSV, or a CRM-ready payload — with citations back to the original source for every data point, so nothing is a black box.',
  },
  {
    q: 'Is my data and usage secure?',
    a: 'Yes. All traffic is encrypted in transit, API keys are scoped per workspace, and we never resell or share your query history. SOC 2 documentation is available on request.',
  },
]

export function FaqSection() {
  return (
    <section className="border-t border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <p className="font-mono text-xs tracking-widest text-brand">FAQ</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground text-balance md:text-4xl">
            Questions, answered
          </h2>
        </div>
        <Accordion openMultiple={false} className="border-t border-border">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q} className="border-border">
              <AccordionTrigger className="py-5 text-base font-medium text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
