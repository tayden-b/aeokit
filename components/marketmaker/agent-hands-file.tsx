import { FileText, LayoutGrid, TrendingUp, Download, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LinkedInIcon, FacebookIcon, InstagramIcon, TikTokIcon, GoogleIcon } from './brand-icons'

const skills = [
  {
    icon: FileText,
    tag: '.skill',
    title: 'Competitor Engagement Miner',
    body: 'A ranked CSV of active prospects with source links and fit reasons',
    sources: [LinkedInIcon],
    meta: 'Ranked prospect CSV',
    status: 'available' as const,
    preview: (
      <div className="w-full space-y-2.5 rounded-xl border border-border bg-background p-3">
        {[80, 55, 40].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-6 rounded-full bg-muted" aria-hidden="true" />
            <span className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: LayoutGrid,
    tag: '.skill',
    title: 'Competitor Ad Miner',
    body: 'A ranked visual swipe file of competitor ads with sources and clear survival signals',
    sources: [FacebookIcon, InstagramIcon, TikTokIcon, LinkedInIcon, GoogleIcon],
    meta: 'Visual HTML swipe file · Ad-level CSV',
    status: 'available' as const,
    preview: (
      <div className="grid w-full grid-cols-3 gap-2">
        {['bg-neutral-200', 'bg-neutral-300', 'bg-neutral-100'].map((c, i) => (
          <span key={i} className={`aspect-square rounded-lg ${c}`} aria-hidden="true" />
        ))}
      </div>
    ),
  },
  {
    icon: TrendingUp,
    tag: '',
    title: 'TikTok Trends',
    body: 'Find formats and conversations while they gain speed.',
    sources: [TikTokIcon],
    meta: 'Trend brief',
    status: 'soon' as const,
    preview: (
      <div className="w-full space-y-2 rounded-xl border border-border bg-background p-3 text-xs">
        <p className="flex items-center gap-1.5 font-medium">
          <TrendingUp className="size-3.5" aria-hidden="true" />
          Formats gaining speed this week
        </p>
        {[70, 50].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-5 rounded-full bg-muted" aria-hidden="true" />
            <span className="h-1.5 rounded-full bg-muted" style={{ width: `${w}%` }} />
            <TrendingUp className="ml-auto size-3 text-emerald-600" aria-hidden="true" />
          </div>
        ))}
      </div>
    ),
  },
]

export function AgentHandsFile() {
  return (
    <section id="skills" className="border-b border-border bg-background px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your agent hands you a file.
            <br />
            <span className="text-muted-foreground">Not a paragraph.</span>
          </h2>
          <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground lg:text-right">
            Install a skill and your agent produces the finished artifact, with a source link on every row.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <div key={skill.title}>
              <div
                className={`flex aspect-[4/3] items-center justify-center rounded-2xl border border-border p-6 ${
                  skill.status === 'soon' ? 'bg-gradient-to-br from-muted to-muted/50' : 'bg-muted'
                }`}
              >
                {skill.preview}
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-medium">
                  <skill.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  {skill.title}
                </h3>
                {skill.status === 'available' ? (
                  skill.tag && (
                    <span className="shrink-0 font-mono text-xs text-brand">{skill.tag}</span>
                  )
                ) : (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-muted-foreground">
                    COMING SOON
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{skill.body}</p>
              <div className="mt-3 flex items-center gap-1.5 text-muted-foreground">
                {skill.sources.map((Icon, i) => (
                  <Icon key={i} className="size-3.5" aria-hidden="true" />
                ))}
                <span className="font-mono text-xs">· {skill.meta}</span>
              </div>
              <div className="mt-4 flex items-center gap-5 text-sm font-medium">
                {skill.status === 'available' ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      View skill
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Download className="size-3.5" aria-hidden="true" />
                      Download
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-xs tracking-wide text-muted-foreground">IN DEVELOPMENT</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Button size="lg" className="gap-2 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
            Browse all skills
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Every skill runs inside your own agent. The output lands in your workspace, not in ours.
          </p>
        </div>
      </div>
    </section>
  )
}
