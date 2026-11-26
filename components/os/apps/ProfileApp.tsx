'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import { openApp } from '@/lib/features/dockSlice'
import {
  FaUserAstronaut,
  FaArrowDown,
  FaCopy,
  FaCheck,
  FaArrowUpRightFromSquare,
  FaArrowRight,
  FaLayerGroup,
  FaTerminal,
  FaSliders,
  FaNewspaper,
  FaPenNib,
  FaBrain,
  FaEnvelope,
  FaDownload,
  FaPaperPlane,
} from 'react-icons/fa6'
import { FaHeartbeat } from "react-icons/fa";

export default function ProfileApp() {
  const dispatch = useAppDispatch()
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)

  const [isMounted, setIsMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const stackContainerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  // Preserve the sticky-stacking scale & brightness progression as cards stack inside the scrollable window
  const updateStack = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const cards = cardRefs.current.filter((el): el is HTMLElement => Boolean(el))
    if (cards.length < 2) return

    cards.forEach((card, index) => {
      const nextCard = cards[index + 1]
      if (!nextCard) {
        card.style.transform = ''
        card.style.filter = ''
        return
      }

      const cardRect = card.getBoundingClientRect()
      const nextRect = nextCard.getBoundingClientRect()
      const cardTop = parseFloat(getComputedStyle(card).top) || 24
      const nextTop = parseFloat(getComputedStyle(nextCard).top) || 44

      const overlapStart = cardRect.bottom
      const overlapEnd = nextTop
      const rawProgress =
        (overlapStart - nextRect.top) / Math.max(1, overlapStart - overlapEnd)
      const progress = Math.min(1, Math.max(0, rawProgress))

      if (cardRect.top <= cardTop + 2 && progress > 0) {
        const scale = 1 - progress * 0.04
        const brightness = 1 - progress * 0.08
        card.style.transform = `scale(${scale.toFixed(4)})`
        card.style.filter = `brightness(${brightness.toFixed(4)})`
      } else {
        card.style.transform = ''
        card.style.filter = ''
      }
    })
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let ticking = false
    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateStack()
          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })
    updateStack()

    return () => {
      container.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [updateStack])

  const handleCopyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('hi@ankursingh.dev').catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollToSelectedWork = () => {
    const el = stackContainerRef.current
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Warm paper palette in light mode matching Stitch; deep obsidian-slate in dark mode
  const pageBg = isLight ? 'bg-[#fbf9f9] text-[#1b1c1c]' : 'bg-[#0f1217] text-[#f3f4f6]'
  const mutedText = isLight ? 'text-[#444748]' : 'text-[#9ca3af]'
  const cardLowest = isLight
    ? 'bg-white text-[#1b1c1c]'
    : 'bg-[#171b22] text-[#f3f4f6]'
  const cardLow = isLight
    ? 'bg-[#f5f3f3] text-[#1b1c1c]'
    : 'bg-[#13171e] text-[#f3f4f6]'
  const cardHigh = isLight
    ? 'bg-[#e9e8e7] text-[#1b1c1c]'
    : 'bg-[#1e242e] text-[#f3f4f6]'
  const pillBg = isLight
    ? 'bg-[#efeded] text-[#444748]'
    : 'bg-white/[0.07] text-gray-300'
  const ctaPrimary = isLight
    ? 'bg-[#1c1b1b] text-white'
    : 'bg-white text-[#0f1217]'
  const ctaSecondary = isLight
    ? 'bg-white text-[#1b1c1c] hover:bg-[#efeded]'
    : 'bg-[#171b22] text-white hover:bg-[#202631]'

  return (
    <div
      ref={scrollContainerRef}
      className={`h-full w-full overflow-y-auto overflow-x-hidden transition-colors duration-200 ${pageBg} ${surface.textPrimary}`}
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Hidden navbar preserved in DOM as requested */}
      <header className="hidden" aria-hidden="true">
        <div className="h-20 w-full max-w-[1120px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Ankur</span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#work">Work</a>
            <a href="#side-projects">Side Projects</a>
            <a href="#experience">Experience</a>
            <a href="#about">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <span>Open to work</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1120px] mx-auto px-5 sm:px-8 pt-6 pb-10">
        <div className="flex flex-col w-full">
          {/* Top Recognition Pill */}
          <div className="flex justify-center items-center py-2 mb-4">
            <div
              className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full shadow-sm ${pillBg}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.rgb }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">
                Full-Stack Architect • Desktop OS Portfolio
              </span>
            </div>
          </div>

          {/* HERO SECTION */}
          <section className="flex flex-col items-center text-center max-w-[960px] mx-auto pt-3 pb-12">
            {/* Stylized Typographic Visual with Accent Block & Cursor Badge */}
            <div className="relative flex items-center justify-center mb-5 select-none">
              <div className="flex items-center tracking-tighter font-extrabold text-[72px] sm:text-[96px] md:text-[110px] leading-none">
                <span>BUIL</span>
                <span className="opacity-35 ml-0.5">D</span>
              </div>

              {/* Accent Block with Dot Matrix and Cursor Badge */}
              <div className="relative -ml-3 -mt-8 sm:-mt-10 group">
                <div
                  className="w-16 h-20 md:w-20 md:h-24 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300 flex flex-col justify-between p-2 overflow-hidden"
                  style={{ backgroundColor: theme.rgb }}
                >
                  <div className="w-full h-full opacity-30 grid grid-cols-5 gap-1 place-items-center">
                    {Array.from({ length: 15 }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`${
                          idx === 6 || idx === 8 || idx === 11 || idx === 12
                            ? 'w-2 h-2'
                            : 'w-1.5 h-1.5'
                        } bg-white rounded-full`}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className={`absolute -top-3 -right-4 text-[10px] font-mono px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 ${ctaPrimary}`}
                >
                  <FaUserAstronaut className="text-[10px]" />
                  <span>Ankur</span>
                </div>
              </div>
            </div>

            {/* Core Pitch Statement */}
            <p
              className={`text-lg sm:text-2xl md:text-[26px] leading-snug tracking-[-0.02em] font-medium max-w-[820px] mx-auto px-4 mb-7 ${mutedText}`}
            >
              I turn{' '}
              <span className="font-bold">
                complex systems into fast, resilient products
              </span>
              , and build them end-to-end. Full-stack developer crafting{' '}
              <span className="font-bold">MERN &amp; Next.js platforms</span>,{' '}
              <span className="font-bold">real-time streaming &amp; Web3 tools</span>
              , and local-first software.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={scrollToSelectedWork}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer ${ctaPrimary}`}
              >
                <span>See selected work</span>
                <FaArrowDown className="text-sm" />
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                className={`relative inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer ${ctaSecondary}`}
              >
                <span>hi@ankursingh.dev</span>
                {copied ? (
                  <FaCheck className="text-sm text-emerald-500" />
                ) : (
                  <FaCopy className={`text-sm ${mutedText}`} />
                )}

                <span
                  className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded text-xs shadow transition-opacity duration-200 pointer-events-none whitespace-nowrap ${
                    copied ? 'opacity-100' : 'opacity-0'
                  } ${
                    isLight
                      ? 'bg-[#303031] text-[#f2f0f0]'
                      : 'bg-white text-[#0f1217]'
                  }`}
                >
                  Copied to clipboard!
                </span>
              </button>
            </div>
          </section>

          {/* FANNED SHOWCASE DECK */}
          <section className="relative w-full pt-2 pb-12 overflow-hidden flex flex-col items-center">
            <div className="relative w-full max-w-[1060px] h-[360px] md:h-[410px] flex items-center justify-center">
              {/* Card 1 (Far Left): Available */}
              <div
                onClick={() => dispatch(openApp('available'))}
                className={`absolute left-2 md:left-6 w-[250px] md:w-[310px] h-[270px] md:h-[320px] rounded-2xl shadow-md transform -rotate-12 -translate-y-2 hover:rotate-0 hover:-translate-y-6 hover:z-30 transition-all duration-300 cursor-pointer overflow-hidden p-4 flex flex-col justify-between ${cardLowest}`}
              >
                <div className={`flex items-center justify-between text-xs ${mutedText}`}>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: theme.rgb }}
                  >
                    Build
                  </span>
                  <span>Instant Share</span>
                </div>
                <div className="my-auto text-left">
                  <div className="text-[18px] md:text-[22px] font-bold tracking-tight leading-snug">
                    Drop the room.
                    <br />
                    <span className="italic" style={{ color: theme.rgb }}>
                      Share without friction.
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1.5 w-16 rounded-full opacity-70"
                    style={{ backgroundColor: theme.rgb }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-bold">Available</span>
                  <FaArrowUpRightFromSquare className={`text-sm ${mutedText}`} />
                </div>
              </div>

              {/* Card 2 (Mid Left): DossierOS */}
              <div
                onClick={() => dispatch(openApp('github'))}
                className={`absolute left-16 md:left-32 w-[260px] md:w-[330px] h-[280px] md:h-[330px] rounded-2xl shadow-lg transform -rotate-6 translate-y-1 hover:rotate-0 hover:-translate-y-6 hover:z-30 transition-all duration-300 cursor-pointer overflow-hidden p-4 flex flex-col justify-between ${cardHigh}`}
              >
                <div className={`flex items-center justify-between text-xs ${mutedText}`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Work
                  </span>
                  <span>Desktop OS Shell</span>
                </div>
                <div
                  className={`p-3 rounded-2xl shadow-sm my-auto ${
                    isLight ? 'bg-white/85' : 'bg-black/35'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: theme.rgb }}
                    />
                    <span className="w-16 h-2 bg-current opacity-20 rounded" />
                    <span className="w-8 h-2 bg-current opacity-15 rounded ml-auto" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 bg-current opacity-15 rounded" />
                    <div className="w-4/5 h-2.5 bg-current opacity-15 rounded" />
                    <div className="w-2/3 h-2.5 bg-current opacity-20 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">DossierOS</span>
                  <FaArrowUpRightFromSquare className={`text-sm ${mutedText}`} />
                </div>
              </div>

              {/* Card 3 (Centerpiece / Active): Zero Stream */}
              <div
                className={`relative z-20 w-[280px] md:w-[360px] h-[300px] md:h-[350px] rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden p-4 flex flex-col justify-between ${
                  isLight
                    ? 'bg-[#303031] text-[#f2f0f0]'
                    : 'bg-[#1c212b] text-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs opacity-75">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-300" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Zero Stream
                  </span>
                </div>

                <div className="bg-black/40 p-3 rounded-2xl font-mono text-[11px] leading-relaxed text-white/90 shadow-inner">
                  <div className="text-emerald-400 mb-1 font-bold">
                    // Multi-Node WebRTC &amp; RTMP Mixer
                  </div>
                  <div className="opacity-85">
                    ROUTE <span className="text-white">webrtc://node-cam</span>
                  </div>
                  <div className="opacity-65 mt-1">
                    {'{ nodes: 4, codec: "H264", sync: "ok" }'}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] opacity-70">
                    <span>Kotlin · C++ · React</span>
                    <span className="text-emerald-400">Pipeline Ready</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold block">
                      Zero Stream
                    </span>
                    <span className="text-xs opacity-70">
                      Live Switching &amp; Overlay Engine
                    </span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <FaArrowRight className="text-sm" />
                  </span>
                </div>
              </div>

              {/* Card 4 (Mid Right): firstXchange */}
              <div
                className={`hidden sm:flex absolute right-16 md:right-32 w-[260px] md:w-[330px] h-[280px] md:h-[330px] rounded-2xl shadow-lg transform rotate-6 translate-y-1 hover:rotate-0 hover:-translate-y-6 hover:z-30 transition-all duration-300 cursor-pointer overflow-hidden p-4 flex-col justify-between ${cardHigh}`}
              >
                <div className={`flex items-center justify-between text-xs ${mutedText}`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Systems
                  </span>
                  <span>gRPC Gateway</span>
                </div>
                <div className="my-auto flex items-center justify-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center ${cardLowest}`}
                  >
                    <FaLayerGroup style={{ color: theme.rgb }} className="text-lg" />
                  </div>
                  <div className="w-6 h-0.5 bg-current opacity-25" />
                  <div
                    className={`w-14 h-14 rounded-2xl shadow-md flex flex-col items-center justify-center text-[10px] font-bold ${cardLowest}`}
                  >
                    <span>API</span>
                    <span className={`text-[8px] ${mutedText}`}>ENGINE</span>
                  </div>
                  <div className="w-6 h-0.5 bg-current opacity-25" />
                  <div
                    className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center ${cardLowest}`}
                  >
                    <FaTerminal className={`text-lg ${mutedText}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">firstXchange</span>
                  <FaArrowUpRightFromSquare className={`text-sm ${mutedText}`} />
                </div>
              </div>

              {/* Card 5 (Far Right): DPL Scoring */}
              <div
                className={`hidden lg:flex absolute right-2 md:right-6 w-[250px] md:w-[310px] h-[270px] md:h-[320px] rounded-2xl shadow-md transform rotate-12 -translate-y-2 hover:rotate-0 hover:-translate-y-6 hover:z-30 transition-all duration-300 cursor-pointer overflow-hidden p-4 flex-col justify-between ${cardLowest}`}
              >
                <div className={`flex items-center justify-between text-xs ${mutedText}`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Live Web
                  </span>
                  <span>Socket.IO</span>
                </div>
                <div className={`p-3 rounded-2xl my-auto text-left ${cardLow}`}>
                  <div className="text-sm font-bold mb-1">
                    Live Match Scorecard
                  </div>
                  <div className={`text-xs ${mutedText}`}>
                    Real-time ball-by-ball updates &amp; SVG graphics studio
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">DPL Platform</span>
                  <FaArrowUpRightFromSquare className={`text-sm ${mutedText}`} />
                </div>
              </div>
            </div>
          </section>

          {/* SOCIAL PROOF / STACK & FOCUS */}
          <section className="w-full py-10 flex flex-col items-center">
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] mb-6 ${mutedText}`}
            >
              Core Stack &amp; Focus
            </span>
            <div
              className={`w-full flex flex-wrap items-center justify-center gap-x-10 gap-y-5 ${mutedText}`}
            >
              <div className="flex items-center gap-2 hover:opacity-100 opacity-85 transition-opacity">
                <FaLayerGroup className="text-xl" />
                <span className="text-base font-bold tracking-tight">
                  Next.js &amp; React
                </span>
              </div>
              <div className="flex items-center gap-2 hover:opacity-100 opacity-85 transition-opacity">
                <FaTerminal className="text-xl" />
                <span className="text-base font-bold tracking-tight">
                  Node.js &amp; gRPC
                </span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${pillBg}`}
                >
                  API
                </span>
              </div>
              <div className="flex items-center gap-2 hover:opacity-100 opacity-85 transition-opacity">
                <FaHeartbeat className="text-xl" />
                <span className="text-base font-bold tracking-tight">
                  PostgreSQL &amp; MongoDB
                </span>
              </div>
              <div className="flex items-center gap-2 hover:opacity-100 opacity-85 transition-opacity">
                <FaSliders className="text-xl" />
                <span className="text-base font-bold tracking-tight">
                  Kotlin &amp; C++
                </span>
              </div>
              <div className="flex items-center gap-2 hover:opacity-100 opacity-85 transition-opacity">
                <FaNewspaper className="text-xl" />
                <span className="text-base font-bold tracking-tight">
                  WebRTC &amp; Socket.IO
                </span>
              </div>
            </div>
          </section>

          {/* EXPERIENCE & CRAFT STATS BANNER */}
          <section className={`w-full rounded-3xl p-6 md:p-10 my-6 ${cardLow}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="flex flex-col">
                <span className="text-4xl md:text-5xl leading-none font-black tracking-tight">
                  2018+
                </span>
                <span className="text-base font-semibold mt-1.5">
                  Engineering Journey
                </span>
                <span className={`text-xs mt-1 ${mutedText}`}>
                  Full-stack apps, APIs, and system architecture
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl md:text-5xl leading-none font-black tracking-tight">
                  0 → 1
                </span>
                <span className="text-base font-semibold mt-1.5">
                  Product Builder
                </span>
                <span className={`text-xs mt-1 ${mutedText}`}>
                  Taking ideas from raw prototype to working builds
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl md:text-5xl leading-none font-black tracking-tight">
                  Local
                </span>
                <span className="text-base font-semibold mt-1.5">
                  Resilient Systems
                </span>
                <span className={`text-xs mt-1 ${mutedText}`}>
                  Self-hosted data &amp; offline-friendly workflows
                </span>
              </div>
              <div className={`flex flex-col p-4 rounded-2xl shadow-sm ${cardLowest}`}>
                <div
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider font-bold"
                  style={{ color: theme.rgb }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.rgb }}
                  />
                  <span>Engineering Principle</span>
                </div>
                <p className="text-sm mt-2 leading-relaxed">
                  &ldquo;Keep the interface calm and responsive while the system
                  handles real complexity underneath.&rdquo;
                </p>
              </div>
            </div>
          </section>

          {/* SELECTED CASE STUDIES (STICKY STACKING DECK) */}
          <section
            ref={stackContainerRef}
            className="w-full py-10"
            id="selected-work"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.14em] block mb-1 ${mutedText}`}
                >
                  Portfolio
                </span>
                <h2 className="text-3xl md:text-[42px] leading-tight font-extrabold tracking-tight">
                  Selected Case Studies
                </h2>
              </div>
              <p className={`text-sm max-w-[400px] mt-2 md:mt-0 ${mutedText}`}>
                Explorations into desktop shells, real-time media routing, and
                high-throughput backend services.
              </p>
            </div>

            <div className="flex flex-col gap-16 pb-8" id="case-study-stack">
              {/* Project 1 */}
              <article
                ref={(el) => {
                  cardRefs.current[0] = el
                }}
                className={`case-study-card sticky top-4 z-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] transition-[transform,filter,box-shadow] duration-300 ease-out origin-top overflow-hidden group grid grid-cols-1 md:grid-cols-12 ${cardLowest}`}
              >
                <div
                  className={`md:col-span-7 h-60 md:h-[360px] relative overflow-hidden p-6 flex items-center justify-center ${cardHigh}`}
                >
                  <div
                    className={`w-full h-full rounded-2xl p-5 font-mono text-xs flex flex-col justify-between shadow-inner ${
                      isLight
                        ? 'bg-[#1c1b1b] text-white/90'
                        : 'bg-black/50 text-white/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] opacity-65">
                      <span>dossier-os // shell</span>
                      <span>Next.js · Redux</span>
                    </div>
                    <div className="space-y-1.5 my-auto">
                      <div style={{ color: theme.rgb }} className="font-semibold">
                        $ os status --modules
                      </div>
                      <div>dock: active · theme: {activeMode} ({activeAccent})</div>
                      <div>widgets: clock, music, git, language-radar</div>
                    </div>
                    <div className="text-[11px] opacity-60">
                      Modular desktop workspace for developer analytics
                    </div>
                  </div>
                  <div
                    className={`absolute top-4 left-4 text-[11px] font-semibold px-3 py-1 rounded-full uppercase ${ctaPrimary}`}
                  >
                    Desktop OS
                  </div>
                </div>

                <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        Next.js
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        Redux Toolkit
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        Interactive UI
                      </span>
                    </div>
                    <h3 className="text-2xl leading-tight font-bold">
                      DossierOS Portfolio Shell
                    </h3>
                    <p className={`text-sm mt-2 leading-relaxed ${mutedText}`}>
                      A desktop-inspired portfolio environment featuring
                      draggable widgets, dynamic theme accents, live GitHub
                      visualizations, and window management.
                    </p>
                  </div>

                  <div
                    onClick={() => dispatch(openApp('github'))}
                    className="pt-5 flex items-center justify-between border-t border-current/10 mt-6 cursor-pointer"
                  >
                    <span className="text-sm font-bold">Explore GitHub App</span>
                    <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>

              {/* Project 2 */}
              <article
                ref={(el) => {
                  cardRefs.current[1] = el
                }}
                className={`case-study-card sticky top-8 z-20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] transition-[transform,filter,box-shadow] duration-300 ease-out origin-top overflow-hidden group grid grid-cols-1 md:grid-cols-12 ${cardLowest}`}
              >
                <div
                  className={`md:col-span-7 h-60 md:h-[360px] relative overflow-hidden p-6 flex items-center justify-center ${cardHigh}`}
                >
                  <div
                    className={`w-full h-full rounded-2xl p-5 font-mono text-xs flex flex-col justify-between shadow-inner ${
                      isLight
                        ? 'bg-[#1c1b1b] text-white/90'
                        : 'bg-black/50 text-white/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] opacity-65">
                      <span>zero-stream // mixer</span>
                      <span>Kotlin · C++ · WebRTC</span>
                    </div>
                    <div className="space-y-1.5 my-auto">
                      <div style={{ color: theme.rgb }} className="font-semibold">
                        $ pipeline --nodes=4 --out=rtmp
                      </div>
                      <div>video/audio nodes → central mixer → stream</div>
                      <div>svg graphics overlay: synced</div>
                    </div>
                    <div className="text-[11px] opacity-60">
                      Multi-node live switching &amp; real-time media routing
                    </div>
                  </div>
                  <div
                    className={`absolute top-4 left-4 text-[11px] font-semibold px-3 py-1 rounded-full uppercase shadow-sm ${cardLowest}`}
                  >
                    Zero Stream
                  </div>
                </div>

                <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        WebRTC
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        Socket.IO
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        Media Pipeline
                      </span>
                    </div>
                    <h3 className="text-2xl leading-tight font-bold">
                      Zero Stream Switching Suite
                    </h3>
                    <p className={`text-sm mt-2 leading-relaxed ${mutedText}`}>
                      Multi-node live streaming and switching architecture
                      routing camera, audio, and graphic nodes into a unified
                      broadcast flow.
                    </p>
                  </div>

                  <div className="pt-5 flex items-center justify-between border-t border-current/10 mt-6">
                    <span className="text-sm font-bold">Architecture Overview</span>
                    <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>

              {/* Project 3 */}
              <article
                ref={(el) => {
                  cardRefs.current[2] = el
                }}
                className={`case-study-card sticky top-12 z-30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] transition-[transform,filter,box-shadow] duration-300 ease-out origin-top overflow-hidden group grid grid-cols-1 md:grid-cols-12 ${cardLowest}`}
              >
                <div
                  className={`md:col-span-7 h-60 md:h-[360px] relative overflow-hidden p-6 flex items-center justify-center ${cardHigh}`}
                >
                  <div
                    className={`w-full h-full rounded-2xl p-5 font-mono text-xs flex flex-col justify-between shadow-inner ${
                      isLight
                        ? 'bg-[#1c1b1b] text-white/90'
                        : 'bg-black/50 text-white/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] opacity-65">
                      <span>exchange-gateway // core</span>
                      <span>Node.js · PostgreSQL · gRPC</span>
                    </div>
                    <div className="space-y-1.5 my-auto">
                      <div style={{ color: theme.rgb }} className="font-semibold">
                        $ gateway --auth=jwt-otp --ledger=strict
                      </div>
                      <div>services: auth, order-router, wallet-sim</div>
                      <div>storage: postgresql + mongodb</div>
                    </div>
                    <div className="text-[11px] opacity-60">
                      Structured backend services &amp; trading simulation
                    </div>
                  </div>
                  <div
                    className={`absolute top-4 left-4 text-[11px] font-semibold px-3 py-1 rounded-full uppercase shadow-sm ${cardLowest}`}
                  >
                    Backend Systems
                  </div>
                </div>

                <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        Node.js
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        gRPC
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${pillBg}`}
                      >
                        PostgreSQL
                      </span>
                    </div>
                    <h3 className="text-2xl leading-tight font-bold">
                      firstXchange API Gateway
                    </h3>
                    <p className={`text-sm mt-2 leading-relaxed ${mutedText}`}>
                      Modular microservices gateway with JWT/OTP authentication,
                      gRPC service boundaries, and dual relational/document
                      persistence.
                    </p>
                  </div>

                  <div className="pt-5 flex items-center justify-between border-t border-current/10 mt-6">
                    <span className="text-sm font-bold">System Notes</span>
                    <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* SIDE PROJECTS & EXPERIMENTS */}
          <section className="w-full py-10" id="side-projects">
            <div className="mb-6">
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] block mb-1 ${mutedText}`}
              >
                Experiments
              </span>
              <h2 className="text-3xl md:text-[38px] leading-tight font-extrabold tracking-tight">
                Side Projects &amp; Tools
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => dispatch(openApp('available'))}
                className={`p-6 rounded-2xl flex items-start gap-4 transition-colors cursor-pointer ${cardLow} hover:brightness-95`}
              >
                <div
                  className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: theme.rgb }}
                >
                  <FaPenNib className="text-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold">Available</h4>
                    <FaArrowUpRightFromSquare className={`text-xs ${mutedText}`} />
                  </div>
                  <p className={`text-sm mt-1 leading-relaxed ${mutedText}`}>
                    Ephemeral text and file-sharing rooms designed for quick,
                    low-friction transfers without account overhead.
                  </p>
                  <div className={`mt-2.5 flex items-center gap-2 text-xs ${mutedText}`}>
                    <span>Web App</span>
                    <span>•</span>
                    <span>Ephemeral Rooms</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => dispatch(openApp('calculator'))}
                className={`p-6 rounded-2xl flex items-start gap-4 transition-colors cursor-pointer ${cardLow} hover:brightness-95`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${ctaPrimary}`}
                >
                  <FaBrain className="text-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold">Creative &amp; OS Utilities</h4>
                    <FaArrowUpRightFromSquare className={`text-xs ${mutedText}`} />
                  </div>
                  <p className={`text-sm mt-1 leading-relaxed ${mutedText}`}>
                    Custom desktop utilities including an expression-aware
                    calculator, live radar widgets, and canvas experiments.
                  </p>
                  <div className={`mt-2.5 flex items-center gap-2 text-xs ${mutedText}`}>
                    <span>TypeScript / Canvas</span>
                    <span>•</span>
                    <span>OS Suite</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT & CRAFT PHILOSOPHY */}
          <section
            className={`w-full py-10 rounded-3xl p-6 md:p-10 shadow-sm my-6 ${cardLowest}`}
            id="about"
          >
            <div className="max-w-[800px]">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em] block mb-2 font-bold"
                style={{ color: theme.rgb }}
              >
                About &amp; Philosophy
              </span>
              <h2 className="text-3xl md:text-[40px] leading-tight font-extrabold tracking-tight mb-5">
                Building thoughtful software means owning the experience from
                interface to infrastructure.
              </h2>
              <div className={`space-y-4 text-base sm:text-lg leading-relaxed ${mutedText}`}>
                <p>
                  I&apos;m <strong className="font-semibold">Ankur</strong>, a
                  full-stack developer focused on clean architecture, practical
                  tooling, and responsive interfaces across web, mobile, and
                  local systems.
                </p>
                <p>
                  Whether designing a custom desktop shell, wiring real-time
                  streams, or structuring backend APIs, I enjoy turning
                  multi-part technical ideas into dependable products people can
                  actually use.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => dispatch(openApp('email'))}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold shadow-md hover:scale-[1.02] transition-transform cursor-pointer ${ctaPrimary}`}
                >
                  <span>Start a conversation</span>
                  <FaEnvelope className="text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(openApp('resume'))}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${pillBg}`}
                >
                  <span>Open Resume</span>
                  <FaDownload className="text-sm" />
                </button>
              </div>
            </div>
          </section>

          {/* CLOSING CALLOUT */}
          <section className="w-full py-10 flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                backgroundColor: `rgba(${accentRgbClean}, 0.16)`,
                color: theme.rgb,
              }}
            >
              <FaPaperPlane className="text-2xl" />
            </div>
            <h3 className="text-3xl md:text-[44px] font-extrabold tracking-tight">
              Let&apos;s build something solid.
            </h3>
            <p className={`text-sm max-w-[540px] mt-1.5 mb-6 ${mutedText}`}>
              Open to full-stack engineering roles, collaborative builds, and
              practical product engineering.
            </p>
            <a
              className="text-xl font-bold hover:opacity-80 transition-opacity underline underline-offset-8"
              style={{ color: theme.rgb }}
              href="mailto:hi@ankursingh.dev"
            >
              hi@ankursingh.dev
            </a>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className={`w-full mt-8 ${cardLow}`}>
        <div className="max-w-[1120px] mx-auto px-6 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${mutedText}`}>
              Let&apos;s create together
            </span>
            <a
              className="text-base font-bold hover:opacity-80 transition-opacity"
              href="mailto:hi@ankursingh.dev"
            >
              hi@ankursingh.dev
            </a>
          </div>
          <div className={`flex flex-wrap items-center justify-center gap-6 text-sm font-semibold ${mutedText}`}>
            <button
              type="button"
              onClick={() => dispatch(openApp('github'))}
              className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer"
            >
              GitHub
            </button>
            <button
              type="button"
              onClick={() => dispatch(openApp('resume'))}
              className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => dispatch(openApp('email'))}
              className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer"
            >
              Email
            </button>
          </div>
          <div className={`text-xs ${mutedText}`}>
            © 2026 Ankur. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}