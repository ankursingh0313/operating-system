'use client'

import React, { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

const BOOT_STEPS = [
  'Initializing DossierOS kernel...',
  'Mounting workspace & widgets...',
  'Loading user preferences...',
  'Starting desktop environment...',
]

export default function BootScreen() {
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const theme = COLOR_PACKAGES[activeAccent]

  const [progress, setProgress] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [fadingOut, setFadingOut] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const duration = 1600
    const intervalMs = 30
    const startTime = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)

      const nextStep = Math.min(
        BOOT_STEPS.length - 1,
        Math.floor((pct / 100) * BOOT_STEPS.length)
      )
      setStepIndex(nextStep)

      if (pct >= 100) {
        clearInterval(timer)
        setFadingOut(true)
        setTimeout(() => setDone(true), 450)
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [])

  if (done) return null

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#07090f] flex flex-col items-center justify-center select-none transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle ambient glow using active accent */}
      <div
        className="w-72 h-72 rounded-full blur-[110px] opacity-25 pointer-events-none absolute transition-colors duration-300"
        style={{ backgroundColor: theme.rgb }}
      />

      <div className="relative flex flex-col items-center gap-6 w-64 sm:w-72">
        {/* OS Logo / Emblem */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl flex items-center justify-center shadow-2xl transition-shadow duration-300"
            style={{
              boxShadow: `0 0 35px -8px ${theme.rgb}`,
            }}
          >
            <span className="text-2xl font-bold tracking-tighter text-white">
              D<span className="transition-colors duration-300" style={{ color: theme.rgb }}>OS</span>
            </span>
          </div>

          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-wide text-white">
              DossierOS
            </h1>
            <p className="text-[11px] text-white/45 tracking-widest uppercase mt-0.5">
              v1.0 • Web Desktop
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: theme.rgb,
                boxShadow: `0 0 12px ${theme.rgb}`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/50 font-mono">
            <span className="truncate">{BOOT_STEPS[stepIndex]}</span>
            <span className="shrink-0 ml-2">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}