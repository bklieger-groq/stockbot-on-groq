'use client'

import * as React from 'react'
import { EnterFullScreenIcon, ExitFullScreenIcon } from '@radix-ui/react-icons'

export function FullscreenWidget({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  React.useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === ref.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = () => {
    if (isFullscreen) document.exitFullscreen()
    else ref.current?.requestFullscreen()
  }

  return (
    // In fullscreen the widget's fixed-height div (direct child) stretches to fill the screen
    <div
      ref={ref}
      className="bg-background [&:fullscreen>div]:!h-auto [&:fullscreen>div]:flex-1 [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:p-4"
    >
      <button
        type="button"
        onClick={toggle}
        className="mb-1 ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
        {isFullscreen ? 'Exit full screen' : 'Full screen'}
      </button>
      {children}
    </div>
  )
}
