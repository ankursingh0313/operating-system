'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { ColorPackage, getSurfacePackage } from '@/lib/themes/colorPackages'

export default function GridWallpaper({ theme }: { theme: ColorPackage }) {
  const { mode, hydrated } = useAppSelector((state) => state.theme)
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'
  const surface = getSurfacePackage(activeMode)

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-300"
      style={{
        backgroundColor: isLight ? surface.rawBg : '#030308',
        backgroundImage: `
          linear-gradient(to right, ${theme.rawPrimary} 1px, transparent 1px),
          linear-gradient(to bottom, ${theme.rawPrimary} 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${
          isLight ? 'from-slate-100' : 'from-gray-950'
        }`}
      />
    </div>
  )
}