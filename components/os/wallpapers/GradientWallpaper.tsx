'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { ColorPackage, getSurfacePackage } from '@/lib/themes/colorPackages'

export default function GradientWallpaper({ theme }: { theme: ColorPackage }) {
  const { mode, hydrated } = useAppSelector((state) => state.theme)
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'
  const surface = getSurfacePackage(activeMode)

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: isLight ? surface.rawBg : '#030712' }}
    >
      <div
        className={`absolute w-[700px] h-[700px] rounded-full bg-gradient-to-tr ${theme.gradient} ${
          isLight ? 'opacity-20' : 'opacity-25'
        } blur-[110px] will-change-transform animate-pulse`}
      />
      <div
        className={`absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full blur-[80px] ${
          isLight ? 'bg-cyan-500/15' : 'bg-cyan-600/10'
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full blur-[90px] ${
          isLight ? 'bg-purple-500/15' : 'bg-purple-600/10'
        }`}
      />
    </div>
  )
}