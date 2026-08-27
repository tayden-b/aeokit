const stats = [
  { value: '190M+', label: 'Companies indexed live from the open web' },
  { value: '<400ms', label: 'Median latency per agent tool call' },
  { value: '99.95%', label: 'API uptime over the last 12 months' },
  { value: '0', label: 'Seats. Pay only for results you use' },
]

export function KeyNumbers() {
  return (
    <section className="border-t border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 border-l border-border pl-5 first:border-l-0 first:pl-0 md:first:border-l md:first:pl-5">
              <span className="font-mono text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                {stat.value}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
