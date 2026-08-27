'use client'

import { Dithering } from '@paper-design/shaders-react'

type DifferingBackgroundEffectProps = {
  className?: string
  backgroundColor?: string
  foregroundColor?: string
  speed?: number
}

/**
 * A reusable, non-interactive shader field inspired by the differing-effect
 * template. Place it inside a relatively positioned, overflow-hidden surface.
 */
export function DifferingBackgroundEffect({
  className = '',
  backgroundColor = 'hsl(0, 0%, 100%)',
  foregroundColor = 'hsl(232, 79%, 53%)',
  speed = 0.16,
}: DifferingBackgroundEffectProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <Dithering
        className="size-full"
        colorBack={backgroundColor}
        colorFront={foregroundColor}
        shape="warp"
        type="4x4"
        pxSize={3}
        scale={0.72}
        speed={speed}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,transparent_42%)]" />
    </div>
  )
}
