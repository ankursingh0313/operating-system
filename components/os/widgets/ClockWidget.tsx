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
      <style>{`
        .widget-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px) saturate(140%);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3),
                      0 0 15px rgba(${theme.rgb}, 0.1);
          color: #ffffff;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .widget-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4),
                      0 0 20px rgba(${theme.rgb}, 0.2);
        }
      `}</style>
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