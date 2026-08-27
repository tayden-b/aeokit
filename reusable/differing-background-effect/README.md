# Differing Background Effect

Copy this entire folder into a React or Next.js project.

## Dependency

Install `@paper-design/shaders-react` with the destination project’s package manager.

## Usage

```tsx
import { DifferingBackgroundEffect } from './differing-background-effect'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      <DifferingBackgroundEffect className="-z-10 hidden lg:block" />
      <div className="relative">Your readable content</div>
    </section>
  )
}
```

The component is non-interactive and hidden from assistive technology. Adjust `foregroundColor`, `backgroundColor`, and `speed` through props; keep foreground content in a separate relative layer. The destination project needs Tailwind CSS and a `--background` color token, or the final gradient class can be replaced with an equivalent CSS mask.
