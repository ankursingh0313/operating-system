'use client'

import React, { useState } from 'react'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import { useAppSelector } from '@/lib/hooks'

interface IframeAppProps {
  src: string
  title?: string
}

export default function IframeApp({ src, title = 'Web App' }: IframeAppProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)

  const activeAccent = hydrated ? accent : 'blue'
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden transition-colors duration-200 ${
        isLight ? 'bg-slate-100/80' : 'bg-gray-950/60'
      }`}
    >
      {/* Loading Spinner / Skeleton while iframe loads */}
      {isLoading && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 gap-3 ${
            isLight ? 'bg-white/85' : 'bg-gray-900/80'
          }`}
        >
          <div
            className={`w-7 h-7 border-2 border-t-transparent rounded-full animate-spin ${
              isLight ? 'border-slate-900/20' : 'border-white/20'
            }`}
            style={{ borderTopColor: theme.rgb }}
          />
          <span
            className={`text-xs font-mono tracking-wider ${surface.textMuted}`}
          >
            Loading {title}...
          </span>
        </div>
      )}

      {/* Seamless Iframe Container */}
      <iframe
        src={src}
        title={title}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 bg-transparent flex-1 select-auto"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  )
}