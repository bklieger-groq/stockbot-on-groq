import { AsyncLocalStorage } from 'node:async_hooks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AIState } from '../lib/chat/actions'

const harness = vi.hoisted(() => ({
  submit: undefined as any,
  storage: undefined as any,
  modelRequests: [] as any[]
}))

// Only the host's state/action boundary and model inference are scripted.
// The production action, real streamUI schema/dispatcher and MCP SDK all run.
vi.mock('ai/rsc', async importOriginal => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    createAI: ({ actions }: any) => {
      harness.submit = actions.submitUserMessage
      return actions
    },
    getMutableAIState: () => harness.storage.getStore().mutable
  }
})
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: () => (modelName: string) => ({
    specificationVersion: 'v1',
    provider: 'scripted-groq',
    modelId: modelName,
    defaultObjectGenerationMode: 'tool',
    doStream: async (options: any) => {
      const store = harness.storage.getStore()
      harness.modelRequests.push(options)
      return {
        rawCall: { rawPrompt: null, rawSettings: {} },
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue({
              type: 'tool-call',
              toolCallType: 'function',
              toolCallId: 'scripted-call',
              toolName: store.tool,
              args: JSON.stringify(store.args)
            })
            controller.enqueue({
              type: 'finish',
              finishReason: 'tool-calls',
              usage: { promptTokens: 1, completionTokens: 1 }
            })
            controller.close()
          }
        })
      }
    }
  })
}))
vi.mock('@/components/stocks/message', () => ({
  BotCard: ({ children }: any) => children,
  BotMessage: ({ content }: any) => content,
  SpinnerMessage: () => 'Loading'
}))

import { AI } from '../lib/chat/actions'
import { callParallelTool } from '../lib/chat/parallel-search'
import { createWebResearchTools } from '../lib/chat/web-research'

// Ensure createAI runs and captures the same action registered for production.
void AI

const query = {
  objective: 'Find Acme earnings announcements',
  search_queries: ['Acme quarterly earnings release']
}
const page = {
  urls: ['https://example.com/earnings'],
  objective: 'Find revenue',
  search_queries: query.search_queries
}
const endpoint = 'https://search.parallel.ai/mcp'
const realFetch = globalThis.fetch
let requests: {
  url: string
  headers: Headers
  body: any
  signal?: AbortSignal | null
}[]
let responseMode = 'success'

function mockMcp() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined
      const request = {
        url: String(url),
        headers: new Headers(init?.headers),
        body,
        signal: init?.signal
      }
      requests.push(request)
      if (
        responseMode === 'timeout' ||
        (responseMode === 'call-timeout' && body?.method === 'tools/call')
      ) {
        return new Promise((_resolve, reject) => {
          if (init.signal.aborted) reject(init.signal.reason)
          else
            init.signal.addEventListener(
              'abort',
              () => reject(init.signal.reason),
              { once: true }
            )
        })
      }
      if (init?.method === 'GET') return new Response(null, { status: 405 })
      if (!body?.id && body?.id !== 0)
        return new Response(null, { status: 202 })
      let result: any
      if (body.method === 'initialize') {
        result = {
          protocolVersion: body.params.protocolVersion,
          capabilities: { tools: {} },
          serverInfo: { name: 'fixture', version: '1' }
        }
      } else if (body.method === 'tools/list') {
        result = {
          tools: ['web_search', 'web_fetch'].map(name => ({
            name,
            inputSchema: { type: 'object' }
          }))
        }
      } else if (body.method === 'tools/call') {
        if (responseMode === 'http-error')
          return new Response('Unavailable', { status: 503 })
        result =
          responseMode === 'quota'
            ? {
                isError: true,
                content: [
                  { type: 'text', text: 'Free anonymous quota exceeded' }
                ]
              }
            : {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      results: [
                        {
                          url:
                            responseMode === 'bad-url'
                              ? 'javascript:alert(1)'
                              : page.urls[0],
                          title: 'Acme earnings',
                          excerpts: ['Revenue increased by 10%.']
                        }
                      ],
                      errors:
                        responseMode === 'partial'
                          ? [{ url: 'https://example.com/missing' }]
                          : []
                    })
                  }
                ]
              }
      } else throw new Error(`Unexpected request: ${body.method}`)
      return new Response(
        JSON.stringify({ jsonrpc: '2.0', id: body.id, result }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    })
  )
}

