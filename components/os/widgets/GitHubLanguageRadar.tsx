'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  setGitHubLoading,
  setGitHubData,
  setGitHubError,
  type GitHubData,
} from '@/lib/features/githubSlice'
import { openApp } from '@/lib/features/dockSlice'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import { IoMdRefresh } from 'react-icons/io'
import { MdArrowOutward } from 'react-icons/md'
import { TbChartRadar } from 'react-icons/tb'
import { AiOutlineRadarChart } from 'react-icons/ai'

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Ruby: '#701516',
  Swift: '#F05138',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#7355dd',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Shell: '#89e051',
  Kotlin: '#A97BFF',
  SVG: '#ff9900',
}

interface LanguagePoint {
  name: string
  count: number
  color: string
}

interface GitHubLanguageRadarProps {
  maxLanguages?: number
  className?: string
}

export default function GitHubLanguageRadar({
  maxLanguages = 8,
  className = '',
}: GitHubLanguageRadarProps) {
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector((state) => state.github)
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)

  const [isMounted, setIsMounted] = useState(false)
  const [hoveredLang, setHoveredLang] = useState<LanguagePoint | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const fetchGitHubStats = async () => {
    if (loading) return
    dispatch(setGitHubLoading())
    try {
      const res = await fetch('/api/github', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load GitHub stats')
      const resData: GitHubData = await res.json()
      dispatch(setGitHubData(resData))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load data'
      dispatch(setGitHubError(msg))
    }
  }

  // Hydrate GitHub data automatically if the widget mounts before GitHub app was opened
  useEffect(() => {
    if (isMounted && !data && !loading && !error) {
      fetchGitHubStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, data, loading, error])

  const languagePoints = useMemo<LanguagePoint[]>(() => {
    const rawMap =
      (data as (GitHubData & { languageUsage?: Record<string, number> }) | null)
        ?.languageUsage ?? {}

    return Object.entries(rawMap)
      .filter(([name, count]) => Boolean(name?.trim()) && Number(count) > 0)
      .map(([name, count]) => {
        const cleanName = name.trim()
        return {
          name: cleanName,
          count: Number(count),
          color: LANGUAGE_COLORS[cleanName] ?? theme.rgb,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [data, theme.rgb])

  const spiderGeometry = useMemo(() => {
    const size = 250
    const cx = size / 2
    const cy = size / 2
    const radius = 72
    const labelRadius = radius + 22
    const axes = languagePoints.slice(0, maxLanguages)
    const count = axes.length

    if (count === 0) {
      return {
        size,
        cx,
        cy,
        rings: [] as string[],
        spokes: [] as Array<{
          x: number
          y: number
          lx: number
          ly: number
          anchor: 'start' | 'middle' | 'end'
          lang: LanguagePoint
        }>,
        polygonPoints: '',
        vertices: [] as Array<{
          x: number
          y: number
          lang: LanguagePoint
        }>,
      }
    }

    const maxCount = Math.max(1, ...axes.map((a) => a.count))
    const ringLevels = [0.25, 0.5, 0.75, 1]

    const angleFor = (idx: number) =>
      -Math.PI / 2 + (idx * 2 * Math.PI) / count

    const rings = ringLevels.map((level) =>
      axes
        .map((_, idx) => {
          const angle = angleFor(idx)
          const r = radius * level
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          return `${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
    )

    const spokes = axes.map((lang, idx) => {
      const angle = angleFor(idx)
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const x = cx + radius * cos
      const y = cy + radius * sin
      const lx = cx + labelRadius * cos
      const ly = cy + labelRadius * sin

      let anchor: 'start' | 'middle' | 'end' = 'middle'
      if (cos > 0.25) anchor = 'start'
      else if (cos < -0.25) anchor = 'end'

      return { x, y, lx, ly, anchor, lang }
    })

    const vertices = axes.map((lang, idx) => {
      const angle = angleFor(idx)
      const ratio = lang.count / maxCount
      const r = radius * ratio
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      return { x, y, lang }
    })

    const polygonPoints = vertices
      .map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`)
      .join(' ')

    return {
      size,
      cx,
      cy,
      rings,
      spokes,
      polygonPoints,
      vertices,
    }
  }, [languagePoints, maxLanguages])

  const totalReposCount = languagePoints.reduce((sum, l) => sum + l.count, 0)
  const spiderFillId = `widget-spider-fill-${activeAccent}`

  const cardBg = isLight
    ? 'bg-white/80 border-slate-200/90 shadow-lg'
    : 'bg-[#12161f]/80 border-white/10 shadow-xl'
  const innerInsetBg = isLight
    ? 'bg-slate-100/10 border-slate-200/70'
    : 'bg-black/20 border-white/[0.07]'

  return (
    <div
      className={`w-[280px] rounded-2xl backdrop-blur-xl p-0 flex flex-col gap-1 select-none transition-colors duration-200 ${surface.textPrimary} overflow-hidden`}
      style={{
        boxShadow: `0 12px 28px -8px rgba(0, 0, 0, ${isLight ? '0.12' : '0.45'}), 0 0 20px -4px rgba(${accentRgbClean}, 0.14)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center text-[11px] px-4 pt-2 font-mono truncate ${surface.textMuted} justify-between">
        <div>{languagePoints.length} languages </div>
        <div>{totalReposCount} repos</div>
      </div>
      {/* Spider Chart Canvas */}
      <div
        className={`relative w-full h-[215px] rounded-xl border flex items-center justify-center ${innerInsetBg} `}
      >
        {hoveredLang && (
          <div
            className={`pointer-events-none absolute z-10 top-2 right-2 px-2 py-1 rounded-md border text-[10px] font-mono shadow-md ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#161b22] border-white/15 text-white'
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: hoveredLang.color }}
            />
            <strong>{hoveredLang.name}</strong>: {hoveredLang.count}
          </div>
        )}

        {loading && !data ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: isLight ? 'rgba(15,23,42,0.15)' : 'rgba(255,255,255,0.15)',
                borderTopColor: theme.rgb,
              }}
            />
            <span className={`text-[11px] font-mono ${surface.textMuted}`}>
              Loading radar...
            </span>
          </div>
        ) : error && !data ? (
          <div className="flex flex-col items-center gap-2 text-center px-3">
            <span className="text-[11px] text-rose-400 font-mono">{error}</span>
            <button
              type="button"
              onClick={fetchGitHubStats}
              className="text-[11px] font-mono underline cursor-pointer"
              style={{ color: theme.rgb }}
            >
              Retry
            </button>
          </div>
        ) : spiderGeometry.vertices.length >= 3 ? (
          <svg
            viewBox={`0 0 ${spiderGeometry.size} ${spiderGeometry.size}`}
            className="w-full h-full max-w-[245px] block overflow-visible"
            onMouseLeave={() => setHoveredLang(null)}
          >
            <defs>
              <radialGradient id={spiderFillId} cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor={theme.rgb} stopOpacity="0.45" />
                <stop offset="100%" stopColor={theme.rgb} stopOpacity="0.12" />
              </radialGradient>
            </defs>

            {/* Web Rings */}
            {spiderGeometry.rings.map((pts, idx) => (
              <polygon
                key={idx}
                points={pts}
                fill="none"
                stroke={
                  isLight ? 'rgba(15,23,42,0.14)' : 'rgba(255,255,255,0.12)'
                }
                strokeWidth="1"
              />
            ))}

            {/* Spokes & Language Labels */}
            {spiderGeometry.spokes.map((spoke) => (
              <g key={spoke.lang.name}>
                <line
                  x1={spiderGeometry.cx}
                  y1={spiderGeometry.cy}
                  x2={spoke.x}
                  y2={spoke.y}
                  stroke={
                    isLight ? 'rgba(15,23,42,0.14)' : 'rgba(255,255,255,0.12)'
                  }
                  strokeWidth="1"
                />
                <text
                  x={spoke.lx}
                  y={spoke.ly}
                  textAnchor={spoke.anchor}
                  dominantBaseline="central"
                  className="text-[8.5px] font-mono"
                  fill={isLight ? '#475569' : '#ababab'}
                >
                  {spoke.lang.name} ({spoke.lang.count})
                </text>
              </g>
            ))}

            {/* Data Polygon */}
            <polygon
              points={spiderGeometry.polygonPoints}
              fill={`url(#${spiderFillId})`}
              stroke={theme.rgb}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />

            {/* Vertices */}
            {spiderGeometry.vertices.map((v) => {
              const isHovered = hoveredLang?.name === v.lang.name
              return (
                <g
                  key={v.lang.name}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLang(v.lang)}
                >
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={isHovered ? '4.5' : '3'}
                    fill={v.lang.color}
                    stroke={isLight ? '#ffffff' : '#0d1117'}
                    strokeWidth="1.25"
                  />
                  <circle cx={v.x} cy={v.y} r="9" fill="transparent" />
                </g>
              )
            })}
          </svg>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono">
            {languagePoints.length > 0 ? (
              languagePoints.map((lang) => (
                <span
                  key={lang.name}
                  className={`px-2 py-1 rounded-md border ${surface.borderSubtle}`}
                >
                  {lang.name}: {lang.count}
                </span>
              ))
            ) : (
              <span className={surface.textMuted}>No language usage data</span>
            )}
          </div>
        )}
      </div>

      
    </div>
  )
}