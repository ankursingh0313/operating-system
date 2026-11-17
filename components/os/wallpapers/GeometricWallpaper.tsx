'use client'

import React from 'react'
import { ColorPackage } from '@/lib/themes/colorPackages'

export default function GeometricWallpaper({ theme }: { theme: ColorPackage }) {
  return (
    <>
      <style>{`
        .geometric-wallpaper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle farthest-side at 0% 50%, #18181b 23.5%, transparent 0) 21px 30px,
                      radial-gradient(circle farthest-side at 0% 50%, ${theme.rawPrimary} 24%, transparent 0) 19px 30px,
                      linear-gradient(#18181b 14%, transparent 0, transparent 85%, #18181b 0) 0 0,
                      linear-gradient(150deg, #18181b 24%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 26%, transparent 0, transparent 74%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 76%, #18181b 0) 0 0,
                      linear-gradient(30deg, #18181b 24%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 26%, transparent 0, transparent 74%, ${theme.rawPrimary} 0, ${theme.rawPrimary} 76%, #18181b 0) 0 0,
                      linear-gradient(90deg, ${theme.rawPrimary} 2%, #18181b 0, #18181b 98%, ${theme.rawPrimary} 0%) 0 0 #18181b;
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