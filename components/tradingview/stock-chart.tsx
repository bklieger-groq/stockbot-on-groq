'use client'

import React, { useEffect, useRef, memo, useMemo } from 'react'
import { chartStyleMapping } from '@/lib/chart-utils'

export function StockChart({ symbol, chartStyle }: { symbol: string, chartStyle: string }) {
  const container = useRef<HTMLDivElement>(null)

  // Find the corresponding style value for the given chartStyle
  const styleValue = useMemo(() => {
    const style = chartStyleMapping.find(style => style.name.toLowerCase() === chartStyle.toLowerCase())
    return style ? style.value : '2'
  }, [chartStyle])

  useEffect(() => {
    if (!container.current) return
    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: styleValue,
      locale: 'en',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      gridColor: 'rgba(247, 247, 247, 1)',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: true,
      support_host: 'https://www.tradingview.com'
    })

    container.current.appendChild(script)

    return () => {
      if (container.current) {
        container.current.removeChild(script)
      }
    }
  }, [symbol, styleValue])

  return (
    <div style={{ height: '500px' }}>
      <div
        className="tradingview-widget-container"
        ref={container}
        style={{ height: '100%', width: '100%' }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: 'calc(100% - 32px)', width: '100%' }}
        ></div>
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

export default memo(StockChart)
