import { z } from 'zod'
import { BotCard, SpinnerMessage } from '@/components/stocks/message'
import { Message } from '@/lib/types'
import { nanoid } from '@/lib/utils'
import {
  callParallelTool,
  ResearchResult,
  webSearchEnabled,
  webUrl
} from './parallel-search'

function WebSources({ result }: { result: ResearchResult }) {
  return (
    <BotCard>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Web sources via Parallel
        </p>
        {result.message && <p role="status">{result.message}</p>}
        {result.sources.map((source, index) => (
          <article key={`${index}-${source.url}`} className="space-y-2">
            <a
              className="underline"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.title}
            </a>
            {source.excerpts.map((excerpt, excerptIndex) => (
              <p key={excerptIndex} className="whitespace-pre-wrap text-sm">
                {excerpt}
              </p>
            ))}
          </article>
        ))}
      </div>
    </BotCard>
  )
}

export function createWebResearchTools(context: {
  sessionId: string
  modelName: string
  aiState: {
    get: () => { messages: Message[] }
    done: (state: any) => void
  }
  signal?: AbortSignal
}): Record<
  string,
  {
    description: string
    parameters: z.ZodTypeAny
    generate: (args: any) => AsyncGenerator<React.ReactNode, React.ReactNode>
  }
> {
  if (!webSearchEnabled()) return {}

  async function* run(
    name: 'web_search' | 'web_fetch',
    args: Record<string, unknown>
  ) {
    yield <SpinnerMessage />
    const result = await callParallelTool(name, args, context)
    const toolCallId = nanoid()
    context.aiState.done({
      ...context.aiState.get(),
      messages: [
        ...context.aiState.get().messages,
        {
          id: nanoid(),
          role: 'assistant',
          content: [{ type: 'tool-call', toolName: name, toolCallId, args }]
        },
        {
          id: nanoid(),
          role: 'tool',
          content: [{ type: 'tool-result', toolName: name, toolCallId, result }]
        }
      ]
    })
    return <WebSources result={result} />
  }

  return {
    web_search: {
      description:
        'Search the web for company announcements, earnings reports and financial research. Returns source links and excerpts. Use TradingView tools for prices and charts.',
      parameters: z.object({
        objective: z
          .string()
          .min(1)
          .max(1000)
          .describe(
            'The specific research question, including freshness requirements.'
          ),
        search_queries: z
          .array(z.string().min(1).max(200))
          .min(1)
          .max(3)
          .describe('One to three concise, related keyword searches.')
      }),
      generate: (args: { objective: string; search_queries: string[] }) =>
        run('web_search', args)
    },
    web_fetch: {
      description:
        'Read public web pages for stock research, including sources from web_search. Returns links and relevant page excerpts.',
      parameters: z.object({
        urls: z.array(webUrl).min(1).max(5),
        objective: z.string().max(200).optional(),
        search_queries: z
          .array(z.string().min(1).max(200))
          .max(3)
          .optional()
          .describe('Reuse the searches that found these URLs when available.')
      }),
      generate: (args: {
        urls: string[]
        objective?: string
        search_queries?: string[]
      }) => run('web_fetch', args)
    }
  }
}
