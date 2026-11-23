'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { ColorPackage, getSurfacePackage } from '@/lib/themes/colorPackages'

export default function GeometricWallpaper({ theme }: { theme: ColorPackage }) {
  const { mode, hydrated } = useAppSelector((state) => state.theme)
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'
  const surface = getSurfacePackage(activeMode)

  const baseFill = isLight ? surface.rawBg : '#18181b'

  return (
    <>
      <style>{`
        .geometric-wallpaper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle farthest-side at 0% 50%, ${baseFill} 23.5%, transparent 0) 21px 30px,
                      radial-gradient(circle farthest-side at 0% 50%, ${theme.rawPrimary} 24%, transparent 0) 19px 30px,
                      linear-gradient(${baseFill} 14%, transparent 0, transparent 85%, ${baseFill} 0) 0 0,
                      linear-gradient(150deg, ${baseFill} 24%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 26%, transparent 0, transparent 74%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 76%, ${baseFill} 0) 0 0,
                      linear-gradient(30deg, ${baseFill} 24%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 26%, transparent 0, transparent 74%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 76%, ${baseFill} 0) 0 0,
                      linear-gradient(90deg, ${theme.rawPrimary} 2%, ${baseFill} 0, ${baseFill} 98%, ${theme.rawPrimary} 0%) 0 0 ${baseFill};
          background-size: 40px 60px;
          z-index: 0;
          pointer-events: none;
          contain: strict;
        }
      `}</style>
      <div className="geometric-wallpaper" />
    </>
  )
}