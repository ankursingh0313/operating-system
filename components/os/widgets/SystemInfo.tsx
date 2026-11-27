'use client'

import React, { useEffect, useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import { MdMonitorHeart } from 'react-icons/md'

interface BatteryManagerLike extends EventTarget {
  level: number
  charging: boolean
}

interface NetworkInformationLike extends EventTarget {
  effectiveType?: string
  downlink?: number
  rtt?: number
}

interface PerformanceMemoryLike {
  usedJSHeapSize: number
  jsHeapSizeLimit: number
}

interface ExtendedNavigator extends Navigator {
  deviceMemory?: number
  connection?: NetworkInformationLike
  getBattery?: () => Promise<BatteryManagerLike>
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemoryLike
}

interface SystemSpecs {
  os: string
  browser: string
  gpu: string
  viewport: string
  screen: string
  dpr: string
  cores: string
  memory: string
  network: string
  timezone: string
  language: string
  online: boolean
}

function detectOS(ua: string): string {
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Win/i.test(ua)) return 'Windows'
  if (/Mac/i.test(ua)) return 'macOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown'
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome'
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari'
  return 'Browser'
}

function detectGPU(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl || !(gl instanceof WebGLRenderingContext)) return 'N/A'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'WebGL'

    const raw = String(
      gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
    ).trim()
    if (!raw) return 'WebGL'

    // Trim verbose ANGLE(...) wrapper for compact HUD display
    const angleMatch = raw.match(/ANGLE\s*\([^,]+,\s*([^,)]+)/i)
    const cleaned = (angleMatch ? angleMatch[1] : raw)
      .replace(/Direct3D.*|OpenGL.*|Vulkan.*/i, '')
      .trim()

    return cleaned.length > 24 ? `${cleaned.slice(0, 22)}…` : cleaned
  } catch {
    return 'N/A'
  }
}

function formatUptime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  return [hrs, mins, secs].map((n) => String(n).padStart(2, '0')).join(':')
}

