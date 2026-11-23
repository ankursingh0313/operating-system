'use client'

import React, { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'

const STORAGE_KEY = 'dossieros_scratchpad_note_v1'
const MAX_CHARS = 150

export default function NotesWidget() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        setNote(saved.slice(0, MAX_CHARS))
      }
    } catch {
      // Ignore storage access errors in restricted/private contexts
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value.slice(0, MAX_CHARS)
    setNote(nextValue)
    try {
      window.localStorage.setItem(STORAGE_KEY, nextValue)
    } catch {
      // Ignore storage quota/access errors
    }
  }

  const handleClear = () => {
    setNote('')
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
    setCleared(true)
    setTimeout(() => setCleared(false), 1200)
  }

  const handleCopy = async () => {
    if (!note) return
    try {
      await navigator.clipboard.writeText(note)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // Fallback if clipboard API is unavailable
    }
  }

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')
  const isAtLimit = note.length >= MAX_CHARS

  return (
    <div
      className={`flex flex-col justify-between p-4 w-[350px] h-[175px] gap-2 ${surface.textPrimary}`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold truncate ${surface.textMuted}`}
          >
            Scratchpad
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!note}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition disabled:opacity-35 cursor-pointer ${surface.subtleBg} ${surface.cardHoverBg} ${surface.borderSubtle} ${surface.textSecondary}`}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!note}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition disabled:opacity-35 cursor-pointer ${surface.subtleBg} ${surface.cardHoverBg} ${surface.borderSubtle} ${surface.textSecondary}`}
          >
            {cleared ? 'Cleared' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Editable Note Area */}
      <textarea
        value={note}
        onChange={handleChange}
        maxLength={MAX_CHARS}
        placeholder="Jot down quick notes..."
        aria-label="Scratchpad quick notes"
        className={`flex-1 min-h-0 w-full rounded-lg border px-2.5 py-1.5 text-sm leading-relaxed resize-none outline-none transition-colors ${surface.textPrimary} ${
          isLight
            ? 'bg-white/75 border-slate-200/90 placeholder:text-slate-400'
            : 'bg-black/25 border-white/[0.07] placeholder:text-slate-500'
        }`}
        style={{
          caretColor: theme.rgb,
          borderColor: isAtLimit
            ? `rgba(${accentRgbClean}, 0.65)`
            : undefined,
        }}
      />

      {/* Footer */}
      <div
        className={`flex items-center justify-between text-[10px] font-mono shrink-0 ${surface.textMuted}`}
      >
        <span>Local save</span>
        <span
          style={isAtLimit ? { color: theme.rgb } : undefined}
          className={isAtLimit ? 'font-semibold' : undefined}
        >
          {note.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  )
}