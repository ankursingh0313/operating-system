// components/ThemeHydrator.tsx
'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { hydrateTheme, loadThemeState } from '@/lib/features/themeSlice'
import { hydrateWidgets } from '@/lib/features/widgetsSlice'

export default function ThemeHydrator() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // 1. Hydrate Theme
    const savedTheme = loadThemeState()
    if (savedTheme) {
      dispatch(hydrateTheme(savedTheme))
    } else {
      dispatch(hydrateTheme({ hydrated: true }))
    }

    // 2. Hydrate Widgets from localStorage safely on client mount
    const savedWidgets = localStorage.getItem('os_widgets_state')
    if (savedWidgets) {
      try {
        const parsed = JSON.parse(savedWidgets)
        dispatch(hydrateWidgets(parsed))
      } catch (e) {
        console.error('Failed to parse saved widgets', e)
      }
    } else if (typeof window !== 'undefined') {
      // Set responsive default positions based on actual window width
      const defaultX = window.innerWidth - 320
      dispatch(hydrateWidgets({
        widgets: {
          clock: { id: 'clock', x: defaultX, y: 40, isOpen: true, zIndex: 1 },
          music: { id: 'music', x: defaultX, y: 190, isOpen: true, zIndex: 2 },
          git: { id: 'git', x: defaultX, y: 380, isOpen: true, zIndex: 3 },
        },
        highestZIndex: 3,
      }))
    }
  }, [dispatch])

  return null
}