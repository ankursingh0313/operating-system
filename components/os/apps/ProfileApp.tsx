'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { openApp } from '@/lib/features/dockSlice'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import {
  FaGithub,
  FaEnvelope,
  FaExternalLinkAlt,
  FaCode,
  FaLayerGroup,
  FaTerminal,
  FaMapMarkerAlt,
  FaCheckCircle,
} from 'react-icons/fa'

type ProjectCategory = 'All' | 'Full-Stack' | 'Real-Time' | 'Tools & Packages'

interface PortfolioProject {
  id: string
  title: string
  tagline: string
  category: Exclude<ProjectCategory, 'All'>
  description: string
  stack: string[]
  highlights: string[]
  liveUrl?: string
  repoUrl?: string
  featured?: boolean
}

const PROJECTS: PortfolioProject[] = [
  {
    id: 'dossieros',
    title: 'DossierOS',
    tagline: 'Interactive Web Desktop Portfolio Environment',
    category: 'Full-Stack',
    description:
      'A browser-based operating system featuring draggable/resizable windows, dynamic accent themes, live widgets, an app launcher, and an integrated SMTP mail client.',
    stack: ['Next.js', 'React', 'Redux Toolkit', 'Tailwind CSS', 'Docker', 'AWS EC2'],
    highlights: [
      'Custom z-index window manager & dock state',
      'Local audio player & live GitHub widget integration',
      'Containerized deployment on AWS EC2',
    ],
    repoUrl: 'https://github.com/ankursingh0313',
    featured: true,
  },
  {
    id: 'zerostream',
    title: 'ZeroStream',
    tagline: 'Multi-Node Live Sports Streaming Platform',
    category: 'Real-Time',
    description:
      'Low-latency multi-camera sports broadcasting system pairing mobile WebRTC streaming nodes with a centralized signaling server and live host control dashboard.',
    stack: ['Node.js', 'Express', 'Next.js', 'WebRTC', 'Socket.io', 'Kotlin', 'Expo'],
    highlights: [
      'Multi-node camera switching for live matches',
      'Custom WebRTC signaling & room orchestration',
      'Cross-platform Android/Expo broadcaster clients',
    ],
    repoUrl: 'https://github.com/ankursingh0313',
    featured: true,
  },
  {
    id: 'firstxchange',
    title: 'firstXchange',
    tagline: 'Cryptocurrency Trading & Exchange Platform',
    category: 'Full-Stack',
    description:
      'Full-stack digital asset exchange architecture with a responsive trading frontend, secure API gateway, OTP verification flows, and relational ledger storage.',
    stack: ['Next.js', 'Node.js', 'Express', 'PostgreSQL', 'JWT', 'REST API'],
    highlights: [
      'JWT authentication with email OTP verification',
      'Relational order & wallet balance schema in PostgreSQL',
      'Modular API gateway architecture',
    ],
    repoUrl: 'https://github.com/ankursingh0313',
    featured: true,
  },
  {
    id: 'dpl',
    title: 'Dhansiriya Premier League',
    tagline: 'Live Tournament Cricket Scoring Web App',
    category: 'Real-Time',
    description:
      'Real-time ball-by-ball cricket scoring and tournament management platform built for local league matches with instant spectator scorecard updates.',
    stack: ['React', 'Next.js', 'Node.js', 'Socket.io', 'MongoDB', 'Tailwind CSS'],
    highlights: [
      'Live ball-by-ball score sync via Socket.io',
      'Automated run-rate, over summaries & player stats',
      'Mobile-first scorer interface for ground use',
    ],
    liveUrl: 'https://dhansiriyapremierleague.vercel.app',
    repoUrl: 'https://github.com/ankursingh0313',
  },
  {
    id: 'available',
    title: 'Available',
    tagline: 'No-Login Ephemeral Text & File Sharing',
    category: 'Tools & Packages',
    description:
      'Zero-friction cross-device sharing platform using short 4-character room codes to transfer snippets and files instantly without account setup.',
    stack: ['Next.js', 'Node.js', 'Socket.io', 'Tailwind CSS'],
    highlights: [
      '4-character instant room pairing',
      'Ephemeral session lifecycle with auto-cleanup',
      'Fast clipboard & file handoff across devices',
    ],
    liveUrl: 'https://available.org.in',
    repoUrl: 'https://github.com/ankursingh0313',
  },
  {
    id: 'one-wallet-react',
    title: 'one-wallet-react',
    tagline: 'Published npm React Component Package',
    category: 'Tools & Packages',
    description:
      'Reusable React wallet UI and integration component package published to the npm registry for rapid Web3/crypto frontend prototyping.',
    stack: ['React', 'JavaScript', 'npm', 'CSS'],
    highlights: [
      'Published and versioned on npm registry',
      'Lightweight, drop-in component API',
    ],
    repoUrl: 'https://github.com/ankursingh0313',
  },
]

