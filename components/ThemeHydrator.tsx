'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { hydrateTheme, loadThemeState } from '@/lib/features/themeSlice'
import { hydrateWidgets } from '@/lib/features/widgetsSlice'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'

export default function ThemeHydrator() {
  const dispatch = useAppDispatch()
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)

  // 1. Hydrate theme & widgets once on mount
  useEffect(() => {
    const savedTheme = loadThemeState()
    if (savedTheme) {
      dispatch(hydrateTheme(savedTheme))
    } else {
      dispatch(hydrateTheme({ hydrated: true }))
    }

    const savedWidgets = localStorage.getItem('os_widgets_state')
    if (savedWidgets) {
      try {
        const parsed = JSON.parse(savedWidgets)
        dispatch(hydrateWidgets(parsed))
      } catch (e) {
        console.error('Failed to parse saved widgets', e)
      }
    } else if (typeof window !== 'undefined') {
      const defaultX = Math.max(20, window.innerWidth - 320)
      dispatch(
        hydrateWidgets({
          widgets: {
            clock: { id: 'clock', x: defaultX, y: 40, isOpen: true, zIndex: 1 },
            music: { id: 'music', x: defaultX, y: 190, isOpen: true, zIndex: 2 },
            git: { id: 'git', x: defaultX, y: 380, isOpen: true, zIndex: 3 },
          },
          highestZIndex: 3,
        })
      )
    }
  }, [dispatch])

  // 2. Apply global light/dark surface & accent variables to <html>
  useEffect(() => {
    if (typeof document === 'undefined') return

    const activeAccent = hydrated ? accent : 'blue'
    const activeMode = hydrated ? mode : 'dark'
    const colorPkg = COLOR_PACKAGES[activeAccent]
    const surfacePkg = getSurfacePackage(activeMode)

    const root = document.documentElement
    root.dataset.themeMode = surfacePkg.mode
    root.classList.toggle('dark', surfacePkg.mode === 'dark')

    root.style.setProperty('--os-bg', surfacePkg.rawBg)
    root.style.setProperty('--os-surface', surfacePkg.rawSurface)
    root.style.setProperty('--os-text', surfacePkg.rawText)
    root.style.setProperty('--os-border', surfacePkg.rawBorder)
    root.style.setProperty('--os-accent', colorPkg.rgb)
    root.style.setProperty('--os-accent-glow', colorPkg.rawGlow)
  }, [accent, mode, hydrated])

  return null
}