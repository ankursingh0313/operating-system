'use client'

import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleWidget, focusWidget, moveWidget } from '@/lib/features/widgetsSlice'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import { FaLayerGroup, FaUndo, FaPowerOff } from 'react-icons/fa'

interface WidgetMeta {
  name: string
  label: string
  defaultPos: { x: number; y: number; xRatio: number; yRatio: number }
}

const WIDGET_META: Record<string, WidgetMeta> = {
  clock: {
    name: 'Digital Clock & Date',
    label: 'Clock & Date',
    defaultPos: { x: 1000, y: 40, xRatio: 0.75, yRatio: 0.05 },
  },
  music: {
    name: 'Audio Player',
    label: 'Audio Player',
    defaultPos: { x: 1000, y: 190, xRatio: 0.75, yRatio: 0.25 },
  },
  git: {
    name: 'GitHub Contributions',
    label: 'GitHub Activity',
    defaultPos: { x: 1000, y: 380, xRatio: 0.75, yRatio: 0.5 },
  },
}

export default function WidgetsApp() {
  const dispatch = useAppDispatch()
  const { widgets } = useAppSelector((state) => state.widgets)
  const { data: githubData } = useAppSelector((state) => state.github)
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const entries = Object.entries(widgets)
  const activeCount = entries.filter(([, cfg]) => cfg.isOpen).length

  const setAllWidgets = (targetOpen: boolean) => {
    entries.forEach(([id, cfg]) => {
      if (cfg.isOpen !== targetOpen) {
        dispatch(toggleWidget(id))
      }
    })
  }

  const handleResetPosition = (
    e: React.MouseEvent,
    id: string,
    meta: WidgetMeta
  ) => {
    e.stopPropagation()
    dispatch(
      moveWidget({
        id,
        x: meta.defaultPos.x,
        y: meta.defaultPos.y,
        xRatio: meta.defaultPos.xRatio,
        yRatio: meta.defaultPos.yRatio,
      })
    )
  }

  const handleBringToFront = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    dispatch(focusWidget(id))
  }

  const previewBoxClass = isLight
    ? 'bg-slate-100/90 border-slate-200/90'
    : 'bg-black/35 border-white/[0.06]'

  const controlBtnClass = `${surface.subtleBg} ${surface.cardHoverBg} border ${surface.borderSubtle} ${surface.textSecondary}`

  const renderUniformPreview = (id: string) => {
    if (id === 'clock') {
      return (
        <div
          className={`w-full h-full px-3 py-2.5 rounded-lg border flex flex-col justify-center ${previewBoxClass}`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider ${surface.textMuted}`}
          >
            Clock Widget
          </span>
          <span
            className={`text-sm font-mono font-semibold mt-0.5 truncate ${surface.textPrimary}`}
          >
            Live Time &amp; Date
          </span>
        </div>
      )
    }

    if (id === 'music') {
      return (
        <div
          className={`w-full h-full px-3 py-2.5 rounded-lg border flex items-center gap-2.5 ${previewBoxClass}`}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ backgroundColor: theme.rgb }}
          >
            ▶
          </span>
          <div className="flex flex-col min-w-0">
            <span
              className={`text-xs font-medium truncate ${surface.textPrimary}`}
            >
              Audio Player
            </span>
            <span className={`text-[10px] truncate ${surface.textMuted}`}>
              Desktop Media
            </span>
          </div>
        </div>
      )
    }

    if (id === 'git') {
      const total = githubData?.contributionCalendar?.totalContributions
      return (
        <div
          className={`w-full h-full px-3 py-2.5 rounded-lg border flex flex-col justify-center ${previewBoxClass}`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider ${surface.textMuted}`}
          >
            GitHub Widget
          </span>
          <span
            className={`text-xs font-mono mt-0.5 truncate ${surface.textPrimary}`}
          >
            {typeof total === 'number'
              ? `${total.toLocaleString()} contributions`
              : 'Contribution Heatmap'}
          </span>
        </div>
      )
    }

    return (
      <div
        className={`w-full h-full px-3 py-2.5 rounded-lg border flex items-center justify-center text-xs font-mono truncate ${previewBoxClass} ${surface.textSecondary}`}
      >
        {id.toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={`relative h-full overflow-y-auto overflow-x-hidden select-none transition-colors duration-200 ${surface.appBg} ${surface.textSecondary}`}
    >
      <div className="relative max-w-6xl mx-auto px-4 py-5 sm:px-7 sm:py-6 flex flex-col gap-5">
        {/* Header & Bulk Actions */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${surface.borderSubtle}`}
        >
          <div>
            <h2
              className={`text-lg sm:text-xl font-semibold tracking-tight mt-1 ${surface.textPrimary}`}
            >
              Desktop Widget
            </h2>
            <p className={`text-xs mt-0.5 ${surface.textMuted}`}>
              {activeCount} of {entries.length} floating widgets visible on your desktop.
            </p>
          </div>

          {entries.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAllWidgets(true)}
                disabled={activeCount === entries.length}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition disabled:opacity-40 cursor-pointer ${controlBtnClass}`}
              >
                Show All
              </button>
              <button
                type="button"
                onClick={() => setAllWidgets(false)}
                disabled={activeCount === 0}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition disabled:opacity-40 cursor-pointer ${controlBtnClass}`}
              >
                Hide All
              </button>
            </div>
          )}
        </div>

        {/* Uniform Width & Height Cards with Natural Wrapping */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-3 pb-2">
          {entries.map(([id, config]) => {
            const meta: WidgetMeta = WIDGET_META[id] || {
              name: id.toUpperCase(),
              label: id.toUpperCase(),
              defaultPos: { x: 1000, y: 200, xRatio: 0.75, yRatio: 0.3 },
            }

            return (
              <div
                key={id}
                onClick={() => dispatch(toggleWidget(id))}
                className="w-[225px] h-[155px] rounded-xl border p-3 flex flex-col justify-between gap-2.5 cursor-pointer transition-colors shrink-0"
                style={
                  config.isOpen
                    ? {
                        backgroundColor: `rgba(${accentRgbClean}, ${isLight ? '0.12' : '0.08'})`,
                        borderColor: `rgba(${accentRgbClean}, 0.45)`,
                      }
                    : {
                        backgroundColor: isLight
                          ? '#ffffff'
                          : 'rgba(255, 255, 255, 0.025)',
                        borderColor: isLight
                          ? 'rgba(15, 23, 42, 0.12)'
                          : 'rgba(255, 255, 255, 0.07)',
                      }
                }
              >
                {/* Fixed-Height Uniform Preview Box */}
                <div className="flex-1 min-h-0 w-full">
                  {renderUniformPreview(id)}
                </div>

                {/* Bottom Controls Bar */}
                <div
                  className={`flex items-center justify-between gap-1.5 pt-2 border-t shrink-0 ${surface.borderSubtle}`}
                >
                  <button
                    type="button"
                    disabled={!config.isOpen}
                    onClick={(e) => handleBringToFront(e, id)}
                    title="Bring widget to front"
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition disabled:opacity-35 disabled:pointer-events-none cursor-pointer ${controlBtnClass}`}
                  >
                    <FaLayerGroup className="w-2.5 h-2.5" style={{ color: theme.rgb }} />
                    <span>Front</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleResetPosition(e, id, meta)}
                    title="Reset widget position"
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${controlBtnClass}`}
                  >
                    <FaUndo className="w-2.5 h-2.5 opacity-75" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch(toggleWidget(id))
                    }}
                    title={config.isOpen ? 'Hide widget' : 'Show widget'}
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-lg transition cursor-pointer ${controlBtnClass}`}
                  >
                    <FaPowerOff className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}