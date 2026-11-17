'use client'

import { useContextMenu } from '@/lib/hooks/useContextMenu'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { setWallpaper, setAccent, toggleMode, setMode } from '@/lib/features/themeSlice'
import Wallpaper from '@/components/os/Wallpaper'
import Dock from '@/components/os/Dock'
import DraggableWidget from '@/components/os/DraggableWidget'
import ClockWidget from '@/components/os/widgets/ClockWidget'
import MusicWidget from '@/components/os/widgets/MusicWidget'
import GitWidget from '@/components/os/widgets/GitWidget'
import Window from '@/components/os/Window'
import IframeApp from '@/components/os/apps/IframeApp'
import AppContent from '@/components/os/apps/AppContent'
import GitHubClientApp from '@/components/os/apps/GitHubClientApp'
import GitHubProfileApp from '@/components/os/apps/GitHubProfileApp'
import AppearanceApp from '@/components/os/apps/AppearanceApp'
import { openApp } from '@/lib/features/dockSlice'

export default function Home() {
  const dispatch = useAppDispatch()
  const { openApps } = useAppSelector((state) => state.dock)

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
    {
      id: 'apearance',
      label: 'Apearance',
      onClick: () => dispatch(openApp('appearance'))
    }
  ])

  return (
    <main
      {...desktopMenu}
      className="w-screen h-screen overflow-hidden relative  text-white select-none flex flex-col justify-between"
    >
      {/* Active Theme-Aware Wallpaper */}
      <Wallpaper />

      {/* Draggable Desktop Widgets Layer */}
      <DraggableWidget id="clock">
        <ClockWidget />
      </DraggableWidget>

      <DraggableWidget id="music">
        <MusicWidget />
      </DraggableWidget>

      <DraggableWidget id="git">
        <GitWidget />
      </DraggableWidget>



{/* 🖥️ Dynamic Windows Layer */}
      {openApps.map((appId) => {
        switch (appId) {
          case 'github':
            return (
              <Window key="github" id="github" title="GitHub Explorer" defaultWidth={750} defaultHeight={500}>
                <GitHubProfileApp />
              </Window>
            )
          case 'email':
            return (
              <Window key="email" id="email" title="Email Client" defaultWidth={600} defaultHeight={400}>
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-base">Inbox</h3>
                  <p className="opacity-70 text-xs">No new messages. Backend telemetry is nominal.</p>
                </div>
              </Window>
            )
          case 'available':
            return (
              <Window key="available" id="available" title="Available" defaultWidth={650} defaultHeight={450}>
                <IframeApp src='https://available-six.vercel.app/' title='Available' />
              </Window>
            )
          case 'profile':
            return (
              <Window key="profile" id="profile" title="User Profile" defaultWidth={600} defaultHeight={400}>
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-base">Ankur Singh</h3>
                  <p className="opacity-70 text-xs">Leafnx Technologies Founder & Full-Stack Developer.</p>
                </div>
              </Window>
            )
          case 'apps':
            return (
              <Window key="apps" id="apps" title="Applications" defaultWidth={600} defaultHeight={400}>
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-base">System Utilities</h3>
                  <p className="opacity-70 text-xs">All OS packages running smoothly.</p>
                </div>
              </Window>
            )
          case 'appearance':
            return (
              <Window key="appearance" id="appearance" title="System Settings — Appearance" defaultWidth={600} defaultHeight={450}>
                <AppearanceApp />
              </Window>
            )
          default:
            return null
        }
      })}

      {/* Bottom Center Floating Dock */}
      <Dock />
    </main>
  )
}