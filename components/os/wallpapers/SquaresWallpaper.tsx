'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { ColorPackage, getSurfacePackage } from '@/lib/themes/colorPackages'

export default function SquaresWallpaper({ theme }: { theme: ColorPackage }) {
  const { mode, hydrated } = useAppSelector((state) => state.theme)
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'
  const surface = getSurfacePackage(activeMode)

  const stripeTone = isLight ? '#e2e8f0' : '#100f0f'
  const baseTone = isLight ? surface.rawBg : '#1e1e1e'

  return (
    <>
      <style>{`
        .pattern-square {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background:
            repeating-linear-gradient(45deg, #0000 calc(-650% / 13) calc(50% / 13), ${stripeTone} 0 calc(100% / 13), #0000 0 calc(150% / 13), ${stripeTone} 0 calc(200% / 13), #0000 0 calc(250% / 13), ${stripeTone} 0 calc(300% / 13)) 0px 0px,
            repeating-linear-gradient(45deg, #0000 calc(-650% / 13) calc(50% / 13), ${stripeTone} 0 calc(100% / 13), #0000 0 calc(150% / 13), ${stripeTone} 0 calc(200% / 13), #0000 0 calc(250% / 13), ${stripeTone} 0 calc(300% / 13)) 32px 32px,
            repeating-linear-gradient(-45deg, #0000 calc(-650% / 13) calc(50% / 13), ${stripeTone} 0 calc(100% / 13), #0000 0 calc(150% / 13), ${stripeTone} 0 calc(200% / 13), #0000 0 calc(250% / 13), ${stripeTone} 0 calc(300% / 13)) 0px 0px,
            repeating-linear-gradient(-45deg, ${theme.rawPrimary} calc(-650% / 13) calc(50% / 13), ${stripeTone} 0 calc(100% / 13), ${theme.rawPrimary} 0 calc(150% / 13), ${stripeTone} 0 calc(200% / 13), ${theme.rawPrimary} 0 calc(250% / 13), ${stripeTone} 0 calc(300% / 13)) 32px 32px ${baseTone};
          background-size: 64px 64px;
          z-index: 0;
          pointer-events: none;
          contain: strict;
        }
      `}</style>
      <div className="pattern-square" />
    </>
  )
}