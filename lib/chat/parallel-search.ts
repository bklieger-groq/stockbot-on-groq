import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

const endpoint = 'https://search.parallel.ai/mcp'
const userAgent =
  'stockbot-on-groq/1.0 (+https://github.com/bklieger-groq/stockbot-on-groq)'

export const webUrl = z
  .string()
  .url()
  .refine(value => {
    try {
      const url = new URL(value)
      return (
        ['http:', 'https:'].includes(url.protocol) &&
        !url.username &&
        !url.password
      )
    } catch {
      return false
    }
  }, 'Use an HTTP or HTTPS URL without credentials.')

const responseSchema = z.object({
  results: z.array(
    z.object({
      url: webUrl,
      title: z.string().nullish(),
      excerpts: z.array(z.string()).default([])
    })
  ),
  errors: z.array(z.unknown()).optional()
})

export type ResearchResult = {
  sources: { url: string; title: string; excerpts: string[] }[]
  message?: string
}

export function webSearchEnabled() {
  return process.env.WEB_SEARCH_ENABLED !== 'false'
}

// A connection is scoped to one call. The conversation ID is supplied by the
// chat state, rather than being owned by this transport or a shared client.
export async function callParallelTool(
  name: 'web_search' | 'web_fetch',
  args: Record<string, unknown>,
  context: { sessionId: string; modelName: string; signal?: AbortSignal }
): Promise<ResearchResult> {
  if (!webSearchEnabled()) {
    return { sources: [], message: 'Web research is disabled.' }
  }

  const controller = new AbortController()
  const cancel = () => controller.abort(context.signal?.reason)
  context.signal?.addEventListener('abort', cancel, { once: true })
  if (context.signal?.aborted) cancel()
  const timer = setTimeout(() => controller.abort(), 20_000)
  const client = new Client({ name: 'stockbot-on-groq', version: '1.0.0' })
  const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
    // Apply to every transport request, including discovery and reconnection.
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        headers: {
          ...Object.fromEntries(new Headers(init?.headers)),
          'User-Agent': userAgent
        },
        signal: init?.signal
          ? AbortSignal.any([controller.signal, init.signal])
          : controller.signal
      })
  })

  try {
    controller.signal.throwIfAborted()
    await client.connect(transport)
    const tools = await client.listTools({}, { signal: controller.signal })
    if (!tools.tools.some(tool => tool.name === name)) {
      throw new Error('The requested research tool is unavailable.')
    }
    const result = CallToolResultSchema.parse(
      await client.callTool(
        {
          name,
          arguments: {
            ...args,
            session_id: context.sessionId,
            model_name: context.modelName
          }
        },
        undefined,
        { signal: controller.signal }
      )
    )
    if (result.isError)
      throw new Error('The research service returned an error.')

    const text = result.content.find(item => item.type === 'text')
    const payload =
      result.structuredContent ??
      (text?.type === 'text' ? JSON.parse(text.text) : undefined)
    const data = responseSchema.parse(payload)
    const sources = data.results.slice(0, 6).map(source => ({
      url: source.url,
      title: source.title || source.url,
      excerpts: source.excerpts
        .slice(0, 3)
        .map(excerpt => excerpt.slice(0, 2000))
    }))
    return {
      sources,
      message: data.errors?.length
        ? 'Some pages could not be fetched.'
        : sources.length
          ? undefined
          : 'No web sources were found.'
    }
  } catch {
    return {
      sources: [],
      message: controller.signal.aborted
        ? 'Web research was cancelled or timed out. Please try again.'
        : 'Web research is temporarily unavailable. Please try again.'
    }
  } finally {
    clearTimeout(timer)
    context.signal?.removeEventListener('abort', cancel)
    controller.abort()
    await client.close().catch(() => {})
  }
}
