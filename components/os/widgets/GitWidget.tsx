'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

export default function GitWidget() {
  const { data, loading, error } = useAppSelector((state) => state.github)
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[hydrated ? accent : 'blue']

  if (loading || (!data && !error)) {
    return (
      <div className="w-[340px] sm:w-[420px] p-4 flex items-center justify-center gap-2.5 text-xs font-mono text-gray-300">
        <div
          className="w-4 h-4 border-2 border-white/20 border-t-transparent rounded-full animate-spin"
          style={{ borderTopColor: theme.rgb }}
        />
        <span>Syncing GitHub activity...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="w-[340px] sm:w-[420px] p-4 text-xs text-red-400">
        ⚠️ {error || 'GitHub data unavailable'}
      </div>
    )
  }

  const { user, contributionCalendar } = data

  return (
    <div className="w-[340px] sm:w-[440px] p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-300">
        <span className="font-medium text-white">
          {contributionCalendar.totalContributions.toLocaleString()} Contributions in the last year
        </span>
        <span className="font-mono text-[11px] text-gray-400">
          {user.public_repos} Repos
        </span>
      </div>

      {/* Contribution Matrix Graph */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="overflow-x-auto py-2 grid grid-cols-3 gap-0 scrollbar-thin scrollbar-thumb-white/20 cursor-default"
      >
        {contributionCalendar.weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-row gap-1 justify-around p-1 rounded-sm">
            {week.contributionDays.map((day, dIndex) => (
              <div
                key={dIndex}
                className="flex-1 rounded-sm bg-gray-900/90"
                style={{ boxShadow: theme.rawPrimary }}
              >
                <div
                  title={`${day.contributionCount} contributions on ${day.date}`}
                  className="flex-1 h-2.5 rounded-sm transition-transform hover:scale-125 cursor-pointer"
                  style={{
                    backgroundColor: theme.rgb,
                    opacity: day.opacity,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-end items-center gap-1.5 text-[10px] text-gray-400">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((opacity) => (
          <span
            key={opacity}
            className="w-2.5 h-2.5 rounded-sm bg-gray-900 border border-white/10 overflow-hidden"
          >
            <span
              className="w-full h-full block"
              style={{
                backgroundColor: theme.rgb,
                opacity,
              }}
            />
          </span>
        ))}
        <span>More</span>
      </div>
    </div>
  )
}