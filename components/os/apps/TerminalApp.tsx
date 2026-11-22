'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { openApp, closeApp, minimizeApp, toggleMaximizeApp } from '@/lib/features/dockSlice'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'success' | 'info'
  prompt?: string
  content: string
}

const SUDO_HELP_TEXT = `usage: sudo [-h | --help] [-h <subcommand>] <subcommand> [args]

Privileged DossierOS commands:
  open <app>       Open an app window (profile, email, github, available, apps)
  close <app>      Close an open app window (or 'all' to close all)
  maximize [app]   Toggle fullscreen mode for [app] or currently focused app
  neofetch         Display DossierOS system & hardware summary
  theme            Show current accent theme status

Help options:
  sudo -h, sudo --help, sudo -help       Show this help message
  sudo -h <subcommand>                   Show detailed help for a subcommand`

const SUBCOMMAND_HELP: Record<string, string> = {
  open: `sudo open <app>
  Launches a DossierOS application window.
  Available apps: profile, email, github, available, apps`,
  close: `sudo close <app | all>
  Closes a running application window or 'all' open windows.`,
  maximize: `sudo maximize [app]
  Toggles maximized/fullscreen state for the target app or focused window.`,
  neofetch: `sudo neofetch
  Prints DossierOS environment, theme accent, and developer profile info.`,
  theme: `sudo theme
  Displays the currently active theme accent package and hydration state.`,
}

const GENERAL_HELP_TEXT = `DossierOS Shell — Available Commands:
  help               Show available commands
  sudo ...           Run privileged OS commands (try 'sudo -h' or 'sudo -help')
  about              About Ankur & full-stack focus
  projects           List featured DossierOS projects
  skills             Show core technical stack
  open <app>         Open an app (profile, email, github, available, apps)
  whoami             Print current user
  date               Print current date & time
  echo <text>        Print text to terminal
  clear              Clear terminal output

Tip: Use ↑ / ↓ arrow keys to cycle command history.`

const VALID_APPS = ['profile', 'email', 'github', 'available', 'apps']

