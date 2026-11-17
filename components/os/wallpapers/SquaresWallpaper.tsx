'use client'

import React from 'react'
import { ColorPackage } from '@/lib/themes/colorPackages'

export default function SquaresWallpaper({ theme }: { theme: ColorPackage }) {
  return (
    <>
      <style>{`
        .pattern-square {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background:
            repeating-linear-gradient(45deg, #0000 calc(-650% / 13) calc(50% / 13), #100f0f 0 calc(100% / 13), #0000 0 calc(150% / 13), #100f0f 0 calc(200% / 13), #0000 0 calc(250% / 13), #100f0f 0 calc(300% / 13)) 0px 0px,
            repeating-linear-gradient(45deg, #0000 calc(-650% / 13) calc(50% / 13), #100f0f 0 calc(100% / 13), #0000 0 calc(150% / 13), #100f0f 0 calc(200% / 13), #0000 0 calc(250% / 13), #100f0f 0 calc(300% / 13)) 32px 32px,
            repeating-linear-gradient(-45deg, #0000 calc(-650% / 13) calc(50% / 13), #100f0f 0 calc(100% / 13), #0000 0 calc(150% / 13), #100f0f 0 calc(200% / 13), #0000 0 calc(250% / 13), #100f0f 0 calc(300% / 13)) 0px 0px,
            repeating-linear-gradient(-45deg, ${theme.rawPrimary} calc(-650% / 13) calc(50% / 13), #100f0f 0 calc(100% / 13), ${theme.rawPrimary} 0 calc(150% / 13), #100f0f 0 calc(200% / 13), ${theme.rawPrimary} 0 calc(250% / 13), #100f0f 0 calc(300% / 13)) 32px 32px #1e1e1e;
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