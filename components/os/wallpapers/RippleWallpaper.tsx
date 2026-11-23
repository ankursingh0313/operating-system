'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { ColorPackage, getSurfacePackage } from '@/lib/themes/colorPackages'

export default function RippleWallpaper({ theme }: { theme: ColorPackage }) {
  const { mode, hydrated } = useAppSelector((state) => state.theme)
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'
  const surface = getSurfacePackage(activeMode)

  const c2Color = isLight ? surface.rawBg : '#1b1b3a'
  const rimShade = isLight ? 'rgba(15, 23, 42, 0.14)' : '#0008'

  return (
    <>
      <style>{`
        .theme-ripple-wallpaper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          --s: 100px;
          --c1: ${theme.rgb};
          --c2: ${c2Color};
          --_g: var(--c2) 6% 14%, var(--c1) 16% 24%, var(--c2) 26% 34%,
            var(--c1) 36% 44%, var(--c2) 46% 54%, var(--c1) 56% 64%, var(--c2) 66% 74%,
            var(--c1) 76% 84%, var(--c2) 86% 94%;
          background: radial-gradient(100% 100% at 100% 0, var(--c1) 4%, var(--_g), ${rimShade} 96%, #0000),
            radial-gradient(100% 100% at 0 100%, #0000, ${rimShade} 4%, var(--_g), var(--c1) 96%) var(--c1);
          background-size: var(--s) var(--s);
          z-index: 0;
          pointer-events: none;
          contain: strict;
        }
      `}</style>
      <div className="theme-ripple-wallpaper" />
    </>
  )
}