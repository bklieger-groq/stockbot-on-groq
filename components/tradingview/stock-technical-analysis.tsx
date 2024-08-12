'use client'

import React, { useEffect, useRef, memo } from 'react'

export function StockTA({ props: symbol }: { props: string }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      interval: '5m',
      width: '100%',
      isTransparent: false,
      height: '100%',
      symbol: symbol,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "en",
      colorTheme: "light"
    })

    container.current.appendChild(script)

    return () => {
      if (container.current) {
        const scriptElement = container.current.querySelector('script')
        if (scriptElement) {
          container.current.removeChild(scriptElement)
        }
      }
    }
  }, [symbol])

  return (
    <div style={{ height: '500px' }}>
      <div className="tradingview-widget-container" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
        <div className="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/"
            rel="noopener nofollow"
            target="_blank"
          >
            <span className="">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default memo(StockTA)
