import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AEOKitLogo } from './brand-icons'

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'MCP setup', href: '#add-to-agent' },
  { label: 'Output', href: '#report' },
  { label: 'API docs', href: '#' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-10">
      <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"><AEOKitLogo className="size-7 text-primary" />aeokit.ai</Link>
      <nav aria-label="Primary" className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">{navLinks.map((link) => <Link key={link.label} href={link.href} className="transition-colors hover:text-foreground">{link.label}</Link>)}</nav>
      <Button className="rounded-full px-4" render={<Link href="#add-to-agent">Add to your agent</Link>} />
    </header>
  )
}
