'use client'

import { useContextMenu } from '@/lib/hooks/useContextMenu'
import { useAppDispatch } from '@/lib/hooks'
import { setWallpaper, setAccent, toggleMode, setMode } from '@/lib/features/themeSlice'
import Wallpaper from '@/components/os/Wallpaper'

export default function Home() {
  const dispatch = useAppDispatch()

  // Context menu to test live theme & wallpaper switching
  const desktopMenu = useContextMenu([
    {
      id: 'wp-squares',
      label: 'Wallpaper: Pattern Squares',
      onClick: () => dispatch(setWallpaper('squares')),
    },
    {
      id: 'wp-gradient',
      label: 'Wallpaper: Glowing Orbs',
      onClick: () => dispatch(setWallpaper('gradient')),
    },
    {
      id: 'wp-grid',
      label: 'Wallpaper: Cyber Grid',
      onClick: () => dispatch(setWallpaper('grid')),
    },
    {
      id: 'wp-radar',
      label: 'Wallpaper: Radar Scanner',
      onClick: () => dispatch(setWallpaper('radar')),
    },
    {
      id: 'wp-stars',
      label: 'Wallpaper: Starfield',
      onClick: () => dispatch(setWallpaper('stars')),
    },
    {
      id: 'wp-terrain',
      label: 'Wallpaper: Earth Terrain',
      onClick: () => dispatch(setWallpaper('terrain')),
    },
    {
      id: 'wp-geometric',
      label: 'Wallpaper: Geometric Hexagons',
      onClick: () => dispatch(setWallpaper('geometric')),
    },
    {
      id: 'wp-mesh',
      label: 'Wallpaper: Geometric Mesh',
      onClick: () => dispatch(setWallpaper('mesh')),
    },
    {
      id: 'wp-ripple',
      label: 'Wallpaper: Gradient Ripple',
      onClick: () => dispatch(setWallpaper('ripple')),
    },
    {
      id: 'wp-mosaic',
      label: 'Wallpaper: Mosaic Tiles',
      onClick: () => dispatch(setWallpaper('mosaic')),
    },
    {
      id: 'theme-red',
      label: 'Set Accent: Red',
      dividerAbove: true,
      onClick: () => dispatch(setAccent('red')),
    },
    {
      id: 'theme-green',
      label: 'Set Accent: Green',
      onClick: () => dispatch(setAccent('green')),
    },
    {
      id: 'theme-blue',
      label: 'Set Accent: Blue',
      onClick: () => dispatch(setAccent('blue')),
    },
    {
      id: 'theme-purple',
      label: 'Set Accent: Purple',
      onClick: () => dispatch(setAccent('purple')),
    },
    {
      id: 'theme-pink',
      label: 'Set Accent: Pink',
      onClick: () => dispatch(setAccent('pink')),
    },
    {
      id: 'theme-orange',
      label: 'Set Accent: Orange',
      onClick: () => dispatch(setAccent('orange')),
    },
    {
      id: 'theme-cyan',
      label: 'Set Accent: Cyan',
      onClick: () => dispatch(setAccent('cyan')),
    },
    {
      id: 'theme-indigo',
      label: 'Set Accent: Indigo',
      onClick: () => dispatch(setAccent('indigo')),
    },
    {
      id: 'theme-slate',
      label: 'Set Accent: Slate',
      onClick: () => dispatch(setAccent('slate')),
    },
    {
      id: 'theme-rose',
      label: 'Set Accent: Rose',
      onClick: () => dispatch(setAccent('rose')),
    },
    {
      id: 'theme-light',
      label: 'Set Mode: Light',
      dividerAbove: true,
      onClick: () => dispatch(setMode('light')),
    },
    {
      id: 'theme-dark',
      label: 'Set Mode: Dark',
      onClick: () => dispatch(setMode('dark')), 
    },
    {
      id: 'toggle-mode',
      label: 'Toggle Dark/Light Mode',
      dividerAbove: true,
      onClick: () => dispatch(toggleMode()),
    },
  ])

  return (
    <main
      {...desktopMenu}
      className="w-screen h-screen overflow-hidden relative  text-white select-none flex flex-col justify-between"
    >
      {/* Active Theme-Aware Wallpaper */}
      <Wallpaper />
    </main>
  )
}