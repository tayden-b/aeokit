import { SiteHeader } from '@/components/marketmaker/site-header'
import { HeroSection } from '@/components/marketmaker/hero-section'
import { LiveDataDemo } from '@/components/marketmaker/live-data-demo'
import { ReadsTheWeb } from '@/components/marketmaker/reads-the-web'
import { PromptToProspect } from '@/components/marketmaker/prompt-to-prospect'
import { UseItAnywhere } from '@/components/marketmaker/use-it-anywhere'
import { AskPlainLanguage } from '@/components/marketmaker/ask-plain-language'
import { ResearcherMoves } from '@/components/marketmaker/researcher-moves'
import { AgentHandsFile } from '@/components/marketmaker/agent-hands-file'
import { OneConnection } from '@/components/marketmaker/one-connection'
import { KeyNumbers } from '@/components/marketmaker/key-numbers'
import { FaqSection } from '@/components/marketmaker/faq-section'
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
        <PromptToProspect />
        <UseItAnywhere />
        <AskPlainLanguage />
        <ResearcherMoves />
        <AgentHandsFile />
        <OneConnection />
        <KeyNumbers />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
