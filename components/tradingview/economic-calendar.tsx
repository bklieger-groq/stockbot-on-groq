'use client'

import * as React from 'react'
import { useRef, useEffect } from 'react'

export function EconomicCalendar() {
    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!container.current) return

        const script = document.createElement('script')
        script.src =
            'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
        script.async = true
        script.innerHTML = JSON.stringify({
            colorTheme: 'light',
            isTransparent: false,
            locale: 'en',
            importanceFilter: '0,1',
            width: '100%',
            height: '100%',
            countryFilter: 'us,ca,de,it,gb,eu,in,jp'
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
    }, [])

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
