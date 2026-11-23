'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { openApp } from '@/lib/features/dockSlice'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import Image from 'next/image'

interface AppItem {
  id: string
  name: string
  icon: string
}

const APP_REGISTRY: Record<string, AppItem> = {
  browser: { id: 'email', name: 'Email', icon: '/icons/email/emailIcon-2.png' },
  explorer: { id: 'github', name: 'GitHub', icon: '/icons/socials/gitIcon-1.png' },
  settings: { id: 'available', name: 'Available', icon: '/icons/available/Available.png' },
  code: { id: 'profile', name: 'Profile', icon: '/icons/profile/Profile.png' },
  notes: { id: 'apps', name: 'Apps', icon: '/icons/apps/apps-2.png' },
}

const UNPINNED_APP_META: Record<string, { name: string; icon: string }> = {
  terminal: {
    name: 'Terminal',
    icon: '/icons/terminal.png',
  },
  widgets: {
    name: 'Widget',
    icon: '/icons/widgetsIcon.png',
  },
  appearance: {
    name: 'Appearance',
    icon: '/icons/themesIcon.png',
  },
}

const LEAVE_COLLAPSE_DELAY_MS = 1000

export default function Dock() {
  const dispatch = useAppDispatch()
  const [isMounted, setIsMounted] = useState(false)
  const [isDockHovered, setIsDockHovered] = useState(false)
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const { dockApps, openApps, maximizedApps, focusedApp } = useAppSelector(
    (state) => state.dock
  )

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'
  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  // Pinned app IDs derived from dockApps
  const pinnedAppIds = new Set(
    dockApps
      .map((dockKey) => APP_REGISTRY[dockKey]?.id)
      .filter((id): id is string => Boolean(id))
  )

  // Non-pinned apps that are currently open (automatically disappears on closeApp)
  const unpinnedOpenApps: AppItem[] = openApps
    .filter((appId) => !pinnedAppIds.has(appId))
    .map((appId) => {
      const meta = UNPINNED_APP_META[appId]
      return {
        id: appId,
        name: meta?.name ?? appId.charAt(0).toUpperCase() + appId.slice(1),
        icon: meta?.icon ?? '/icons/apps/apps-2.png',
      }
    })

  // Collapse into a slim line only when the currently focused app is open & fullscreen
  const isFocusedMaximized =
    Boolean(focusedApp) &&
    openApps.includes(focusedApp!) &&
    maximizedApps.includes(focusedApp!)

  const isCollapsed = isFocusedMaximized && !isDockHovered

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
  }, [])

  const handleZoneEnter = useCallback(() => {
    clearCollapseTimer()
    if (isFocusedMaximized) {
      setIsDockHovered(true)
    }
  }, [clearCollapseTimer, isFocusedMaximized])

  const handleZoneLeave = useCallback(() => {
    clearCollapseTimer()
    if (!isFocusedMaximized) return

    collapseTimeoutRef.current = setTimeout(() => {
      setIsDockHovered(false)
      collapseTimeoutRef.current = null
    }, LEAVE_COLLAPSE_DELAY_MS)
  }, [clearCollapseTimer, isFocusedMaximized])

  useEffect(() => {
    if (!isFocusedMaximized) {
      clearCollapseTimer()
      setIsDockHovered(false)
    }
  }, [isFocusedMaximized, clearCollapseTimer])

  useEffect(() => {
    return () => clearCollapseTimer()
  }, [clearCollapseTimer])

  const handleAppClick = (appId: string) => {
    const isAlreadyOpen = openApps.includes(appId)
    if (isAlreadyOpen && focusedApp === appId && appId !== 'apps') {
      return
    }
    dispatch(openApp(appId))
  }

  // Translucent glass fill + SVG-inspired multi-stop inner bevel shadows
  const dockBg = isLight
    ? 'rgba(255, 255, 255, 0.22)'
    : 'rgba(255, 255, 255, 0.035)'

  const dockInnerBevel = isLight
    ? `inset 0 0 2px rgba(15, 23, 42, 0.28),
       inset 0 0 6px rgba(255, 255, 255, 0.72),
       inset 0 1.5px 12px rgba(255, 255, 255, 0.55)`
    : `inset 0 0 2px rgba(255, 255, 255, 0.5),
       inset 0 0 5px rgba(255, 255, 255, 0.3),
       inset 0 0 10px rgba(255, 255, 255, 0.25)`

  const dockBorderColor = isLight
    ? 'rgba(255, 255, 255, 0.72)'
    : 'rgba(255, 255, 255, 0.16)'
  const dividerColor = isLight
    ? 'rgba(15, 23, 42, 0.16)'
    : 'rgba(255, 255, 255, 0.16)'
  const hoverBg = isLight
    ? 'rgba(255, 255, 255, 0.45)'
    : 'rgba(255, 255, 255, 0.1)'
  const inactiveDotColor = isLight
    ? 'rgba(15, 23, 42, 0.38)'
    : 'rgba(255, 255, 255, 0.62)'
  const collapsedBg = isLight
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(255, 255, 255, 0.28)'

  return (
    <>
      <style>{`
        /* Stable bottom hover band so dock animation never shifts the hit area */
        .os-dock-zone {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100vw;
          height: 5.5rem;
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
        }

        @media (min-width: 640px) {
          .os-dock-zone {
            height: 8.75rem;
          }
        }

        .os-dock {
          pointer-events: auto;
          position: relative;
          display: flex;
          align-items: center;
          backdrop-filter: blur(8px) saturate(1.65);
          -webkit-backdrop-filter: blur(8px) saturate(1.65);
          background: ${dockBg};
          border-top: 1px solid ${dockBorderColor};
          box-shadow:
            ${dockInnerBevel},
            0 4px 12px rgba(0, 0, 0, ${isLight ? '0.14' : '0.35'}),
            0 0 22px -2px var(--dock-glow);
          overflow: hidden;
          transition:
            width 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            height 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            padding 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            margin-bottom 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            border-radius 0.32s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        /* Subtle glossy rim sheen matching the SVG inner highlight */
        .os-dock::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, ${isLight ? '0.85' : '0.32'});
          pointer-events: none;
          z-index: 2;
        }

        /* Mobile View: Full Width Bottom Nav */
        @media (max-width: 639px) {
          .os-dock {
            width: 100vw;
            height: 4.5rem;
            padding: 0.35rem 0.5rem;
            border-radius: 0px;
            border-left: none;
            border-right: none;
            border-bottom: none;
          }
        }

        /* Desktop View: Floating Mac-style Dock */
        @media (min-width: 640px) {
          .os-dock {
            margin-bottom: 2.25rem;
            width: max-content;
            min-width: 32rem;
            height: 5.75rem;
            padding: 0.25rem 2rem;
            gap: 1rem;
            border: 1px solid ${dockBorderColor};
            border-radius: 1.25rem;
          }
        }

        /* Collapsed Line Mode (when focused app is fullscreen) */
        .os-dock.collapsed {
          width: 13.5rem;
          min-width: 0;
          height: 6px;
          padding: 0;
          margin-bottom: 10px;
          border-radius: 9999px;
          background: ${collapsedBg};
          border: 1px solid ${dockBorderColor};
          box-shadow: 0 2px 10px rgba(0, 0, 0, ${isLight ? '0.18' : '0.45'});
          cursor: pointer;
        }

        .os-dock.collapsed::before {
          display: none;
        }

        .os-dock-items {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          gap: 0.25rem;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          transition: opacity 0.18s ease, transform 0.25s ease;
        }

        .os-dock-items::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 640px) {
          .os-dock-items {
            justify-content: center;
            overflow: visible;
            gap: 1rem;
          }
        }

        .os-dock.collapsed .os-dock-items {
          opacity: 0;
          transform: translateY(10px) scale(0.92);
          pointer-events: none;
        }

        .dock-divider {
          width: 1px;
          height: 1.75rem;
          background: ${dividerColor};
          margin: 0 0.1rem;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .dock-divider {
            height: 2.25rem;
            margin: 0 0.15rem;
          }
        }

        .dock-icon-wrapper {
          position: relative;
          display: flex;
          flex: 1 1 0;
          min-width: 2.75rem;
          max-width: 3.5rem;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 3.5rem;
          border-radius: 0.75rem;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @media (min-width: 640px) {
          .dock-icon-wrapper {
            flex: 0 0 auto;
            min-width: 5.25rem;
            max-width: none;
            width: 5.25rem;
            height: 5.25rem;
            border-radius: 1rem;
          }
        }

        .dock-icon-wrapper:hover {
          border-radius: 1rem;
          background: ${hoverBg};
          border-color: ${dockBorderColor};
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, ${isLight ? '0.12' : '0.3'});
        }

        .dock-icon-wrapper.focused {
          background: var(--dock-focus-bg);
          border-color: var(--dock-border);
          border-radius: 1rem;
        }

        .app-indicator {
          position: absolute;
          bottom: 2px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: ${inactiveDotColor};
          transition: all 0.2s ease;
        }

        .app-indicator.active {
          width: 14px;
          border-radius: 4px;
          background-color: var(--dock-indicator);
          box-shadow: 0 0 8px var(--dock-indicator);
        }
      `}</style>

      <div
        className="os-dock-zone"
        onMouseEnter={handleZoneEnter}
        onMouseLeave={handleZoneLeave}
      >
        <div
          onClick={() => {
            if (isCollapsed) handleZoneEnter()
          }}
          className={`os-dock ${isCollapsed ? 'collapsed' : ''}`}
          style={{
            ['--dock-glow' as string]: `rgba(${accentRgbClean}, 0.18)`,
            ['--dock-focus-bg' as string]: `rgba(${accentRgbClean}, 0.2)`,
            ['--dock-border' as string]: theme.rgb,
            ['--dock-indicator' as string]: theme.rgb,
          }}
        >
          <div className="os-dock-items">
            {/* Left Side: Open Non-Pinned Apps */}
            {unpinnedOpenApps.map((app) => {
              const isFocused = focusedApp === app.id

              return (
                <div
                  key={`unpinned-${app.id}`}
                  onClick={() => handleAppClick(app.id)}
                  className={`dock-icon-wrapper ${isFocused ? 'focused' : ''}`}
                  title={app.name}
                >
                  <Image
                    className="select-none object-contain w-8 h-8 sm:w-12 sm:h-12"
                    src={app.icon}
                    alt={app.name}
                    width={48}
                    height={48}
                    priority
                  />
                  <span className={`app-indicator ${isFocused ? 'active' : ''}`} />
                </div>
              )
            })}

            {unpinnedOpenApps.length > 0 && <div className="dock-divider" />}

            {/* Pinned Dock Apps */}
            {dockApps.map((appId: string) => {
              const app = APP_REGISTRY[appId]
              if (!app) return null

              const isOpen = openApps.includes(app.id)
              const isFocused = isOpen && focusedApp === app.id

              return (
                <div
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className={`dock-icon-wrapper ${isFocused ? 'focused' : ''}`}
                  title={app.name}
                >
                  <Image
                    className="select-none object-contain w-8 h-8 sm:w-12 sm:h-12"
                    src={app.icon}
                    alt={app.name}
                    width={48}
                    height={48}
                    priority
                  />
                  {isOpen && (
                    <span className={`app-indicator ${isFocused ? 'active' : ''}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}