export default function TerminalApp() {
  const dispatch = useAppDispatch()
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const { focusedApp } = useAppSelector((state) => state.dock)

  const [isMounted, setIsMounted] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const theme = COLOR_PACKAGES[activeAccent]
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'welcome-1',
      type: 'info',
      content:
        "DossierOS Terminal v1.0.4 — Type 'help' or 'sudo -h' to get started.",
    },
  ])

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const appendLines = (newLines: Omit<TerminalLine, 'id'>[]) => {
    const stamped = newLines.map((line, idx) => ({
      ...line,
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    }))
    setLines((prev) => [...prev, ...stamped])
  }

  const handleSudo = (args: string[]) => {
    if (args.length === 0) {
      appendLines([
        {
          type: 'error',
          content: "sudo: a command or option is required. Try 'sudo -h' or 'sudo -help'.",
        },
      ])
      return
    }

    const first = args[0].toLowerCase()

    // `sudo -h`, `sudo --help`, `sudo -help`
    if (first === '-h' || first === '--help' || first === '-help') {
      const targetSub = args[1]?.toLowerCase()
      if (targetSub) {
        if (SUBCOMMAND_HELP[targetSub]) {
          appendLines([{ type: 'output', content: SUBCOMMAND_HELP[targetSub] }])
        } else {
          appendLines([
            {
              type: 'error',
              content: `sudo: unknown subcommand '${args[1]}'. Run 'sudo -h' to see all subcommands.`,
            },
          ])
        }
        return
      }
      appendLines([{ type: 'output', content: SUDO_HELP_TEXT }])
      return
    }

    // `sudo <subcommand> -h|--help|-help`
    if (args[1]?.toLowerCase() === '-h' || args[1]?.toLowerCase() === '--help' || args[1]?.toLowerCase() === '-help') {
      if (SUBCOMMAND_HELP[first]) {
        appendLines([{ type: 'output', content: SUBCOMMAND_HELP[first] }])
      } else {
        appendLines([{ type: 'output', content: SUDO_HELP_TEXT }])
      }
      return
    }

    switch (first) {
      case 'open': {
        const appId = args[1]?.toLowerCase()
        if (!appId || !VALID_APPS.includes(appId)) {
          appendLines([
            {
              type: 'error',
              content: `sudo open: specify a valid app (${VALID_APPS.join(', ')}).`,
            },
          ])
          return
        }
        dispatch(openApp(appId))
        appendLines([
          { type: 'success', content: `[sudo] Launched application '${appId}'.` },
        ])
        break
      }

      case 'close': {
        const target = args[1]?.toLowerCase()
        if (!target) {
          appendLines([
            {
              type: 'error',
              content: `sudo close: specify an app (${VALID_APPS.join(', ')}) or 'all'.`,
            },
          ])
          return
        }
        if (target === 'all') {
          VALID_APPS.forEach((appId) => {
            if (appId !== 'terminal') dispatch(closeApp(appId))
          })
          appendLines([
            { type: 'success', content: '[sudo] Closed all open app windows.' },
          ])
          return
        }
        if (!VALID_APPS.includes(target)) {
          appendLines([
            { type: 'error', content: `sudo close: unknown app '${args[1]}'.` },
          ])
          return
        }
        dispatch(closeApp(target))
        appendLines([
          { type: 'success', content: `[sudo] Closed '${target}'.` },
        ])
        break
      }

      case 'maximize': {
        const targetApp = (args[1]?.toLowerCase() || focusedApp || 'terminal')
        dispatch(toggleMaximizeApp(targetApp))
        appendLines([
          { type: 'success', content: `[sudo] Toggled maximize on '${targetApp}'.` },
        ])
        break
      }

      case 'neofetch': {
        appendLines([
          {
            type: 'info',
            content: `ankur@dossieros
───────────────
OS: DossierOS Web Desktop (Next.js 16)
User: Ankur (Full-Stack Developer)
Accent: ${activeAccent} (${theme.rgb})
Stack: React, Next.js, Node.js, WebRTC, PostgreSQL, MongoDB
Shell: dossier-sh 1.0`,
          },
        ])
        break
      }

      case 'theme': {
        appendLines([
          {
            type: 'output',
            content: `Active Accent: ${activeAccent}\nRGB Value:     ${theme.rgb}`,
          },
        ])
        break
      }

      default:
        appendLines([
          {
            type: 'error',
            content: `sudo: ${args[0]}: command not found. Try 'sudo -h' or 'sudo -help'.`,
          },
        ])
    }
  }

  const runCommand = (raw: string) => {
    const trimmed = raw.trim()
    const promptLabel = 'ankur@dossieros:~$'

    if (!trimmed) {
      appendLines([{ type: 'input', prompt: promptLabel, content: '' }])
      return
    }

    appendLines([{ type: 'input', prompt: promptLabel, content: trimmed }])
    setHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)

    const parts = trimmed.split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (cmd) {
      case 'clear':
        setLines([])
        break

      case 'help':
        appendLines([{ type: 'output', content: GENERAL_HELP_TEXT }])
        break

      case 'sudo':
        handleSudo(args)
        break

      case 'about':
        appendLines([
          {
            type: 'output',
            content:
              'Ankur — Full-Stack Web & Mobile Application Developer building real-time web systems, cross-platform apps, and interactive UIs.',
          },
        ])
        break

      case 'projects':
        appendLines([
          {
            type: 'output',
            content: `Featured Projects:
  • DossierOS        — Interactive web desktop portfolio OS
  • ZeroStream       — Multi-node live sports streaming platform (WebRTC + Node.js)
  • firstXchange     — Full-stack crypto exchange (Next.js + Express + PostgreSQL)
  • DPL Scorer       — Real-time tournament cricket scoring app (Socket.io + MongoDB)
  • Available        — No-login ephemeral text & file sharing
  • one-wallet-react — Published npm React component package`,
          },
        ])
        break

      case 'skills':
        appendLines([
          {
            type: 'output',
            content:
              'Frontend/Mobile: React, Next.js, JS/TS, Tailwind, React Native, Expo, Kotlin\nBackend/Real-Time: Node.js, Express, Socket.io, WebRTC, REST APIs, Python, PHP\nData & Infra: PostgreSQL, MongoDB, MySQL, Firebase, Docker, AWS EC2, Linux',
          },
        ])
        break

      case 'open': {
        const appId = args[0]?.toLowerCase()
        if (!appId || !VALID_APPS.includes(appId)) {
          appendLines([
            {
              type: 'error',
              content: `open: usage: open <${VALID_APPS.join(' | ')}>`,
            },
          ])
          return
        }
        dispatch(openApp(appId))
        appendLines([{ type: 'success', content: `Opening ${appId}...` }])
        break
      }

      case 'whoami':
        appendLines([{ type: 'output', content: 'ankur' }])
        break

      case 'date':
        appendLines([{ type: 'output', content: new Date().toString() }])
        break

      case 'echo':
        appendLines([{ type: 'output', content: args.join(' ') }])
        break

      case 'exit':
        dispatch(minimizeApp('terminal'))
        break

      default:
        appendLines([
          {
            type: 'error',
            content: `sh: command not found: ${parts[0]}. Type 'help' for available commands.`,
          },
        ])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runCommand(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const nextIdx =
        historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIdx)
      setInput(history[nextIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const nextIdx = historyIndex + 1
      if (nextIdx >= history.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(nextIdx)
        setInput(history[nextIdx])
      }
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full w-full overflow-y-auto bg-[#070a0f] text-slate-200 font-mono text-xs sm:text-[13px] p-3.5 sm:p-5 select-text cursor-text"
    >
      <div className="flex flex-col gap-2">
        {lines.map((line) => {
          if (line.type === 'input') {
            return (
              <div key={line.id} className="flex flex-wrap items-baseline gap-2">
                <span
                  className="font-semibold shrink-0"
                  style={{ color: theme.rgb }}
                >
                  {line.prompt}
                </span>
                <span className="text-white break-all">{line.content}</span>
              </div>
            )
          }

          const colorClass =
            line.type === 'error'
              ? 'text-rose-400'
              : line.type === 'success'
              ? 'text-emerald-400'
              : line.type === 'info'
              ? 'text-sky-300'
              : 'text-slate-300'

          return (
            <pre
              key={line.id}
              className={`whitespace-pre-wrap break-words leading-relaxed ${colorClass}`}
            >
              {line.content}
            </pre>
          )
        })}

        {/* Active Prompt Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-0.5">
          <span
            className="font-semibold shrink-0"
            style={{ color: theme.rgb }}
          >
            ankur@dossieros:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command input"
            className="flex-1 min-w-0 bg-transparent text-white outline-none caret-current"
            style={{
              caretColor: theme.rgb,
              textShadow: `0 0 10px rgba(${accentRgbClean}, 0.2)`,
            }}
          />
        </form>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}