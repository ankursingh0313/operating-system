'use client'

import React from 'react'
import { ColorPackage } from '@/lib/themes/colorPackages'

export default function TerrainWallpaper({ theme }: { theme: ColorPackage }) {
  return (
    <>
      <style>{`
        .cracked-earth-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-color: ${theme.rawPrimary};
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          contain: strict;
        }
        .cracked-earth {
          width: 100%;
          height: 100%;
          filter: url(#cracks);
          transform: translateZ(0);
          opacity: 0.3;
        }
      `}</style>

      <div className="cracked-earth-container">
        <div className="cracked-earth"></div>
      </div>

      <svg width="0" height="0" className="absolute pointer-events-none">
        <filter id="cracks" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" seed="10" result="noise" />
          <feColorMatrix type="luminanceToAlpha" in="noise" result="alphaNoise" />
          <feComponentTransfer in="alphaNoise" result="plates">
            <feFuncA type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feConvolveMatrix order="3 3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" in="plates" result="edges" />
          <feComponentTransfer in="edges" result="invertedEdges">
            <feFuncR type="table" tableValues="1 0" />
            <feFuncG type="table" tableValues="1 0" />
            <feFuncB type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feFlood floodColor="#fff" result="bgColor" />
          <feComposite operator="in" in="bgColor" in2="invertedEdges" />
        </filter>
      </svg>
    </>
  )
}