import { Table2, ShieldCheck, MessagesSquare, BookOpen, FileText, UserSearch } from 'lucide-react'
import { LinkedInIcon, XIcon } from './brand-icons'

const cards = [
  {
    icon: Table2,
    title: 'Find',
    body: 'Describe who you want. Get a live list of matching people and companies, or fill the gaps in a list you already have.',
    tags: 'people_search · companies_search',
    preview: (
      <div className="w-full rounded-xl border border-border bg-background p-3 text-xs shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 font-medium">
          <Table2 className="size-3.5" aria-hidden="true" />
          Heads of ops at European 3PLs
        </p>
        <div className="grid grid-cols-[16px_1fr_1fr_40px] gap-2 border-b border-border pb-1.5 text-muted-foreground">
          <span>ID</span>
          <span>PERSON</span>
          <span>COMPANY</span>
          <span>FIT</span>
        </div>
        {[
          ['1', 'Anna Keller', 'Freightline'],
          ['2', 'Matteo Rossi', 'Lastmile'],
          ['3', 'Sofie Brandt', 'Cargoloop'],
        ].map(([id, person, company]) => (
          <div key={id} className="grid grid-cols-[16px_1fr_1fr_40px] items-center gap-2 py-1.5">
            <span className="text-muted-foreground">{id}</span>
            <span className="flex items-center gap-1 text-brand">
              <LinkedInIcon className="size-3" aria-hidden="true" />
              {person}
            </span>
            <span className="text-muted-foreground">{company}</span>
            <span className="h-1.5 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    title: 'Verify',
    body: 'Before a name reaches your list, the real profile is opened and the current role, employer, and location confirmed.',
    tags: 'social_profile · web_read',
    preview: (
      <div className="w-full rounded-xl border border-border bg-background p-3 text-xs shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 font-medium">
          <LinkedInIcon className="size-3.5" aria-hidden="true" />
          linkedin.com/in/annakeller
        </p>
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
            AK
          </span>
          <span className="font-medium">Anna Keller</span>
        </div>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          {['Current role', 'Employer', 'Location'].map((label) => (
            <li key={label} className="flex items-center gap-1.5 text-emerald-600">
              <ShieldCheck className="size-3" aria-hidden="true" />
              <span className="text-foreground">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: MessagesSquare,
    title: 'Listen',
    body: 'Search posts, comments, and reactions across six networks to hear what buyers say and who is engaging. This week, not last year.',
    tags: 'social_search · social_posts · social_comments',
    preview: (
      <div className="w-full rounded-xl border border-border bg-background p-3 text-xs shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 font-medium">
          <MessagesSquare className="size-3.5" aria-hidden="true" />
          Who&apos;s talking about AI pricing
        </p>
        {[
          { icon: LinkedInIcon, meta: '84 comments' },
          { icon: XIcon, meta: '1.2k reactions' },
        ].map(({ icon: Icon, meta }, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5">
            <span className="size-2 rounded-full bg-orange-400" aria-hidden="true" />
            <Icon className="size-3" aria-hidden="true" />
            <span className="h-1.5 flex-1 rounded-full bg-muted" />
            <span className="shrink-0 text-muted-foreground">{meta}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BookOpen,
    title: 'Read',
    body: 'Open any public page, post, or video and get the full text back: profiles, articles, threads, and transcripts, ten URLs at a time.',
    tags: 'web_read · social_post · social_transcript',
    preview: (
      <div className="w-full rounded-xl border border-border bg-background p-3 text-xs shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 font-medium">
          <BookOpen className="size-3.5" aria-hidden="true" />
          freightline.com/blog/carrier-ops-2026
        </p>
        <div className="space-y-1.5">
          <span className="block h-1.5 w-full rounded-full bg-muted" />
          <span className="block h-1.5 w-4/5 rounded-full bg-muted" />
          <span className="block h-1.5 w-3/5 rounded-full bg-muted" />
        </div>
        <div className="mt-2 flex items-center justify-between text-muted-foreground">
          <span>FULL TEXT</span>
          <span>1,240 words</span>
        </div>
      </div>
    ),
  },
  {
    icon: FileText,
    title: 'Brief',
    body: 'Hand over a person, an account, or a market and get a cited brief: what they care about now, what changed, and what to open with.',
    tags: 'web_search · social_posts · companies_search',
    preview: (
      <div className="w-full rounded-xl border border-border bg-background p-3 text-xs shadow-sm">
        <p className="mb-2 rounded-lg bg-muted px-2.5 py-1.5">Prep me for tomorrow&apos;s call with Klara Berg.</p>
        <p className="mb-1.5 flex items-center gap-1.5 font-medium">
          <FileText className="size-3.5" aria-hidden="true" />
          Brief · Klara Berg
        </p>
        <div className="space-y-1.5">
          <span className="block h-1.5 w-full rounded-full bg-muted" />
          <span className="block h-1.5 w-4/5 rounded-full bg-muted" />
        </div>
        <p className="mt-2 text-brand">18 sources</p>
      </div>
    ),
  },
  {
    icon: UserSearch,
    title: 'Reach',
    badge: 'TEAM+',
    body: 'For a person you have already chosen, find a verified work email or phone number. Only when you ask, only for the rows you pick.',
    tags: 'find_contact_detail',
    preview: (
      <div className="w-full rounded-xl border border-border bg-background p-3 text-xs shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 font-medium">
          <UserSearch className="size-3.5" aria-hidden="true" />
          Anna Keller · Freightline
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>a.keller@freightline.com</span>
            <span className="text-emerald-600">Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span>+49 40 •••• ••41</span>
            <span className="text-emerald-600">Direct</span>
          </div>
          <span className="block h-1.5 w-2/3 rounded-full bg-muted" />
        </div>
      </div>
    ),
  },
]

export function ResearcherMoves() {
  return (
    <section className="border-b border-border bg-background px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Every move a good researcher makes.
          <br />
          <span className="text-muted-foreground">Live, and sourced.</span>
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title}>
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-muted p-6">
                {card.preview}
              </div>
              <h3 className="mt-5 flex items-center gap-2 text-lg font-medium">
                <card.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                {card.title}
                {card.badge && (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-brand">
                    {card.badge}
                  </span>
                )}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              <p className="mt-3 font-mono text-xs text-muted-foreground/70">{card.tags}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
