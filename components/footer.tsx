import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      Open source AI StockBot built with{' '}
      <ExternalLink href="https://github.com/vercel/ai">
        Vercel AI SDK
      </ExternalLink>{' '}powered by{' '}
      <ExternalLink href="https://groq.com">
        Groq
      </ExternalLink>{' '}and{' '}
      <ExternalLink href="https://groq.com">
        TradingView
      </ExternalLink>
      .
    </p>
  )
}
