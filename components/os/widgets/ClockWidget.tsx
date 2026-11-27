'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const DRUM_HEIGHT = 44 // px

function formatTimezoneLocation(tz: string): string {
  if (!tz) return 'Local Time'
  const parts = tz.split('/').map((part) => part.replace(/_/g, ' '))
  if (parts.length >= 2) {
    const city = parts[parts.length - 1]
    const region = parts[0]
    return `${city}, ${region}`
  }
  return parts[0]
}

interface OdometerDigitProps {
  char: string
}

function OdometerDigit({ char }: OdometerDigitProps) {
  const num = Number(char)
  const isDigit = !Number.isNaN(num) && char >= '0' && char <= '9'

  if (!isDigit) {
    return (
      <div
        className="w-[18px] flex items-center justify-center font-mono text-2xl font-bold select-none"
        style={{ height: `${DRUM_HEIGHT}px` }}
      >
        {char}
      </div>
    )
  }

  return (
    <div
      className="relative w-[18px] overflow-hidden select-none"
      style={{ height: `${DRUM_HEIGHT}px` }}
    >
      <div
        className="flex flex-col items-center will-change-transform"
        style={{
          transform: `translateY(-${num * DRUM_HEIGHT}px)`,
          transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="flex items-center justify-center w-full font-mono text-2xl font-bold leading-none"
            style={{ height: `${DRUM_HEIGHT}px` }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

interface OdometerPairProps {
  value: string
  isLight: boolean
}

function OdometerPair({ value, isLight }: OdometerPairProps) {
  const chars = value.padStart(2, '0').slice(-2).split('')

  return (
    <div
      className={`relative inline-flex items-center justify-center px-1.5 rounded-lg border overflow-hidden backdrop-blur-md ${
        isLight
          ? 'bg-white/35 border-white/55 text-slate-900'
          : 'bg-white/[0.06] border-white/[0.16] text-white'
      }`}
      style={{
        height: `${DRUM_HEIGHT}px`,
      }}
    >
      {/* Cylindrical top & bottom drum shading */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 `}
      />

      {/* Left Digit Drum */}
      <OdometerDigit char={chars[0]} />

      {/* Subtle mechanical divider between the two drums */}
      <div
        className={`w-[1px] h-7 mx-0.5 ${
          isLight ? 'bg-slate-900/10' : 'bg-white/[0.08]'
        }`}
      />

      {/* Right Digit Drum */}
      <OdometerDigit char={chars[1]} />
    </div>
  )
}

export default function ClockWidget() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const activeAccent = hydrated ? accent : 'blue'
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)

  const [time, setTime] = useState<Date | null>(null)
  const [timeZone, setTimeZone] = useState<string>('')

  useEffect(() => {
    setTime(new Date())
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || '')

    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = time
    ? time.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : 'Loading...'

  const timeParts = useMemo(() => {
    if (!time) {
      return {
        hour: '--',
        minute: '--',
        second: '--',
        dayPeriod: '',
      }
    }

    const parts = new Intl.DateTimeFormat([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(time)

    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? ''

    return {
      hour: get('hour').padStart(2, '0'),
      minute: get('minute').padStart(2, '0'),
      second: get('second').padStart(2, '0'),
      dayPeriod: get('dayPeriod'),
    }
  }, [time])

  const tzAbbr = useMemo(() => {
    if (!time) return ''
    const parts = new Intl.DateTimeFormat([], {
      timeZoneName: 'short',
    }).formatToParts(time)
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
  }, [time])

  const locationLabel = time
    ? `${formatTimezoneLocation(timeZone)}${tzAbbr ? ` · ${tzAbbr}` : ''}`
    : 'Detecting location...'

  return (
    <div
      className={`flex flex-col justify-between p-4 min-w-[252px] h-[142px] ${surface.textPrimary} `}
    >
      {/* Normal Date Header + Live Pulse */}
      <div
        className={`flex justify-between items-center text-xs tracking-wider uppercase font-medium ${surface.textMuted}`}
      >
        <span>{dateStr}</span>
        
      </div>

      {/* Odometer HH : MM : SS Rolling Row */}
      <div className="flex items-center gap-1.5 my-1 justify-around">
        <OdometerPair value={timeParts.hour} isLight={isLight} />
        <span className={`text-xl font-bold font-mono ${surface.textMuted}`}>:</span>
        <OdometerPair value={timeParts.minute} isLight={isLight} />
        <span className={`text-xl font-bold font-mono ${surface.textMuted}`}>:</span>
        <OdometerPair value={timeParts.second} isLight={isLight} />
        {timeParts.dayPeriod && (
          <span
            className={`ml-0.5 self-end pb-0.5 px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md ${
              isLight
                ? 'bg-white/35 border-white/55 text-slate-800'
                : 'bg-white/[0.06] border-white/[0.16] text-white/90'
            }`}
          >
            {timeParts.dayPeriod}
          </span>
        )}
      </div>

      {/* Dynamic Timezone & Region */}
      <div className={`text-[11px] font-mono truncate ${surface.textMuted}`}>
        {locationLabel}
      </div>
    </div>
  )
}