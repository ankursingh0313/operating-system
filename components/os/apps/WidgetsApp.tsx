'use client'

import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleWidget, focusWidget, moveWidget } from '@/lib/features/widgetsSlice'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
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
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const theme = COLOR_PACKAGES[activeAccent]
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

  const renderUniformPreview = (id: string) => {
    if (id === 'clock') {
      return (
        <div className="w-full h-full px-3 py-2.5 rounded-lg bg-black/35 border border-white/[0.06] flex flex-col justify-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            Clock Widget
          </span>
          <span className="text-sm font-mono font-semibold text-white mt-0.5 truncate">
            Live Time &amp; Date
          </span>
        </div>
      )
    }

    if (id === 'music') {
      return (
        <div className="w-full h-full px-3 py-2.5 rounded-lg bg-black/35 border border-white/[0.06] flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-black shrink-0"
            style={{ backgroundColor: theme.rgb }}
          >
            ▶
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-white truncate">Audio Player</span>
            <span className="text-[10px] text-slate-400 truncate">Desktop Media</span>
          </div>
        </div>
      )
    }

    if (id === 'git') {
      const total = githubData?.contributionCalendar?.totalContributions
      return (
        <div className="w-full h-full px-3 py-2.5 rounded-lg bg-black/35 border border-white/[0.06] flex flex-col justify-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            GitHub Widget
          </span>
          <span className="text-xs font-mono text-white mt-0.5 truncate">
            {typeof total === 'number'
              ? `${total.toLocaleString()} contributions`
              : 'Contribution Heatmap'}
          </span>
        </div>
      )
    }

    return (
      <div className="w-full h-full px-3 py-2.5 rounded-lg bg-black/35 border border-white/[0.06] flex items-center justify-center text-xs font-mono text-slate-300 truncate">
        {id.toUpperCase()}
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden bg-[#090c12] text-slate-200 select-none">
      <div className="relative max-w-6xl mx-auto px-4 py-5 sm:px-7 sm:py-6 flex flex-col gap-5">
        {/* Header & Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white mt-1">
              Desktop Widget
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeCount} of {entries.length} floating widgets visible on your desktop.
            </p>
          </div>

          {entries.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAllWidgets(true)}
                disabled={activeCount === entries.length}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-slate-200 transition disabled:opacity-40 cursor-pointer"
              >
                Show All
              </button>
              <button
                type="button"
                onClick={() => setAllWidgets(false)}
                disabled={activeCount === 0}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-slate-200 transition disabled:opacity-40 cursor-pointer"
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
                        backgroundColor: `rgba(${accentRgbClean}, 0.08)`,
                        borderColor: `rgba(${accentRgbClean}, 0.42)`,
                      }
                    : {
                        backgroundColor: 'rgba(255, 255, 255, 0.025)',
                        borderColor: 'rgba(255, 255, 255, 0.07)',
                      }
                }
              >
                {/* Fixed-Height Uniform Preview Box */}
                <div className="flex-1 min-h-0 w-full">
                  {renderUniformPreview(id)}
                </div>

                {/* Bottom Controls Bar */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/[0.07] shrink-0">
                  <button
                    type="button"
                    disabled={!config.isOpen}
                    onClick={(e) => handleBringToFront(e, id)}
                    title="Bring widget to front"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 transition disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                  >
                    <FaLayerGroup className="w-2.5 h-2.5" style={{ color: theme.rgb }} />
                    <span>Front</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleResetPosition(e, id, meta)}
                    title="Reset widget position"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 transition cursor-pointer"
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
                    className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 transition cursor-pointer"
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