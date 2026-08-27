'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LinkedInIcon,
  XIcon,
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
  MarketMakerLogo,
} from './brand-icons'

const sourceLinks = [
  { label: 'LinkedIn', icon: LinkedInIcon },
  { label: 'X', icon: XIcon },
  { label: 'TikTok', icon: TikTokIcon },
  { label: 'Instagram', icon: InstagramIcon },
  { label: 'YouTube', icon: YouTubeIcon },
  { label: 'Facebook', icon: FacebookIcon },
]

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Report', href: '#report' },
  { label: 'Live probe', href: '#live-probe' },
]

export function SiteHeader() {
  const [sourcesOpen, setSourcesOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-10">
      <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
        <MarketMakerLogo className="size-7 text-primary" />
        marketmaker.ai
      </Link>

      <nav aria-label="Primary" className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
        <Link href="#skills" className="transition-colors hover:text-foreground">
          Skills
        </Link>
        <div
          className="relative"
          onMouseEnter={() => setSourcesOpen(true)}
          onMouseLeave={() => setSourcesOpen(false)}
        >
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
            aria-expanded={sourcesOpen}
            onClick={() => setSourcesOpen((v) => !v)}
          >
            Sources
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
          {sourcesOpen && (
            <div className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3">
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-popover p-2 shadow-lg">
                {sourceLinks.map(({ label, icon: Icon }) => (
                  <Link
                    key={label}
                    href="#"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        {navLinks.map((link) => (
          <Link key={link.label} href={link.href} className="transition-colors hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="#"
          className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
        >
          Sign in
        </Link>
        <Button
          className="rounded-full px-4"
          render={<Link href="#get-started">Connect your agent</Link>}
        />
      </div>
    </header>
  )
}
