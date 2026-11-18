'use client'

import React from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleWidget } from '@/lib/features/widgetsSlice'

export default function WidgetsApp() {
  const dispatch = useAppDispatch()
  const { widgets } = useAppSelector((state) => state.widgets)

  // Metadata for your desktop widgets
  const widgetMeta: Record<string, { name: string; description: string; icon: string }> = {
    clock: {
      name: 'Digital Clock & Date',
      description: 'Displays real-time timezone, clock face, and calendar date.',
      icon: '⏰',
    },
    music: {
      name: 'Audio Player',
      description: 'Interactive media player widget for background tracks.',
      icon: '🎵',
    },
    git: {
      name: 'GitHub Contributions',
      description: 'Live contribution heatmap and repository stats telemetry.',
      icon: '📊',
    },
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] text-gray-200 p-6 gap-6 overflow-y-auto select-none">
    
      <div>
        <h2 className="text-lg font-bold text-white">Widget Management</h2>
        <p className="text-xs text-gray-400">Select which floating widgets are active on your desktop workspace.</p>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(widgets).map(([id, config]) => {
          const meta = widgetMeta[id] || {
            name: id.toUpperCase(),
            description: 'Custom desktop widget module.',
            icon: '🎛️',
          }

          return (
            <div
              key={id}
              onClick={() => dispatch(toggleWidget(id))}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                config.isOpen
                  ? 'bg-white/[0.06] border-white/20 shadow-lg'
                  : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl p-2 rounded-lg bg-black/20 flex items-center justify-center w-12 h-12">
                  {meta.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{meta.name}</span>
                  <span className="text-xs text-gray-400">{meta.description}</span>
                </div>
              </div>

              {/* iOS-style Toggle Switch */}
              <div
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  config.isOpen ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                    config.isOpen ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}