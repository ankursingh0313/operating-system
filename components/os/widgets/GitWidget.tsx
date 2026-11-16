'use client'

import React from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

interface Commit {
  id: string
  message: string
  repo: string
  time: string
}

const MOCK_COMMITS: Commit[] = [
  { id: 'a1b2', message: 'feat: optimize wallpaper GPU filters', repo: 'graph-portfolio', time: '10m ago' },
  { id: 'c3d4', message: 'fix: resolve hook ordering bug in OS view', repo: 'leafnx-os', time: '2h ago' },
  { id: 'e5f6', message: 'chore: update theme color packages', repo: 'leafnx-os', time: '5h ago' },
]

export default function GitWidget() {
  const { accent } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[accent]

  return (
    <div className="widget-card p-4 min-w-[280px] flex flex-col gap-3">
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider opacity-70">
        <span>⚡ Git Push Activity</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          ● Online
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {MOCK_COMMITS.map((commit) => (
          <div key={commit.id} className="flex flex-col bg-white/[0.03] hover:bg-white/[0.06] transition p-2.5 rounded-xl border border-white/[0.04]">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-mono text-[11px] opacity-50">#{commit.id}</span>
              <span className="text-[10px] opacity-40">{commit.time}</span>
            </div>
            <p className="text-xs font-medium truncate mb-1">{commit.message}</p>
            <span className="text-[10px] w-max px-1.5 py-0.5 rounded-md bg-white/10 opacity-70 font-mono">
              {commit.repo}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}