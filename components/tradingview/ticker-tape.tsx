'use client'

import * as React from 'react'
import { useRef, useEffect } from 'react'
import Script from 'next/script'

export function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: 'FOREXCOM:SPXUSD',
          title: 'S&P 500 Index'
        },
        {
          proName: 'FOREXCOM:NSXUSD',
          title: 'US 100 Cash CFD'
        },
        {
          proName: 'FX_IDC:EURUSD',
          title: 'EUR to USD'
        },
        {
          proName: 'BITSTAMP:BTCUSD',
          title: 'Bitcoin'
        },
        {
          description: 'Apple Inc',
          proName: 'NASDAQ:AAPL'
        },
        {
          description: 'Alphabet Inc',
          proName: 'NASDAQ:GOOGL'
        }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'light',
      locale: 'en'
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="tradingview-widget-container mb-4" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright flex justify-end mr-2">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
          className="justify-end text-right"
        >
          <span className="">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  )
}
