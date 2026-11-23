'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { ColorPackage, getSurfacePackage } from '@/lib/themes/colorPackages'

export default function TerrainWallpaper({ theme }: { theme: ColorPackage }) {
  const { mode, hydrated } = useAppSelector((state) => state.theme)
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'
  const surface = getSurfacePackage(activeMode)

  const containerBg = isLight ? surface.rawBg : theme.rawPrimary
  const lineColor = isLight ? theme.rgb : '#ffffff'
  const crackOpacity = isLight ? '0.65' : '0.3'
  const filterId = isLight ? 'cracks-light' : 'cracks-dark'

  return (
    <>
      <style>{`
        .cracked-earth-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-color: ${containerBg};
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          contain: strict;
        }
        .cracked-earth {
          width: 100%;
          height: 100%;
          filter: url(#${filterId});
          transform: translateZ(0);
          opacity: ${crackOpacity};
        }
      `}</style>

      <div className="cracked-earth-container">
        <div className="cracked-earth" />
      </div>

      <svg width="0" height="0" className="absolute pointer-events-none">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="5"
            seed="10"
            result="noise"
          />
          <feColorMatrix type="luminanceToAlpha" in="noise" result="alphaNoise" />
          <feComponentTransfer in="alphaNoise" result="plates">
            <feFuncA type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feConvolveMatrix
            order="3 3"
            kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
            in="plates"
            result="edges"
          />
          <feComponentTransfer in="edges" result="invertedEdges">
            <feFuncR type="table" tableValues="1 0" />
            <feFuncG type="table" tableValues="1 0" />
            <feFuncB type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feFlood floodColor={lineColor} result="bgColor" />
          <feComposite operator="in" in="bgColor" in2="invertedEdges" />
        </filter>
      </svg>
    </>
  )
}