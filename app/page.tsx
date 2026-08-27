import { SiteHeader } from '@/components/aeokit/site-header'
import { HeroSection } from '@/components/aeokit/hero-section'
import { LiveDataDemo } from '@/components/aeokit/live-data-demo'
import { ReadsTheWeb } from '@/components/aeokit/reads-the-web'
import { AgentHandsFile } from '@/components/aeokit/agent-hands-file'
import { FinalCta } from '@/components/aeokit/final-cta'
import { SiteFooter } from '@/components/aeokit/site-footer'

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
