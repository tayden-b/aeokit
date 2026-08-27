'use client'

import { useState } from 'react'
import { Search, BookOpen, ShieldCheck, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LinkedInIcon,
  XIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  FacebookIcon,
  GoogleIcon,
} from './brand-icons'
import { Globe } from 'lucide-react'

const items = [
  {
    key: 'agent',
    title: 'Your agent',
    body: 'Claude, ChatGPT, Cursor, or Gemini. One link connects it. No API key, no scraper, nothing to install.',
  },
  {
    key: 'tools',
    title: 'Live tools',
    body: 'Search finds people, companies, posts, ads, and pages. Read opens the profile, post, comment thread, or page. Verify confirms the current role and finds a work email and phone.',
  },
  {
    key: 'web',
    title: 'Live web',
    body: 'marketmaker.ai reads LinkedIn, X, Instagram, TikTok, YouTube, Facebook, the ad libraries, and the open web at the moment your agent asks. Every row links back to the page it came from.',
  },
]

export function ReadsTheWeb() {
  const [active, setActive] = useState('web')

  return (
    <section className="border-b border-border bg-background px-6 py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted p-10">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
              {['✳️ Claude', '⬤ ChatGPT', '▷ Cursor', '✦ Gemini'].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
              {[
                { icon: Search, label: 'Search' },
                { icon: BookOpen, label: 'Read' },
                { icon: ShieldCheck, label: 'Verify' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 rounded-full border-2 border-brand bg-card px-4 py-2 text-sm font-medium shadow-sm">
              <Layers className="size-4" aria-hidden="true" />
              marketmaker.ai live web
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-2 text-muted-foreground">
              {[LinkedInIcon, XIcon, InstagramIcon, TikTokIcon, YouTubeIcon, FacebookIcon, GoogleIcon, Globe].map(
                (Icon, i) => (
                  <Icon key={i} className="size-4" aria-hidden="true" />
                ),
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Reads the web, live.</h2>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
            marketmaker.ai gives your agent the public web at answer time: profiles, posts, comments, ads, and
            company pages. Your agent asks, marketmaker.ai opens the page, and the answer comes back with the
            link.
          </p>

          <div className="mt-8 space-y-1">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors',
                  active === item.key ? 'border-brand bg-muted' : 'border-transparent hover:bg-muted/60',
                )}
              >
                <span
                  className={cn(
                    'mt-1 size-3.5 shrink-0 rounded-sm border',
                    active === item.key ? 'border-brand bg-brand' : 'border-muted-foreground/40',
                  )}
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-medium">{item.title}</span>
                  {active === item.key && (
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{item.body}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
