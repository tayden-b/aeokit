import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function AEOKitLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path
        d="M9.25 9.5h6.5L22 16l-6.25 6.5h-6.5l6.25-6.5-6.25-6.5Z"
        fill="white"
      />
      <path
        d="M22.75 9.5h-6.5L10 16l6.25 6.5h6.5L16.5 16l6.25-6.5Z"
        fill="white"
        fillOpacity="0.94"
      />
    </svg>
  )
}
