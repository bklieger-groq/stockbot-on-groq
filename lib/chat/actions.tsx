import 'server-only'

import { generateText } from 'ai'
import {
  createAI,
  getMutableAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { createOpenAI } from '@ai-sdk/openai'

import { BotCard, BotMessage } from '@/components/stocks/message'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { SpinnerMessage } from '@/components/stocks/message'
import { Message } from '@/lib/types'
import { StockChart } from '@/components/tradingview/stock-chart'
import { StockPrice } from '@/components/tradingview/stock-price'
import { StockNews } from '@/components/tradingview/stock-news'
import { StockFinancials } from '@/components/tradingview/stock-financials'
import { StockScreener } from '@/components/tradingview/stock-screener'
import { MarketOverview } from '@/components/tradingview/market-overview'
import { MarketHeatmap } from '@/components/tradingview/market-heatmap'
import { MarketTrending } from '@/components/tradingview/market-trending'
import { ETFHeatmap } from '@/components/tradingview/etf-heatmap'
// import { Showdown }  from 'showdown'
import MarkdownIt from 'markdown-it';
import { toast } from 'sonner'

const md = new MarkdownIt();


// Create a converter instance
// const converter = new Showdown.Converter();

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

interface MutableAIState {
  update: (newState: any) => void
  done: (newState: any) => void
  get: () => AIState
}

const MODEL = 'llama3-70b-8192'
const TOOL_MODEL = 'llama3-70b-8192'
const GROQ_API_KEY_ENV = process.env.GROQ_API_KEY

type ComparisonSymbolObject = {
  symbol: string;
  position: "SameScale";
};

async function generateCaption(
  symbol: string,
  comparisonSymbols: ComparisonSymbolObject[],
  toolName: string,
  aiState: MutableAIState
): Promise<string> {
  const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: GROQ_API_KEY_ENV
  })
  
  const stockString = comparisonSymbols.length === 0
  ? symbol
  : [symbol, ...comparisonSymbols.map(obj => obj.symbol)].join(', ');

  aiState.update({
    ...aiState.get(),
    messages: [...aiState.get().messages]
  })

  const captionSystemMessage =
    `\
You are a stock market conversation bot. You can provide the user information about stocks.
You will be provided with the following:
- Stock ticker: representing stock symbol
- investment goal: representing if user wants to invest in short-term, mid-term, or long-term.

You will then have to list 10 relevant stock tickers that the user provided one would depend on in its supply chain, or as its dependent products.
For each of the relevant stocks you should provide the following in table format:

- Ticker name
- Profitability in 2024 Q2
- Cash balance in 2024 Q2
- Current Market Sentiment being positive, negative, or netural
- Apprecaition percentage over last 3 months
- Industry sector

You would then rank top 5 from above table according to the following criteria:
1. investment goal user provided and whether they have potential for significant gain in short term or long term
2. not more than 3 choice from the same industry sector

You would provide this in the table format as above for the top five choices.


Example 1 :

User: NVIDIA, short term
    `

  try {
    const response = await generateText({
      model: groq(MODEL),
      messages: [
        {
          role: 'system',
          content: captionSystemMessage
        },
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ]
    })
    return md.render(response.text) || ''
  } catch (err) {
    return '' // Send tool use without caption.
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  try {
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: GROQ_API_KEY_ENV
    })

    const result = await streamUI({
      model: groq(TOOL_MODEL),
      initial: <SpinnerMessage />,
      maxRetries: 1,
      system: `\
You are a stock market conversation bot. You can provide the user information about stocks.
You will be provided with the following:
- Stock ticker: representing stock symbol
- investment goal: representing if user wants to invest in short-term, mid-term, or long-term.

You will then have to list 10 relevant stock tickers that would satisfy either of the following criteria:
1. The user provided ticker would heavily buy from the relevant stock sticker in its upstream supply chain
2. The user provided ticker would heavily depend on a service provided by the relevant stock ticker


For each of the relevant stocks you should provide the following in table format:

- Ticker name
- Profitability in 2024 Q2
- Cash balance in 2024 Q2
- Current Market Sentiment being positive, negative, or netural
- Apprecaition percentage over last 3 months
- Industry sector

You would then rank top 5 from above table according to the following criteria:
1. investment goal user provided and whether they have potential for significant gain in short term or long term
2. not more than 3 choice from the same industry sector

You would provide this in the table format as above for the top five choices.


Example 1 :

User: NVIDIA, short term
    `,
      messages: [
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          textNode = <BotMessage content={textStream.value} />
        }

        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content
              }
            ]
          })
        } else {
          textStream.update(delta)
        }

        return textNode
      },
      tools: {
        // showStockChart: {
        //   description:
        //     'Show a stock chart of a given stock. Optionally show 2 or more stocks. Use this to show the chart to the user.',
        //   parameters: z.object({
        //     symbol: z
        //       .string()
        //       .describe(
        //         'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
        //       ),
        //     comparisonSymbols: z.array(z.object({
        //       symbol: z.string(),
        //       position: z.literal("SameScale")
        //     }))
        //       .default([])
        //       .describe(
        //         'Optional list of symbols to compare. e.g. ["MSFT", "GOOGL"]'
        //       )
        //   }),

        //   generate: async function* ({ symbol, comparisonSymbols }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showStockChart',
        //               toolCallId,
        //               args: { symbol, comparisonSymbols }
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showStockChart',
        //               toolCallId,
        //               result: { symbol, comparisonSymbols }
        //             }
        //           ]
        //         }
        //       ]
        //     })

        //     const caption = await generateCaption(
        //       symbol,
        //       comparisonSymbols,
        //       'showStockChart',
        //       aiState
        //     )

        //     return (
        //       <BotCard>
        //         <StockChart symbol={symbol} comparisonSymbols={comparisonSymbols} />
        //         {caption}
        //       </BotCard>
        //     )
        //   }
        // },
        // showStockPrice: {
        //   description:
        //     'Show the price of a given stock. Use this to show the price and price history to the user.',
        //   parameters: z.object({
        //     symbol: z
        //       .string()
        //       .describe(
        //         'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
        //       )
        //   }),
        //   generate: async function* ({ symbol }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showStockPrice',
        //               toolCallId,
        //               args: { symbol }
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showStockPrice',
        //               toolCallId,
        //               result: { symbol }
        //             }
        //           ]
        //         }
        //       ]
        //     })
        //     const caption = await generateCaption(
        //       symbol,
        //       [],
        //       'showStockPrice',
        //       aiState
        //     )

        //     return (
        //       <div
        //       dangerouslySetInnerHTML={{ __html: caption }} />
        //       // <BotCard>
        //       //   <StockPrice props={symbol} />
        //       // </BotCard>
        //     )
        //   }
        // },
        // showStockFinancials: {
        //   description:
        //     'Show the financials of a given stock. Use this to show the financials to the user.',
        //   parameters: z.object({
        //     symbol: z
        //       .string()
        //       .describe(
        //         'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
        //       )
        //   }),
        //   generate: async function* ({ symbol }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showStockFinancials',
        //               toolCallId,
        //               args: { symbol }
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showStockFinancials',
        //               toolCallId,
        //               result: { symbol }
        //             }
        //           ]
        //         }
        //       ]
        //     })

        //     const caption = await generateCaption(
        //       symbol,
        //       [],
        //       'StockFinancials',
        //       aiState
        //     )

        //     return (
        //       <BotCard>
        //         <StockFinancials props={symbol} />
        //         {caption}
        //       </BotCard>
        //     )
        //   }
        // },
        // showStockNews: {
        //   description:
        //     'This tool shows the latest news and events for a stock or cryptocurrency.',
        //   parameters: z.object({
        //     symbol: z
        //       .string()
        //       .describe(
        //         'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
        //       )
        //   }),
        //   generate: async function* ({ symbol }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showStockNews',
        //               toolCallId,
        //               args: { symbol }
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showStockNews',
        //               toolCallId,
        //               result: { symbol }
        //             }
        //           ]
        //         }
        //       ]
        //     })

        //     const caption = await generateCaption(
        //       symbol,
        //       [],
        //       'showStockNews',
        //       aiState
        //     )

        //     return (
        //       <BotCard>
        //         <StockNews props={symbol} />
        //         {caption}
        //       </BotCard>
        //     )
        //   }
        // },
        // showStockScreener: {
        //   description:
        //     'This tool shows a generic stock screener which can be used to find new stocks based on financial or technical parameters.',
        //   parameters: z.object({}),
        //   generate: async function* ({ }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showStockScreener',
        //               toolCallId,
        //               args: {}
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showStockScreener',
        //               toolCallId,
        //               result: {}
        //             }
        //           ]
        //         }
        //       ]
        //     })
        //     const caption = await generateCaption(
        //       'Generic',
        //       [],
        //       'showStockScreener',
        //       aiState
        //     )

        //     return (
        //       <BotCard>
        //         <StockScreener />
        //         {caption}
        //       </BotCard>
        //     )
        //   }
        // },
        // showMarketOverview: {
        //   description: `This tool shows an overview of today's stock, futures, bond, and forex market performance including change values, Open, High, Low, and Close values.`,
        //   parameters: z.object({}),
        //   generate: async function* ({ }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showMarketOverview',
        //               toolCallId,
        //               args: {}
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showMarketOverview',
        //               toolCallId,
        //               result: {}
        //             }
        //           ]
        //         }
        //       ]
        //     })
        //     const caption = await generateCaption(
        //       'Generic',
        //       [],
        //       'showMarketOverview',
        //       aiState
        //     )

        //     return (
        //       <BotCard>
        //         <MarketOverview />
        //         {caption}
        //       </BotCard>
        //     )
        //   }
        // },
        // showMarketHeatmap: {
        //   description: `This tool shows a heatmap of today's stock market performance across sectors. It is preferred over showMarketOverview if asked specifically about the stock market.`,
        //   parameters: z.object({}),
        //   generate: async function* ({ }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showMarketHeatmap',
        //               toolCallId,
        //               args: {}
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showMarketHeatmap',
        //               toolCallId,
        //               result: {}
        //             }
        //           ]
        //         }
        //       ]
        //     })
        //     const caption = await generateCaption(
        //       'Generic',
        //       [],
        //       'showMarketHeatmap',
        //       aiState
        //     )

        //     return (
        //       <BotCard>
        //         <MarketHeatmap />
        //         {caption}
        //       </BotCard>
        //     )
        //   }
        // },
        // showETFHeatmap: {
        //   description: `This tool shows a heatmap of today's ETF performance across sectors and asset classes. It is preferred over showMarketOverview if asked specifically about the ETF market.`,
        //   parameters: z.object({}),
        //   generate: async function* ({ }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showETFHeatmap',
        //               toolCallId,
        //               args: {}
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showETFHeatmap',
        //               toolCallId,
        //               result: {}
        //             }
        //           ]
        //         }
        //       ]
        //     })
        //     const caption = await generateCaption(
        //       'Generic',
        //       [],
        //       'showETFHeatmap',
        //       aiState
        //     )

        //     return (
        //       <BotCard>
        //         <ETFHeatmap />
        //         {caption}
        //       </BotCard>
        //     )
        //   }
        // },
        // showTrendingStocks: {
        //   description: `This tool shows the daily top trending stocks including the top five gaining, losing, and most active stocks based on today's performance`,
        //   parameters: z.object({}),
        //   generate: async function* ({ }) {
        //     yield (
        //       <BotCard>
        //         <></>
        //       </BotCard>
        //     )

        //     const toolCallId = nanoid()

        //     aiState.done({
        //       ...aiState.get(),
        //       messages: [
        //         ...aiState.get().messages,
        //         {
        //           id: nanoid(),
        //           role: 'assistant',
        //           content: [
        //             {
        //               type: 'tool-call',
        //               toolName: 'showTrendingStocks',
        //               toolCallId,
        //               args: {}
        //             }
        //           ]
        //         },
        //         {
        //           id: nanoid(),
        //           role: 'tool',
        //           content: [
        //             {
        //               type: 'tool-result',
        //               toolName: 'showTrendingStocks',
        //               toolCallId,
        //               result: {}
        //             }
        //           ]
        //         }
        //       ]
        //     })
        //     const caption = await generateCaption(
        //       'Generic',
        //       [],
        //       'showTrendingStocks',
        //       aiState
        //     )

        //     return (
        //       <BotCard>
        //         <MarketTrending />
        //         {caption}
        //       </BotCard>
        //     )
        //   }
        // }
      }
    })

    return {
      id: nanoid(),
      display: result.value
    }
  } catch (err: any) {
    // If key is missing, show error message that Groq API Key is missing.
    if (err.message.includes('OpenAI API key is missing.')) {
      err.message =
        'Groq API key is missing. Pass it using the GROQ_API_KEY environment variable. Try restarting the application if you recently changed your environment variables.'
    }
    return {
      id: nanoid(),
      display: (
        <div className="border p-4">
          <div className="text-red-700 font-medium">Error: {err.message}</div>
          <a
            href="https://github.com/bklieger-groq/stockbot-on-groq/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-red-800 hover:text-red-900"
          >
            If you think something has gone wrong, create an
            <span className="ml-1" style={{ textDecoration: 'underline' }}>
              {' '}
              issue on Github.
            </span>
          </a>
        </div>
      )
    }
  }
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] }
})
