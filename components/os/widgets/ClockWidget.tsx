'use client'

import React, { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'

export default function ClockWidget() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const activeAccent = hydrated ? accent : 'blue'
  const activeMode = hydrated ? mode : 'dark'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)

  // Start with null to prevent SSR / hydration mismatch
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date()) // Set initial time on client mount
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time
    ? time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--'

  const dateStr = time
    ? time.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : 'Loading...'

  return (
    <div
      className={` flex flex-col justify-between p-5 min-w-[220px] h-[130px] ${surface.textPrimary}`}
    >
      <div
        className={`flex justify-between items-center text-xs tracking-wider uppercase font-medium ${surface.textMuted}`}
      >
        <span>{dateStr}</span>
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: theme.rgb }}
        />
      </div>
      <div className={`text-3xl font-bold tracking-tight font-mono ${surface.textPrimary}`}>
        {hours}
      </div>
      <div className={`text-xs ${surface.textMuted}`}>Sonbhadra, India</div>
    </div>
  )
}