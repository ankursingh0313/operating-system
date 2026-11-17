'use client'

import React, { useState } from 'react'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
import { useAppSelector } from '@/lib/hooks'

interface IframeAppProps {
  src: string
  title?: string
}

export default function IframeApp({ src, title = 'Web App' }: IframeAppProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[hydrated ? accent : 'blue']

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-950/60 overflow-hidden rounded-xl">
      {/* Loading Spinner / Skeleton while iframe loads */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10 gap-3">
          <div 
            className="w-7 h-7 border-2 border-white/20 border-t-transparent rounded-full animate-spin" 
            style={{ borderTopColor: theme.rgb }}
          />
          <span className="text-xs font-mono opacity-60 tracking-wider">Loading {title}...</span>
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