'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-muted/40">
      {language ? (
        <span className="absolute top-3 left-4 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {language}
        </span>
      ) : null}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className={`overflow-x-auto p-4 ${language ? 'pt-10' : 'pt-12'} text-[13px] leading-relaxed`}>
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}
