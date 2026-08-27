'use client'

import { useState } from 'react'
import { Check, Copy, Sparkle, Building2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { LinkedInIcon } from './brand-icons'

const QUERY = 'find me heads of ops at european logistics companies, with linkedin + why they fit'

const offReplyPeople = [
  { name: 'Anna Keller', role: 'Operations Lead, Freightline (as of 2023)' },
  { name: 'Matteo Rossi', role: 'Director of Ops at Lastmile (may have moved)' },
  { name: 'Sofie Brandt', role: 'Logistics manager, possibly at Cargoloop' },
]

const liveSteps = [
  { label: 'Searched current people data', result: '36 matches' },
  { label: 'Verified roles and profiles', result: '20 verified' },
  { label: 'Checked company sites and recent news', result: '41 sources' },
]

const onReplyPeople = [
  { name: 'Anna Keller', role: 'Head of Operations · Freightline' },
  { name: 'Matteo Rossi', role: 'VP Operations · Lastmile' },
  { name: 'Sofie Brandt', role: 'Head of Operations · Cargoloop' },
]

export function LiveDataDemo() {
  const [live, setLive] = useState(false)

  return (
    <section
      aria-label="The same agent, with live data switched on."
      className="border-b border-border bg-background px-6 py-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          The same agent, with live data switched on.
        </h2>

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-wide text-muted-foreground">LIVE DATA</span>
            <Switch
              checked={live}
              onCheckedChange={setLive}
              aria-label="LIVE DATA"
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            {live ? 'Live data is on. Every row links to its source.' : 'Live data is off. Your agent is answering from memory.'}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card text-left shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4 text-sm font-medium">
            {live && (
              <>
                <Building2 className="size-4" aria-hidden="true" />
                marketmaker.ai
                <Plus />
              </>
            )}
            <Sparkle className="size-4 text-orange-500" aria-hidden="true" />
            Claude
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="ml-auto w-fit max-w-[90%] rounded-2xl bg-muted px-4 py-2.5 text-sm">{QUERY}</div>

            {!live ? (
              <div className="space-y-4 text-sm">
                <p className="text-foreground">
                  I don&apos;t have live access to LinkedIn or company sites, but based on what I know, a few
                  people who may fit:
                </p>
                <ul className="divide-y divide-border">
                  {offReplyPeople.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-muted-foreground">{p.role}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] tracking-wide text-muted-foreground">
                        UNVERIFIED
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground">
                  I can&apos;t confirm current roles or provide profile links. You may want to check LinkedIn
                  directly.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <p className="text-foreground">Searching company data first, then checking each person&apos;s current role on LinkedIn.</p>
                <div className="space-y-2">
                  {liveSteps.map((step) => (
                    <div
                      key={step.label}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-2.5"
                    >
                      <span className="text-foreground">{step.label}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                        <Check className="size-3.5" aria-hidden="true" />
                        {step.result}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="font-medium text-foreground">Here&apos;s the sourced result:</p>
                <ul className="divide-y divide-border">
                  {onReplyPeople.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-muted-foreground">{p.role}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand">
                        <LinkedInIcon className="size-4" aria-hidden="true" />
                        Profile
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground">17 more prospects with fit reasons and source links</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Button size="lg" variant="secondary" className="gap-2 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
            <Copy className="size-4" aria-hidden="true" />
            Try it
          </Button>
          <p className="text-sm text-muted-foreground">Copies the ask above so you can run it in your own agent.</p>
        </div>
      </div>
    </section>
  )
}

function Plus() {
  return <span className="mx-0.5 text-muted-foreground">+</span>
}