export default function SystemInfo() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [visits, setVisits] = useState<number | null>(null)
  const [fps, setFps] = useState<number>(60)
  const [uptimeSec, setUptimeSec] = useState<number>(0)
  const [heapMb, setHeapMb] = useState<string | null>(null)
  const [battery, setBattery] = useState<string | null>(null)

  const [specs, setSpecs] = useState<SystemSpecs>({
    os: '—',
    browser: '—',
    gpu: '—',
    viewport: '—',
    screen: '—',
    dpr: '1x',
    cores: '—',
    memory: '—',
    network: '—',
    timezone: '—',
    language: '—',
    online: true,
  })

  // Hardware, display, network, and environment specs
  useEffect(() => {
    setIsMounted(true)

    const gpuName = detectGPU()
    const nav = navigator as ExtendedNavigator

    const readNetwork = (): string => {
      const conn = nav.connection
      if (!conn) return navigator.onLine ? 'Online' : 'Offline'
      const parts: string[] = []
      if (conn.effectiveType) parts.push(conn.effectiveType.toUpperCase())
      if (typeof conn.downlink === 'number') parts.push(`${conn.downlink} Mbps`)
      if (typeof conn.rtt === 'number' && conn.rtt > 0) parts.push(`${conn.rtt}ms`)
      return parts.length > 0 ? parts.join(' · ') : 'Online'
    }

    const updateSpecs = () => {
      const ua = navigator.userAgent
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'

      setSpecs({
        os: detectOS(ua),
        browser: detectBrowser(ua),
        gpu: gpuName,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        screen: `${window.screen.width}×${window.screen.height}`,
        dpr: `${Number(window.devicePixelRatio || 1).toFixed(
          window.devicePixelRatio % 1 === 0 ? 0 : 1
        )}x`,
        cores: navigator.hardwareConcurrency
          ? `${navigator.hardwareConcurrency}T`
          : 'N/A',
        memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : 'N/A',
        network: readNetwork(),
        timezone: tz,
        language: navigator.language || 'en-US',
        online: navigator.onLine,
      })
    }

    updateSpecs()
    window.addEventListener('resize', updateSpecs)
    window.addEventListener('online', updateSpecs)
    window.addEventListener('offline', updateSpecs)
    nav.connection?.addEventListener?.('change', updateSpecs)

    return () => {
      window.removeEventListener('resize', updateSpecs)
      window.removeEventListener('online', updateSpecs)
      window.removeEventListener('offline', updateSpecs)
      nav.connection?.removeEventListener?.('change', updateSpecs)
    }
  }, [])

  // Battery status (Chromium browsers)
  useEffect(() => {
    if (!isMounted) return
    const nav = navigator as ExtendedNavigator
    if (!nav.getBattery) return

    let active = true
    let batteryRef: BatteryManagerLike | null = null

    const updateBattery = () => {
      if (!batteryRef || !active) return
      const pct = Math.round(batteryRef.level * 100)
      setBattery(`${pct}%${batteryRef.charging ? ' ⚡' : ''}`)
    }

    nav
      .getBattery()
      .then((bat) => {
        if (!active) return
        batteryRef = bat
        updateBattery()
        bat.addEventListener('levelchange', updateBattery)
        bat.addEventListener('chargingchange', updateBattery)
      })
      .catch(() => {})

    return () => {
      active = false
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', updateBattery)
        batteryRef.removeEventListener('chargingchange', updateBattery)
      }
    }
  }, [isMounted])

  // Live FPS counter (sampled once per second)
  useEffect(() => {
    if (!isMounted) return
    let frameCount = 0
    let lastTime = performance.now()
    let rafId = 0

    const tick = (now: number) => {
      frameCount += 1
      const elapsed = now - lastTime
      if (elapsed >= 1000) {
        setFps(Math.round((frameCount * 1000) / elapsed))
        frameCount = 0
        lastTime = now
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isMounted])

  // Session uptime + JS Heap usage (updated every second)
  useEffect(() => {
    if (!isMounted) return
    const start = Date.now()
    const perf = performance as ExtendedPerformance

    const updateRuntime = () => {
      setUptimeSec(Math.floor((Date.now() - start) / 1000))
      if (perf.memory) {
        const used = (perf.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)
        setHeapMb(`${used} MB`)
      }
    }

    updateRuntime()
    const interval = setInterval(updateRuntime, 1000)
    return () => clearInterval(interval)
  }, [isMounted])

  // Fetch & increment total visits (once per browser session)
  useEffect(() => {
    if (!isMounted) return
    let cancelled = false

    async function syncVisits() {
      try {
        const alreadyCounted = sessionStorage.getItem('dossier_visit_counted')
        const method = alreadyCounted ? 'GET' : 'POST'
        const res = await fetch('/api/visits', { method, cache: 'no-store' })

        if (!res.ok) throw new Error('Visits API unavailable')
        const json: { totalVisits: number } = await res.json()

        if (!alreadyCounted) {
          sessionStorage.setItem('dossier_visit_counted', '1')
        }
        if (!cancelled) setVisits(json.totalVisits)
      } catch {
        const localCount = Number(
          localStorage.getItem('dossier_local_visits') || '0'
        )
        const alreadyCounted = sessionStorage.getItem('dossier_visit_counted')
        const nextCount = alreadyCounted ? Math.max(1, localCount) : localCount + 1

        if (!alreadyCounted) {
          localStorage.setItem('dossier_local_visits', String(nextCount))
          sessionStorage.setItem('dossier_visit_counted', '1')
        }
        if (!cancelled) setVisits(nextCount)
      }
    }

    syncVisits()
    return () => {
      cancelled = true
    }
  }, [isMounted])

  if (!isMounted) return null

  const activeAccent = hydrated ? accent : 'blue'
  const activeMode = hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  return (
    <aside
      aria-label="System information and total visits"
      className={`fixed top-4 right-4 z-0 w-[264px] rounded-2xl border backdrop-blur-sm p-3.5 select-none pointer-events-none transition-colors duration-200 ${
        isLight
          ? 'bg-white/[0.7] border-slate-300/70 text-slate-900'
          : 'bg-white/[0.01] border-white/10 text-white'
      }`}
      style={{
        boxShadow: `0 8px 24px rgba(0, 0, 0, ${isLight ? '0.08' : '0.28'}), 0 0 14px rgba(${accentRgbClean}, 0.12)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/10">
        <div className="flex items-center gap-1.5">
          <MdMonitorHeart style={{ color: theme.rgb }} />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">
            System Info
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span style={{ color: theme.rgb }}>{fps} FPS</span>
          <span className={surface.textMuted}>·</span>
          <span className={specs.online ? 'text-emerald-400' : 'text-rose-400'}>
            {specs.online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Specs Grid */}
      <div className="space-y-1 text-[10.5px] font-mono">
        <div className="flex items-center justify-between gap-2">
          <span className={surface.textMuted}>OS / Client</span>
          <span className="truncate font-medium">
            {specs.os} · {specs.browser}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={surface.textMuted}>GPU</span>
          <span className="truncate font-medium max-w-[165px] text-right">
            {specs.gpu}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={surface.textMuted}>CPU {specs.memory !== 'N/A' ? ` / RAM` : ''}</span>
          <span className="font-medium">
            {specs.cores}
            {specs.memory !== 'N/A' ? ` · ${specs.memory}` : ''}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={surface.textMuted}>Display</span>
          <span className="font-medium">
            {specs.screen} ({specs.dpr})
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={surface.textMuted}>Viewport</span>
          <span className="font-medium">{specs.viewport}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={surface.textMuted}>Network</span>
          <span className="truncate font-medium">{specs.network}</span>
        </div>

        {battery && (
          <div className="flex items-center justify-between gap-2">
            <span className={surface.textMuted}>Battery</span>
            <span className="font-medium">{battery}</span>
          </div>
        )}

        {heapMb && (
          <div className="flex items-center justify-between gap-2">
            <span className={surface.textMuted}>JS Heap</span>
            <span className="font-medium">{heapMb}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className={surface.textMuted}>Locale</span>
          <span className="truncate font-medium max-w-[165px] text-right">
            {specs.timezone} · {specs.language}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={surface.textMuted}>Uptime</span>
          <span className="font-medium">{formatUptime(uptimeSec)}</span>
        </div>
      </div>

      {/* Total Visits Footer */}
      <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-mono">
        <span className={surface.textMuted}>Total Visits</span>
        <span
          className="px-2 py-0.5 rounded-full font-semibold"
          style={{
            backgroundColor: `rgba(${accentRgbClean}, 0.16)`,
            color: theme.rgb,
          }}
        >
          {visits !== null ? visits.toLocaleString() : '—'}
        </span>
      </div>
    </aside>
  )
}