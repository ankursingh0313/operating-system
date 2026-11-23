'use client'

import React from 'react'
import { COLOR_PACKAGES, AccentColor } from '@/lib/themes/colorPackages'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { setAccent, toggleMode, setWallpaper, WallpaperType } from '@/lib/features/themeSlice'

// Import all your wallpaper components
import GradientWallpaper from '../wallpapers/GradientWallpaper'
import GridWallpaper from '../wallpapers/GridWallpaper'
import RadarWallpaper from '../wallpapers/RadarWallpaper'
import StarsWallpaper from '../wallpapers/StarsWallpaper'
import GeometricWallpaper from '../wallpapers/GeometricWallpaper'
import TerrainWallpaper from '../wallpapers/TerrainWallpaper'
import SquaresWallpaper from '../wallpapers/SquaresWallpaper'
import MeshWallpaper from '../wallpapers/MeshWallpaper'
import RippleWallpaper from '../wallpapers/RippleWallpaper'
import MosaicWallpaper from '../wallpapers/MosaicWallpaper'

const WALLPAPERS: Array<{ id: WallpaperType; name: string }> = [
  { id: 'gradient', name: 'Glowing Gradient' },
  { id: 'stars', name: 'Starry Night' },
  { id: 'grid', name: 'Cybernetic Grid' },
  { id: 'radar', name: 'Radar Scanner' },
  { id: 'geometric', name: 'Geometric Pattern' },
  { id: 'terrain', name: 'Cracked Earth' },
  { id: 'squares', name: 'Pattern Squares' },
  { id: 'mesh', name: 'Modern Mesh' },
  { id: 'ripple', name: 'Gradient Ripple' },
  { id: 'mosaic', name: 'Geometric Mosaic' },
]

export default function AppearanceApp() {
  const dispatch = useAppDispatch()
  const { accent, mode, wallpaper, hydrated } = useAppSelector((state) => state.theme)

  const activeAccent: AccentColor = hydrated ? accent : 'blue'
  const activeWallpaper: WallpaperType = hydrated ? wallpaper : 'squares'
  const activeMode: 'dark' | 'light' = hydrated ? mode : 'dark'
  const currentTheme = COLOR_PACKAGES[activeAccent]

  const accentKeys = Object.keys(COLOR_PACKAGES) as AccentColor[]
  const isLight = activeMode === 'light'

  const renderWallpaperPreview = (id: WallpaperType) => {
    const previewContainerStyle = {
      transform: 'scale(0.2)',
      width: '500%',
      height: '500%',
      transformOrigin: 'top left',
      position: 'absolute' as const,
      inset: 0,
      pointerEvents: 'none' as const,
    }

    let wallpaperComponent = null

    switch (id) {
      case 'gradient':
        wallpaperComponent = <GradientWallpaper theme={currentTheme} />
        break
      case 'grid':
        wallpaperComponent = <GridWallpaper theme={currentTheme} />
        break
      case 'radar':
        wallpaperComponent = <RadarWallpaper theme={currentTheme} />
        break
      case 'stars':
        wallpaperComponent = <StarsWallpaper theme={currentTheme} />
        break
      case 'geometric':
        wallpaperComponent = <GeometricWallpaper theme={currentTheme} />
        break
      case 'terrain':
        wallpaperComponent = <TerrainWallpaper theme={currentTheme} />
        break
      case 'squares':
        wallpaperComponent = <SquaresWallpaper theme={currentTheme} />
        break
      case 'mesh':
        wallpaperComponent = <MeshWallpaper theme={currentTheme} />
        break
      case 'ripple':
        wallpaperComponent = <RippleWallpaper theme={currentTheme} />
        break
      case 'mosaic':
        wallpaperComponent = <MosaicWallpaper theme={currentTheme} />
        break
      default:
        wallpaperComponent = <GradientWallpaper theme={currentTheme} />
    }

    return <div style={previewContainerStyle}>{wallpaperComponent}</div>
  }

  return (
    <div
      className={`flex flex-col h-full p-6 gap-6 overflow-y-auto select-none transition-colors duration-200 ${
        isLight
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#1e1e2e] text-gray-200'
      }`}
    >
      <div>
        <h2 className={`text-lg font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>
          Appearance Settings
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Customize the look and feel of your portfolio OS environment.
        </p>
      </div>

      {/* Accent Color Picker */}
      <div
        className={`flex flex-col gap-3 p-4 rounded-xl border ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-white/[0.03] border-white/10'
        }`}
      >
        <span
          className={`text-xs font-semibold uppercase tracking-wider font-mono ${
            isLight ? 'text-slate-500' : 'text-gray-400'
          }`}
        >
          Accent Color
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {accentKeys.map((key) => {
            const pkg = COLOR_PACKAGES[key]
            const isSelected = activeAccent === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => dispatch(setAccent(key))}
                className={`w-8 h-8 rounded-full transition transform hover:scale-110 flex items-center justify-center border-2 cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'border-slate-900 scale-110 shadow-lg'
                      : 'border-white scale-110 shadow-lg'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: pkg.rgb }}
                title={pkg.name}
              >
                {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Wallpaper Grid Section with Live Previews */}
      <div
        className={`flex flex-col gap-3 p-4 rounded-xl border ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-white/[0.03] border-white/10'
        }`}
      >
        <span
          className={`text-xs font-semibold uppercase tracking-wider font-mono ${
            isLight ? 'text-slate-500' : 'text-gray-400'
          }`}
        >
          Desktop Wallpaper
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WALLPAPERS.map((wall) => {
            const isSelected = activeWallpaper === wall.id

            return (
              <div
                key={wall.id}
                onClick={() => dispatch(setWallpaper(wall.id))}
                className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition transform hover:scale-[1.02] ${
                  isSelected
                    ? isLight
                      ? 'border-slate-900 shadow-md'
                      : 'border-white shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <div className="h-50 w-full bg-gray-950 relative overflow-hidden">
                  {renderWallpaperPreview(wall.id)}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition pointer-events-none" />
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm px-2 py-1 flex justify-between items-center z-10">
                  <span className="text-[11px] font-medium text-white truncate">{wall.name}</span>
                  {isSelected && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      Active
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dark / Light Mode Toggle */}
      <div
        className={`flex items-center justify-between p-4 rounded-xl border ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-white/[0.03] border-white/10'
        }`}
      >
        <div className="flex flex-col">
          <span
            className={`text-xs font-semibold uppercase tracking-wider font-mono ${
              isLight ? 'text-slate-500' : 'text-gray-400'
            }`}
          >
            Window Theme Mode
          </span>
          <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
            Currently running in {activeMode} mode
          </span>
        </div>
        <button
          type="button"
          onClick={() => dispatch(toggleMode())}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition border cursor-pointer ${
            isLight
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-900'
              : 'bg-white/10 hover:bg-white/20 border-white/10'
          }`}
          style={{ color: currentTheme.rgb }}
        >
          Toggle {activeMode === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>
    </div>
  )
}