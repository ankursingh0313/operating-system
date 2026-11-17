'use client'

import React from 'react'
import { ColorPackage } from '@/lib/themes/colorPackages'

export default function MeshWallpaper({ theme }: { theme: ColorPackage }) {
  return (
    <>
      <style>{`
        .theme-mesh-wallpaper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-color: #0f172a;
          background-image:
            linear-gradient(45deg, ${theme.rawPrimary} 25%, transparent 25%, transparent 75%, ${theme.rawPrimary} 75%),
            linear-gradient(-45deg, ${theme.rawPrimary} 25%, transparent 25%, transparent 75%, ${theme.rawPrimary} 75%),
            linear-gradient(45deg, transparent 40%, ${theme.rawPrimary} 40%, ${theme.rawPrimary} 60%, transparent 60%),
            linear-gradient(-45deg, transparent 40%, ${theme.rawPrimary} 40%, ${theme.rawPrimary} 60%, transparent 60%),
            radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
          background-size: 60px 60px, 60px 60px, 120px 120px, 120px 120px, 100% 100%;
          background-position: 0 0, 30px 30px, 0 0, 60px 60px, 0 0;
          z-index: 0;
          pointer-events: none;
          contain: strict;
        }
      `}</style>
      <div className="theme-mesh-wallpaper" />
    </>
  )
}