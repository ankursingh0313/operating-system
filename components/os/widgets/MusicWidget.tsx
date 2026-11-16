'use client'

import React, { useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

export default function MusicWidget() {
  const { accent } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[accent]

  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="widget-card p-4 min-w-[260px] flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {/* Album Art Placeholder */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner"
          style={{ background: `linear-gradient(135deg, rgba(${theme.rgb}, 0.4), rgba(15, 23, 42, 0.8))` }}
        >
          🎵
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold truncate">Lofi Coding Session</span>
          <span className="text-xs opacity-50 truncate">Synthwave & Chill Beats</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: isPlaying ? '65%' : '30%', backgroundColor: theme.rgb }} />
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-6 mt-1">
        <button className="opacity-60 hover:opacity-100 transition text-sm">⏮</button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg transition transform active:scale-95"
          style={{ backgroundColor: theme.rgb }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="opacity-60 hover:opacity-100 transition text-sm">⏭</button>
      </div>
    </div>
  )
}