import Link from 'next/link'
import { AEOKitLogo } from './brand-icons'

const columns = [
  { title: 'Tool', links: ['MCP setup', 'How it works', 'Live engines', 'Output'] },
  { title: 'Developers', links: ['Documentation', 'API reference', 'Changelog', 'Status'] },
  { title: 'Company', links: ['About', 'Security', 'Contact', 'Terms'] },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2"><Link href="/" className="flex items-center gap-2"><AEOKitLogo className="size-7 text-primary" /><span className="font-mono text-sm font-medium tracking-tight text-foreground">aeokit</span></Link><p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">An MCP-first tool that gives AI agents live, repeatable measurements of what answer engines recommend.</p><p className="mt-4 font-mono text-[11px] text-muted-foreground">NOT ANOTHER PLATFORM. ONE MORE CAPABILITY.</p></div>
          {columns.map((col) => <div key={col.title}><h3 className="font-mono text-xs tracking-widest text-muted-foreground">{col.title.toUpperCase()}</h3><ul className="mt-4 flex flex-col gap-3">{col.links.map((link) => <li key={link}><Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</Link></li>)}</ul></div>)}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row"><p className="text-xs text-muted-foreground">© {new Date().getFullYear()} aeokit.ai. All rights reserved.</p><div className="flex items-center gap-6"><Link href="#" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link><Link href="#" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link><Link href="#" className="text-xs text-muted-foreground hover:text-foreground">Security</Link></div></div>
      </div>
    </footer>
  )
}
