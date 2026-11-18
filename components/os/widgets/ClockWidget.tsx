'use client'

import React, { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

export default function ClockWidget() {
  const { accent } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[accent]

  // Start with null to prevent SSR / hydration mismatch
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date()) // Set initial time on client mount
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'
  const dateStr = time ? time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) : 'Loading...'

  return (
    <div className="widget-card flex flex-col justify-between p-5 min-w-[220px] h-[130px]">
      <div className="flex justify-between items-center text-xs tracking-wider uppercase opacity-60 font-medium">
        <span>{dateStr}</span>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.rgb }} />
      </div>
      <div className="text-3xl font-bold tracking-tight font-mono">
        {hours}
      </div>
      <div className="text-xs opacity-50">Sonbhadra, India</div>
    </div>
  )
}