function newChat() {
  let state: AIState = { chatId: crypto.randomUUID(), messages: [] }
  let done: (value: AIState) => void
  const mutable = {
    get: () => state,
    update: (value: AIState) => {
      state = value
    },
    done: (value: AIState) => {
      state = value
      done?.(state)
    }
  }
  return {
    get state() {
      return state
    },
    async turn(tool = 'web_search', args: any = query) {
      const completed = new Promise<AIState>(resolve => {
        done = resolve
      })
      const result = await harness.storage.run({ mutable, tool, args }, () =>
        harness.submit('Research Acme')
      )
      await completed
      return result
    }
  }
}

// Resolve the SDK's streamable server elements to inspect the consumed UI.
async function uiText(node: any): Promise<string> {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node))
    return (await Promise.all(node.map(uiText))).join(' ')
  if (typeof node.then === 'function') return uiText(await node)
  if (typeof node.type === 'function')
    return uiText(await node.type(node.props))
  return uiText(node.props?.children)
}

beforeEach(() => {
  harness.storage = new AsyncLocalStorage()
  harness.modelRequests = []
  requests = []
  responseMode = 'success'
  vi.stubEnv('GROQ_API_KEY', '')
  vi.stubEnv('PARALLEL_API_KEY', '')
  vi.stubEnv('WEB_SEARCH_ENABLED', '')
  mockMcp()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('StockBot real streamUI dispatcher with scripted inference', () => {
  it('enables anonymous research, consumes source output and retains widget tools', async () => {
    const chat = newChat()
    const rendered = await chat.turn()
    expect(await uiText(rendered.display)).toContain(
      'Revenue increased by 10%.'
    )
    expect(chat.state.messages.at(-1)).toMatchObject({
      role: 'tool',
      content: [
        { result: { sources: [{ url: page.urls[0], title: 'Acme earnings' }] } }
      ]
    })
    const tools = harness.modelRequests[0].mode.tools.map(
      (tool: any) => tool.name
    )
    expect(tools).toEqual(
      expect.arrayContaining([
        'web_search',
        'web_fetch',
        'showStockChart',
        'showStockPrice',
        'showStockNews'
      ])
    )
    for (const request of requests) {
      expect(request.url).toBe(endpoint)
      expect(request.headers.get('User-Agent')).toContain(
        'stockbot-on-groq/1.0'
      )
      expect(request.headers.has('Authorization')).toBe(false)
    }
    expect(requests.map(r => r.body?.method)).toEqual(
      expect.arrayContaining(['initialize', 'tools/list', 'tools/call'])
    )
    const call = requests.find(r => r.body?.method === 'tools/call')!.body
      .params
    expect(call.arguments).toMatchObject({
      ...query,
      model_name: 'llama-3.3-70b-versatile',
      session_id: chat.state.webSearchSessionId
    })
  })

  it('keeps the ID across search, fetch, follow-up, errors and retries; resets for new chats', async () => {
    const a = newChat()
    const b = newChat()
    await Promise.all([a.turn(), b.turn()])
    const aId = a.state.webSearchSessionId
    const bId = b.state.webSearchSessionId
    expect(aId).toMatch(/^[a-f0-9-]{36}$/)
    expect(aId).not.toBe(bId)
    await Promise.all([a.turn('web_fetch', page), b.turn()])
    responseMode = 'quota'
    await a.turn()
    expect(a.state.messages.at(-1)).toMatchObject({
      content: [
        {
          result: {
            sources: [],
            message: expect.stringContaining('temporarily unavailable')
          }
        }
      ]
    })
    responseMode = 'success'
    await a.turn()
    const ids = requests
      .filter(r => r.body?.method === 'tools/call')
      .map(r => r.body.params.arguments.session_id)
    expect(ids.filter(id => id === aId)).toHaveLength(4)
    expect(ids.filter(id => id === bId)).toHaveLength(2)
    const reset = newChat()
    await reset.turn()
    expect(reset.state.webSearchSessionId).not.toBe(aId)
  })

  it('preserves explicit disabling at registration and execution', async () => {
    vi.stubEnv('WEB_SEARCH_ENABLED', 'false')
    const tools = createWebResearchTools({
      sessionId: 'unused',
      modelName: 'configured-model',
      aiState: { get: () => ({ messages: [] }), done: () => {} }
    })
    expect(tools).toEqual({})
    const result = await callParallelTool('web_search', query, {
      sessionId: 'unused',
      modelName: 'configured-model'
    })
    expect(result.message).toContain('disabled')
    expect(requests).toHaveLength(0)
    const chat = newChat()
    await chat.turn('showStockNews', { symbol: 'AAPL' })
    const names = harness.modelRequests[0].mode.tools.map(
      (tool: any) => tool.name
    )
    expect(names).toContain('showStockNews')
    expect(names).not.toContain('web_search')
    expect(names).not.toContain('web_fetch')
    expect(requests).toHaveLength(0)
  })

  it.each(['http-error', 'bad-url', 'partial'])(
    'handles %s without inventing sources',
    async mode => {
      responseMode = mode
      const chat = newChat()
      const rendered = await chat.turn('web_fetch', page)
      const text = await uiText(rendered.display)
      if (mode === 'partial')
        expect(text).toContain('Some pages could not be fetched.')
      else {
        expect(text).toContain('temporarily unavailable')
        expect(text).not.toContain('Revenue increased')
      }
    }
  )

  it('rejects unsafe URLs and empty queries in the registered schemas', () => {
    const tools = createWebResearchTools({
      sessionId: 'unused',
      modelName: 'configured-model',
      aiState: { get: () => ({ messages: [] }), done: () => {} }
    })
    for (const url of [
      'not a URL',
      '',
      'https://',
      'javascript:alert(1)',
      'file:///etc/passwd',
      'https://user:password@example.com'
    ]) {
      expect(
        tools.web_fetch.parameters.safeParse({ urls: [url] }).success
      ).toBe(false)
    }
    expect(
      tools.web_search.parameters.safeParse({ ...query, search_queries: [] })
        .success
    ).toBe(false)
    expect(tools.web_fetch.parameters.safeParse(page).success).toBe(true)
  })

  it.each(['timeout', 'call-timeout'])(
    'bounds %s through the action',
    async mode => {
      responseMode = mode
      vi.useFakeTimers()
      const chat = newChat()
      const pending = chat.turn()
      await vi.advanceTimersByTimeAsync(20_001)
      expect(await uiText((await pending).display)).toContain(
        'cancelled or timed out'
      )
    }
  )

  it('cancels in-flight transport requests without a fallback request', async () => {
    responseMode = 'timeout'
    const controller = new AbortController()
    const pending = callParallelTool('web_fetch', page, {
      sessionId: 'conversation',
      modelName: 'configured-model',
      signal: controller.signal
    })
    controller.abort()
    expect((await pending).message).toContain('cancelled or timed out')
    expect(requests.length).toBeLessThanOrEqual(1)
  })

  it.skipIf(process.env.LIVE_PARALLEL !== '1')(
    'runs actual anonymous search/fetch through the action (scripted model)',
    async () => {
      // Opt in explicitly; this consumes the shared anonymous service quota.
      const quotaResponses: string[] = []
      vi.stubGlobal('fetch', async (url: any, init: any) => {
        requests.push({
          url: String(url),
          headers: new Headers(init?.headers),
          body: init?.body ? JSON.parse(String(init.body)) : null
        })
        const result = await realFetch(url, init)
        const body = await result.clone().text()
        console.log('Live MCP response', result.status, body)
        if (
          result.status === 429 ||
          /free.*(?:quota|limit)|(?:quota|limit).*free/i.test(body)
        )
          quotaResponses.push(body)
        return result
      })
      const chat = newChat()
      await chat.turn()
      await chat.turn('web_fetch', {
        urls: ['https://example.com'],
        objective: 'Describe this page'
      })
      console.log(
        'Live tool results',
        JSON.stringify(chat.state.messages.filter(m => m.role === 'tool'))
      )
      for (const message of chat.state.messages.filter(
        m => m.role === 'tool'
      )) {
        const result = (message.content as any)[0].result
        expect(result.sources.length > 0 || quotaResponses.length > 0).toBe(
          true
        )
      }
      for (const request of requests) {
        expect(request.url).toBe(endpoint)
        expect(request.headers.get('User-Agent')).toContain('stockbot-on-groq')
        expect(request.headers.has('Authorization')).toBe(false)
      }
      expect(
        requests.filter(r => r.body?.method === 'tools/call')
      ).toHaveLength(2)
    },
    60_000
  )
})
