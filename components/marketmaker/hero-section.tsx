'use client'

import { ArrowUpRight, ChevronDown, Layers, Plus, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LinkedInIcon,
  XIcon,
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  GoogleIcon,
} from './brand-icons'
import { Users2, Building2, Globe, Mail, Phone, Sparkle } from 'lucide-react'

const sources = [
  { label: 'LinkedIn', icon: LinkedInIcon },
  { label: 'X', icon: XIcon },
  { label: 'TikTok', icon: TikTokIcon },
  { label: 'Instagram', icon: InstagramIcon },
  { label: 'YouTube', icon: YouTubeIcon },
  { label: 'Facebook', icon: FacebookIcon },
  { label: 'Meta Ads', icon: FacebookIcon },
  { label: 'Google Ads', icon: GoogleIcon },
  { label: 'People search', icon: Users2 },
  { label: 'Company search', icon: Building2 },
  { label: 'Live web', icon: Globe },
  { label: 'Work emails', icon: Mail },
  { label: 'Phone numbers', icon: Phone },
]

export function HeroSection() {
  return (
    <section aria-label="Hero" className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-10 text-center sm:pt-20">
        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Run your
          <br className="hidden sm:block" /> <span className="text-brand">prospecting</span> on
          autopilot
          <br />
          with <span className="whitespace-nowrap">✳️ Claude</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] text-muted-foreground">
          No seats. No contracts. Pay as you go, and only for results.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="rounded-full px-6">
            Claim your free $1
          </Button>
          <Button size="lg" variant="ghost" className="gap-1 rounded-full px-4 text-foreground">
            See it work
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          <span className="font-medium text-foreground">$0.05</span> / verified email
        </p>
      </div>

      {/* chat mock */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-14">
        <div className="rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Layers className="size-4" aria-hidden="true" />
              marketmaker.ai
              <Plus className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <Sparkle className="size-4 text-orange-500" aria-hidden="true" />
              ChatGPT
              <span className="ml-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Codex
              </span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              ChatGPT Codex
              <ChevronDown className="size-3" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3 px-5 py-5">
            <div className="ml-auto w-fit max-w-[80%] rounded-2xl bg-muted px-4 py-2 text-sm">
              prep me for tomorrow&apos;s meet
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-background p-4 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Best opener</span>
                <span className="inline-flex items-center gap-1 text-brand">
                  Source
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </span>
              </div>
              <p className="text-muted-foreground">CargoLoop&apos;s newly announced Vienna lane</p>
              <p className="text-xs text-muted-foreground">3 talking points with every supporting link included</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-border px-5 py-3.5">
            <span className="flex-1 text-sm text-muted-foreground">Reply...</span>
            <button type="button" className="text-muted-foreground">
              <Plus className="size-4" aria-hidden="true" />
            </button>
            <span className="text-xs text-muted-foreground">GPT-5.6</span>
            <button
              type="button"
              aria-label="Send"
              className="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-white"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* live sources ticker */}
      <div className="border-t border-border bg-foreground py-10">
        <p className="text-center font-mono text-[11px] tracking-widest text-background/50">
          THE ENTIRE COMMERCIAL WEB IN ONE AI INTEGRATION
        </p>
        <ul
          aria-label="Live sources"
          className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 text-sm text-background/80"
        >
          {sources.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
