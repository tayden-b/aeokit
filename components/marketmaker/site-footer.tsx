import Link from 'next/link'

const columns = [
  {
    title: 'Product',
    links: ['Overview', 'Live data', 'Integrations', 'API docs', 'Changelog'],
  },
  {
    title: 'Solutions',
    links: ['Sales', 'Marketing', 'RevOps', 'Recruiting', 'Investors'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Security', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Status', 'Community', 'Support', 'Terms'],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded bg-foreground font-mono text-xs font-bold text-background">
                M
              </span>
              <span className="font-mono text-sm font-medium tracking-tight text-foreground">
                marketmaker.ai
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Live access to the commercial web for your AI agent. No seats, no
              contracts, pay for results.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs tracking-widest text-muted-foreground">
                {col.title.toUpperCase()}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} marketmaker.ai. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
