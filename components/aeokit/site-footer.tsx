import Link from 'next/link'
import { AEOKitLogo } from './brand-icons'

const columns = [
  {
    title: 'Tool',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Setup', href: '/setup' },
      { label: 'Documentation', href: '/docs' },
      { label: 'API reference', href: '/api' },
    ],
  },
  {
    title: 'Source',
    links: [
      { label: 'GitHub', href: 'https://github.com/tayden-b/aeokit' },
      { label: 'PyPI package', href: 'https://pypi.org/project/aeokit-mcp/' },
      { label: 'Report an issue', href: 'https://github.com/tayden-b/aeokit/issues' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <AEOKitLogo className="size-7 text-primary" />
              <span className="font-mono text-sm font-medium tracking-tight text-foreground">aeokit</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Live, repeatable measurement of what AI answer engines recommend — delivered to the
              agent you already use.
            </p>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">
              MEASURED, NOT GUESSED.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs tracking-widest text-muted-foreground">
                {col.title.toUpperCase()}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} aeokit</p>
          <p className="text-xs text-muted-foreground">
            Built by{' '}
            <a
              href="https://tayden.dev"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Tayden Barretto
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
