'use client'

import { useContextMenu } from '@/lib/hooks/useContextMenu'
import { useAppDispatch } from '@/lib/hooks'
import { setWallpaper, setAccent, toggleMode } from '@/lib/features/themeSlice'
import Wallpaper from '@/components/os/Wallpaper'

export default function Home() {
  const dispatch = useAppDispatch()

  // Context menu to test live theme & wallpaper switching
  const desktopMenu = useContextMenu([
    {
      id: 'wp-matrix',
      label: 'Wallpaper: Matrix Math',
      onClick: () => dispatch(setWallpaper('matrix')),
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