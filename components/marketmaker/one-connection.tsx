'use client'

import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LinkedInIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
  FacebookIcon,
  GoogleIcon,
} from './brand-icons'
import { Globe, FileSpreadsheet } from 'lucide-react'

const teams = [
  {
    name: 'Sales teams',
    body: "Prospect lists with complete public profiles, account briefs before every call, and inbound leads scored while they're still warm.",
    prompt: 'Build a list of 20 heads of...',
  },
  {
    name: 'Marketing teams',
    body: 'Competitor ad libraries, trend briefs, and audience research pulled straight from the platforms your buyers use.',
    prompt: 'Show me our top 3 competitors...',
  },
  {
    name: 'Partnerships',
    body: 'Map the right contact at every target account, with a warm-intro angle sourced from what they posted this week.',
    prompt: 'Find partnership leads at...',
  },
  {
    name: 'Recruiting',
    body: 'Sourced candidate longlists with verified current roles, so outreach never lands on someone who already left.',
    prompt: 'Find senior engineers open to...',
  },
  {
    name: 'Founders',
    body: 'A fast way to check the market, the competition, and the first 50 people to talk to, without hiring a researcher.',
    prompt: 'Who are the buyers for...',
  },
]

export function OneConnection() {
  const [active, setActive] = useState(0)
  const team = teams[active]

  return (
    <section id="who-its-for" className="border-b border-border bg-background px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          One connection, every desk.
          <br />
          <span className="text-muted-foreground">Pick a team to see its ask run.</span>
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="overflow-hidden rounded-2xl border border-border bg-neutral-800 p-6">
            <div className="flex flex-wrap gap-3 opacity-70">
              {[LinkedInIcon, InstagramIcon, TikTokIcon, XIcon, YouTubeIcon, FacebookIcon, Globe, FileSpreadsheet].map(
                (Icon, i) => (
                  <span
                    key={i}
                    className="flex size-9 items-center justify-center rounded-lg bg-neutral-700 text-neutral-300"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                ),
              )}
            </div>
            <div className="mt-24 flex items-center gap-2 rounded-xl bg-neutral-700/60 px-4 py-3 text-sm text-neutral-200">
              <Zap className="size-4 text-brand" aria-hidden="true" />
              {team.prompt}
              <span className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-600">
                <ArrowRight className="size-3.5 -rotate-45" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div>
            <ul className="space-y-1">
              {teams.map((t, i) => (
                <li key={t.name}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-2xl font-medium transition-colors sm:text-3xl',
                      i === active ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground',
                    )}
                  >
                    {i === active && <ArrowRight className="size-5 shrink-0" aria-hidden="true" />}
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-pretty text-[15px] leading-relaxed text-muted-foreground">{team.body}</p>

            <Button
              size="lg"
              className="mt-6 gap-2 rounded-full px-6"
              render={
                <a href="#get-started">
                  Connect your agent
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
