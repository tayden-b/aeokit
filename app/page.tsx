import { SiteHeader } from '@/components/marketmaker/site-header'
import { HeroSection } from '@/components/marketmaker/hero-section'
import { LiveDataDemo } from '@/components/marketmaker/live-data-demo'
import { ReadsTheWeb } from '@/components/marketmaker/reads-the-web'
import { AgentHandsFile } from '@/components/marketmaker/agent-hands-file'
import { FinalCta } from '@/components/marketmaker/final-cta'
import { SiteFooter } from '@/components/marketmaker/site-footer'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <LiveDataDemo />
        <ReadsTheWeb />
        <AgentHandsFile />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
