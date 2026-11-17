// components/os/Wallpaper.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

import GradientWallpaper from './wallpapers/GradientWallpaper'
import GridWallpaper from './wallpapers/GridWallpaper'
import RadarWallpaper from './wallpapers/RadarWallpaper'
import StarsWallpaper from './wallpapers/StarsWallpaper'
import GeometricWallpaper from './wallpapers/GeometricWallpaper'
import TerrainWallpaper from './wallpapers/TerrainWallpaper'
import SquaresWallpaper from './wallpapers/SquaresWallpaper'
import MeshWallpaper from './wallpapers/MeshWallpaper'
import RippleWallpaper from './wallpapers/RippleWallpaper'
import MosaicWallpaper from './wallpapers/MosaicWallpaper'

export default function Wallpaper() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { accent, wallpaper } = useAppSelector((state) => state.theme)

  if (!isMounted) {
    return <div className="absolute inset-0 z-0 bg-[#030308] pointer-events-none" />
  }

  const theme = COLOR_PACKAGES[accent]

  switch (wallpaper) {
    case 'gradient':
      return <GradientWallpaper theme={theme} />
    case 'grid':
      return <GridWallpaper theme={theme} />
    case 'radar':
      return <RadarWallpaper theme={theme} />
    case 'stars':
      return <StarsWallpaper theme={theme} />
    case 'geometric':
      return <GeometricWallpaper theme={theme} />
    case 'terrain':
      return <TerrainWallpaper theme={theme} />
    case 'squares':
      return <SquaresWallpaper theme={theme} />
    case 'mesh':
      return <MeshWallpaper theme={theme} />
    case 'ripple':
      return <RippleWallpaper theme={theme} />
    case 'mosaic':
      return <MosaicWallpaper theme={theme} />
    default:
      return <GradientWallpaper theme={theme} />
  }
}