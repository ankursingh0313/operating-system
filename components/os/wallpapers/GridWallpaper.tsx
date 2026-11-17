'use client'

import React from 'react'
import { ColorPackage } from '@/lib/themes/colorPackages'

export default function GridWallpaper({ theme }: { theme: ColorPackage }) {
  return (
    <div 
      className="absolute inset-0 z-0 bg-[#030308] overflow-hidden pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, ${theme.rawPrimary} 1px, transparent 1px),
          linear-gradient(to bottom, ${theme.rawPrimary} 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
    </div>
  )
}