import { Sparkle, Box, Feather, Bird, Zap } from 'lucide-react'

const agents = [
  { label: 'Claude', className: 'bg-orange-100 text-orange-600', icon: Sparkle },
  { label: 'ChatGPT', className: 'bg-neutral-100 text-foreground', icon: Box },
  { label: 'Gemini', className: 'bg-blue-50 text-blue-600', icon: Zap },
  { label: 'Cursor', className: 'bg-neutral-100 text-foreground', icon: Box },
  { label: 'Perplexity', className: 'bg-rose-50 text-rose-600', icon: Bird },
  { label: 'Copilot', className: 'bg-neutral-100 text-foreground', icon: Feather },
  { label: 'MCP', className: 'bg-blue-600 text-white', icon: Zap },
]

export function UseItAnywhere() {
  return (
    <section className="border-b border-border bg-background px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Use it anywhere
              <br />
              your agents are.
            </h2>
          </div>
          <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
            Connect marketmaker.ai in a few clicks and your AI apps can read LinkedIn, X, company data, and the
            web as you work. So your agent can research the people you&apos;re about to talk to, from the chat
            you already have open.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-2xl bg-muted p-10">
          {agents.map(({ label, className, icon: Icon }) => (
            <div
              key={label}
              title={label}
              className={`flex size-16 items-center justify-center rounded-2xl shadow-sm ${className}`}
            >
              <Icon className="size-6" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