const SKILL_GROUPS = [
  {
    title: 'Frontend & Mobile',
    items: ['React', 'Next.js', 'JavaScript (ES6+)', 'TypeScript', 'Tailwind CSS', 'React Native', 'Expo', 'Kotlin'],
  },
  {
    title: 'Backend & Real-Time',
    items: ['Node.js', 'Express', 'Socket.io', 'WebRTC', 'REST APIs', 'Python', 'PHP', 'Go'],
  },
  {
    title: 'Databases & DevOps',
    items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Firebase', 'Docker', 'AWS EC2', 'Linux', 'Git'],
  },
]

const CATEGORIES: ProjectCategory[] = ['All', 'Full-Stack', 'Real-Time', 'Tools & Packages']

export default function ProfileApp() {
  const dispatch = useAppDispatch()
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const filteredProjects =
    activeCategory === 'All'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory)

  const badgeTextColor = isLight ? surface.textPrimary : '#ffffff'

  return (
    <div
      className={`relative h-full overflow-y-auto overflow-x-hidden transition-colors duration-200 ${surface.appBg} ${surface.textSecondary} ${
        isLight ? 'selection:bg-slate-900/10' : 'selection:bg-white/15'
      }`}
    >
      {/* Hero Cover Section with Cutout Portrait */}
      <section
        className={`relative overflow-hidden border-b ${surface.borderSubtle} ${
          isLight
            ? 'bg-gradient-to-b from-white/80 to-transparent'
            : 'bg-gradient-to-b from-white/[0.03] to-transparent'
        }`}
      >
        {/* Ambient Accent Glow Behind Cutout */}
        <div
          className="pointer-events-none absolute -top-20 right-4 sm:right-12 w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-[110px] opacity-30 transition-colors duration-300"
          style={{ backgroundColor: theme.rgb }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full blur-[120px] opacity-15"
          style={{ backgroundColor: theme.rgb }}
        />

        {/* Subtle Architectural Grid Overlay */}
        <div
          className={`pointer-events-none absolute inset-0 ${
            isLight ? 'opacity-[0.05]' : 'opacity-[0.04]'
          }`}
          style={{
            backgroundImage: isLight
              ? 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)'
              : 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-6 sm:px-8 sm:pt-8">
          <div className="grid grid-cols-1 md:grid-cols-12 items-end gap-6">
            {/* Left Column: Intro & CTAs */}
            <div className="md:col-span-7 pb-6 sm:pb-8 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                  style={{
                    backgroundColor: `rgba(${accentRgbClean}, ${isLight ? '0.16' : '0.14'})`,
                    borderColor: `rgba(${accentRgbClean}, 0.45)`,
                    color: isLight ? '#0f172a' : '#ffffff',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: theme.rgb }}
                  />
                  Open to Full-Stack Roles
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${surface.textMuted} ${surface.subtleBg} ${surface.borderSubtle}`}
                >
                  <FaMapMarkerAlt className="w-2.5 h-2.5 opacity-75" />
                  India • Remote / On-site
                </span>
              </div>

              <div>
                <h1
                  className={`text-2xl sm:text-4xl font-bold tracking-tight ${surface.textPrimary}`}
                >
                  Ankur
                </h1>
                <p
                  className="text-sm sm:text-base font-medium mt-1"
                  style={{ color: theme.rgb }}
                >
                  Full-Stack Web &amp; Mobile Application Developer
                </p>
                <p
                  className={`text-xs sm:text-sm mt-2.5 leading-relaxed max-w-xl ${surface.textMuted}`}
                >
                  Building real-time web systems, cross-platform mobile apps, and
                  interactive interfaces with React, Next.js, Node.js, WebRTC, and
                  PostgreSQL.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => dispatch(openApp('email'))}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white shadow-lg transition transform active:scale-[0.98] cursor-pointer"
                  style={{
                    backgroundColor: theme.rgb,
                    boxShadow: `0 8px 24px -8px ${theme.rgb}`,
                  }}
                >
                  <FaEnvelope className="w-3.5 h-3.5" />
                  <span>Hire / Contact</span>
                </button>

                <button
                  type="button"
                  onClick={() => dispatch(openApp('github'))}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition cursor-pointer ${surface.textPrimary} ${surface.subtleBg} ${surface.cardHoverBg} ${surface.border}`}
                >
                  <FaGithub className="w-4 h-4" />
                  <span>GitHub Stats</span>
                </button>

                <a
                  href="#projects-section"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${surface.textMuted} hover:opacity-100`}
                >
                  <span>Explore Work</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>

              {/* Quick Highlights Bar */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-md">
                <div
                  className={`p-2.5 rounded-xl border ${surface.subtleBg} ${surface.borderSubtle}`}
                >
                  <div className={`text-sm sm:text-base font-bold ${surface.textPrimary}`}>
                    6+
                  </div>
                  <div className={`text-[10px] sm:text-[11px] ${surface.textMuted}`}>
                    Shipped Systems
                  </div>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${surface.subtleBg} ${surface.borderSubtle}`}
                >
                  <div className={`text-sm sm:text-base font-bold ${surface.textPrimary}`}>
                    MERN + SQL
                  </div>
                  <div className={`text-[10px] sm:text-[11px] ${surface.textMuted}`}>
                    Full-Stack Core
                  </div>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${surface.subtleBg} ${surface.borderSubtle}`}
                >
                  <div className={`text-sm sm:text-base font-bold ${surface.textPrimary}`}>
                    WebRTC
                  </div>
                  <div className={`text-[10px] sm:text-[11px] ${surface.textMuted}`}>
                    Real-Time Media
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Cutout Portrait Anchored to Cover Bottom */}
            <div className="md:col-span-5 relative flex justify-center md:justify-end self-end">
              {/* Soft Ring Backdrop behind cutout */}
              <div
                className={`pointer-events-none absolute bottom-4 w-52 h-52 sm:w-64 sm:h-64 rounded-full border ${surface.borderSubtle}`}
                style={{
                  background: `radial-gradient(circle, rgba(${accentRgbClean}, 0.22) 0%, transparent 70%)`,
                }}
              />

              <div className="relative w-56 h-64 sm:w-64 sm:h-72 md:w-72 md:h-80 select-none">
                <Image
                  src="/images/profile/ankur-full.png"
                  alt="Ankur"
                  fill
                  priority
                  sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, 288px"
                  className={`object-contain object-bottom ${
                    isLight
                      ? 'drop-shadow-[0_14px_24px_rgba(15,23,42,0.22)]'
                      : 'drop-shadow-[0_14px_28px_rgba(0,0,0,0.65)]'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-8 flex flex-col gap-8">
        {/* Featured Projects Section */}
        <section id="projects-section" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div
                className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-medium ${surface.textMuted}`}
              >
                <FaLayerGroup className="w-3 h-3" style={{ color: theme.rgb }} />
                <span>Selected Engineering Work</span>
              </div>
              <h2
                className={`text-lg sm:text-xl font-semibold mt-0.5 ${surface.textPrimary}`}
              >
                Featured Projects
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((category) => {
                const active = activeCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer shrink-0 ${
                      active
                        ? ''
                        : `${surface.subtleBg} ${surface.borderSubtle} ${surface.textMuted}`
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: `rgba(${accentRgbClean}, 0.18)`,
                            borderColor: theme.rgb,
                            color: badgeTextColor,
                          }
                        : undefined
                    }
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Responsive Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className={`group relative rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition ${
                  isLight
                    ? 'bg-white/90 hover:bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    : 'bg-white/[0.025] hover:bg-white/[0.045] border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-semibold ${surface.textPrimary}`}>
                          {project.title}
                        </h3>
                        {project.featured && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `rgba(${accentRgbClean}, 0.18)`,
                              color: badgeTextColor,
                            }}
                          >
                            Featured
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${surface.textMuted}`}>
                        {project.tagline}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Source Code"
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition ${surface.subtleBg} ${surface.cardHoverBg} ${surface.borderSubtle} ${surface.textSecondary}`}
                        >
                          <FaGithub className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Live Demo"
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition ${surface.subtleBg} ${surface.cardHoverBg} ${surface.borderSubtle} ${surface.textSecondary}`}
                        >
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed ${surface.textSecondary}`}>
                    {project.description}
                  </p>

                  <ul className="flex flex-col gap-1 pt-0.5">
                    {project.highlights.map((item) => (
                      <li
                        key={item}
                        className={`flex items-start gap-2 text-[11px] ${surface.textMuted}`}
                      >
                        <FaCheckCircle
                          className="w-3 h-3 mt-0.5 shrink-0 opacity-80"
                          style={{ color: theme.rgb }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack Chips */}
                <div
                  className={`flex flex-wrap gap-1.5 pt-2 border-t ${surface.borderSubtle}`}
                >
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className={`px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-mono ${surface.subtleBg} ${surface.borderSubtle} ${surface.textSecondary}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Technical Stack Section */}
        <section className="flex flex-col gap-4">
          <div>
            <div
              className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-medium ${surface.textMuted}`}
            >
              <FaTerminal className="w-3 h-3" style={{ color: theme.rgb }} />
              <span>Core Capabilities</span>
            </div>
            <h2
              className={`text-lg sm:text-xl font-semibold mt-0.5 ${surface.textPrimary}`}
            >
              Technical Stack
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SKILL_GROUPS.map((group) => (
              <div
                key={group.title}
                className={`rounded-2xl border p-4 flex flex-col gap-3 ${
                  isLight
                    ? 'bg-white/90 border-slate-200 shadow-sm'
                    : 'bg-white/[0.025] border-white/[0.08]'
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-xs font-semibold ${surface.textPrimary}`}
                >
                  <FaCode className="w-3.5 h-3.5" style={{ color: theme.rgb }} />
                  <span>{group.title}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] ${surface.subtleBg} ${surface.borderSubtle} ${surface.textSecondary}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Strip */}
        <section
          className={`rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isLight
              ? 'bg-white/90 border-slate-200 shadow-sm'
              : 'bg-white/[0.03] border-white/[0.08]'
          }`}
        >
          <div>
            <h3 className={`text-base font-semibold ${surface.textPrimary}`}>
              Interested in working together?
            </h3>
            <p className={`text-xs mt-0.5 ${surface.textMuted}`}>
              Send a message directly through the DossierOS Email Client.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(openApp('email'))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white shadow-lg transition transform active:scale-[0.98] cursor-pointer shrink-0"
            style={{
              backgroundColor: theme.rgb,
              boxShadow: `0 8px 24px -8px ${theme.rgb}`,
            }}
          >
            <FaEnvelope className="w-3.5 h-3.5" />
            <span>Open Email Client</span>
          </button>
        </section>
      </div>
    </div>
  )
}