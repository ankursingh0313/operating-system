'use client'

import React, { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { openApp } from '@/lib/features/dockSlice'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
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

export default function Dock() {
  const dispatch = useAppDispatch()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const { dockApps, openApps, focusedApp } = useAppSelector((state) => state.dock)
  
  // Use 'blue' during SSR and initial hydration pass to guarantee server/client match
  const activeAccent = (isMounted && hydrated) ? accent : 'blue'
  const theme = COLOR_PACKAGES[activeAccent]

  const handleAppClick = (appId: string) => {
    if (focusedApp === appId) return
    dispatch(openApp(appId))
  }

  return (
    <>
      <style>{`
        .os-dock {
          position: fixed;
          bottom: 2.25rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: .25rem 2rem;
          background: rgba(255, 255, 255, .1);
          backdrop-filter: blur(2.3px) saturate(2.4);
          -webkit-backdrop-filter: blur(2.3px) saturate(2.4);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 
                      0 0 20px 2px var(--dock-glow);
          border-radius: 1.25rem;
          width: max-content;
          transition: box-shadow 0.3s ease;
        }

        .dock-icon-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 5.25rem;
          height: 5.25rem;
          border-radius: 0rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .dock-icon-wrapper:hover {
          border-radius: 1.5rem;
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3);
        }

        .dock-icon-wrapper.focused {
          background: var(--dock-focus-bg);
          border-color: var(--dock-border);
        }

        .app-indicator {
          position: absolute;
          bottom: -4px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.6);
          transition: all 0.2s ease;
        }

        .app-indicator.active {
          width: 16px;
          border-radius: 4px;
          background-color: var(--dock-indicator);
          box-shadow: 0 0 8px var(--dock-indicator);
        }
      `}</style>

      <div 
        className="os-dock"
        style={{
          ['--dock-glow' as string]: `rgba(${theme.rgb.replace(/[^\d,]/g, '')}, 0.15)`,
          ['--dock-focus-bg' as string]: `rgba(${theme.rgb.replace(/[^\d,]/g, '')}, 0.2)`,
          ['--dock-border' as string]: theme.rgb,
          ['--dock-indicator' as string]: theme.rgb,
        }}
      >
        {dockApps.map((appId: string) => {
          const app = APP_REGISTRY[appId]
          if (!app) return null

          const isOpen = openApps.includes(app.id)
          const isFocused = focusedApp === app.id

          return (
            <div
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className={`dock-icon-wrapper ${isFocused ? 'focused' : ''}`}
              title={app.name}
            >
              <Image 
                className="select-none object-contain" 
                src={app.icon} 
                alt={app.name} 
                width={64} 
                height={64} 
                style={{ width: 'auto', height: 'auto' }}
                priority 
              />
              {isOpen && (
                <span className={`app-indicator ${isFocused ? 'active' : ''}`} />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}