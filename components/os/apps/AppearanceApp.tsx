'use client'

import React from 'react'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { setAccent, toggleMode, setMode, setWallpaper } from '@/lib/features/themeSlice'
import type { AccentColor } from '@/lib/themes/colorPackages'

export default function AppearanceApp() {
  const dispatch = useAppDispatch()
  const { accent, mode, wallpaper, hydrated } = useAppSelector((state) => state.theme)
  const currentTheme = COLOR_PACKAGES[hydrated ? accent : 'blue']

  // Explicitly typed using the imported AccentColor type
  const accents: { name: AccentColor; label: string; color: string }[] = [
    { name: 'blue', label: 'Blue', color: '#3b82f6' },
    { name: 'red', label: 'Purple', color: '#a855f7' },
    { name: 'green', label: 'Emerald', color: '#10b981' },
    { name: 'purple', label: 'Rose', color: '#f43f5e' },
    { name: 'pink', label: 'Amber', color: '#f59e0b' },
  ]

  // Wallpaper choices
  const wallpapers = [
    { id: 'wallpaper-1', name: 'Abstract Dark', url: '/wallpapers/wall-1.jpg' },
    { id: 'wallpaper-2', name: 'Neon Cyberpunk', url: '/wallpapers/wall-2.jpg' },
    { id: 'wallpaper-3', name: 'Minimal Gradient', url: '/wallpapers/wall-3.jpg' },
  ]

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] text-gray-200 p-6 gap-6 overflow-y-auto select-none">
      <div>
        <h2 className="text-lg font-bold text-white">Appearance Settings</h2>
        <p className="text-xs text-gray-400">Customize the look and feel of your portfolio OS environment.</p>
      </div>

      {/* Accent Color Picker */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">Accent Color</span>
        <div className="flex items-center gap-3">
          {accents.map((item) => (
            <button
              key={item.name}
              onClick={() => dispatch(setAccent(item.name))}
              className={`w-8 h-8 rounded-full transition transform hover:scale-110 flex items-center justify-center border-2 ${
                accent === item.name ? 'border-white scale-110 shadow-lg' : 'border-transparent'
              }`}
              style={{ backgroundColor: item.color }}
              title={item.label}
            >
              {accent === item.name && <span className="w-2 h-2 rounded-full bg-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Dark / Light Mode Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">Window Theme Mode</span>
          <span className="text-xs text-gray-300">Currently running in {mode} mode</span>
        </div>
        <button
          onClick={() => dispatch(toggleMode())}
          className="px-4 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition border border-white/10"
          style={{ color: currentTheme.rgb }}
        >
          Toggle {mode === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {/* System Information Card */}
      <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
        <span className="font-semibold uppercase tracking-wider text-gray-400">Environment Spec</span>
        <div className="flex justify-between text-gray-300 py-1 border-b border-white/5">
          <span>Workstation OS</span>
          <span>Fedora Linux / Web OS</span>
        </div>
        <div className="flex justify-between text-gray-300 py-1">
          <span>Active Engine</span>
          <span>Next.js 14+ App Router</span>
        </div>
      </div>
    </div>
  )
}