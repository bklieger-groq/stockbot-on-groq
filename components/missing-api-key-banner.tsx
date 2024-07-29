import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { Button, buttonVariants } from '@/components/ui/button'

export function MissingApiKeyBanner({ missingKeys }: { missingKeys: string[] }) {
  const [apiKey, setApiKey] = useLocalStorage('groqKey', '')

  if (apiKey.length > 0) {
    return null
  }

  if (!missingKeys.includes("GROQ_API_KEY")){
    return null
  }

  return (
    <div className="border p-4">
      <div className="text-red-700 font-medium">
        You need to provide a Groq API Key.
      </div>
      <a
        href="/new"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-red-800 hover:text-red-900"
      >
        <span
          className="ml-1 text-primary font-semibold"
          style={{ textDecoration: 'underline' }}
        >
          {' '}
          Set it on the homepage.
        </span>
      </a>
    </div>
  )
}
