'use client'

import React, { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
import { IoMdSend } from 'react-icons/io'
import { FaCheckCircle, FaExclamationTriangle, FaPaperclip } from 'react-icons/fa'

interface ContactFormState {
  name: string
  email: string
  subject: string
  message: string
}

const INITIAL_FORM: ContactFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const QUICK_TOPICS = [
  'Full-Stack Role',
  'Freelance / Project',
  'Collaboration',
  'General Hello',
]

export default function EmailApp() {
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const theme = COLOR_PACKAGES[isMounted && hydrated ? accent : 'blue']

  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (status) setStatus(null)
  }

  const applyTopic = (topic: string) => {
    setForm((prev) => ({
      ...prev,
      subject: prev.subject === topic ? '' : topic,
    }))
    if (status) setStatus(null)
  }

  const submitMessage = async () => {
    if (sending) return

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({
        type: 'error',
        text: 'Please complete your name, email address, and message.',
      })
      return
    }

    setSending(true)
    setStatus(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || 'DossierOS Direct Message',
          message: form.message.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Could not dispatch message.')
      }

      setStatus({
        type: 'success',
        text: 'Dispatched successfully — your note is in my inbox.',
      })
      setForm(INITIAL_FORM)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong while sending.'
      setStatus({ type: 'error', text: msg })
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      submitMessage()
    }
  }

  return (
    <div className="relative h-full overflow-y-auto overflow-x-hidden bg-[#090c12] text-slate-200 selection:bg-white/15">
      {/* Subtle ambient accent wash */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 sm:w-72 sm:h-72 rounded-full blur-[110px] opacity-20 transition-colors duration-300"
        style={{ backgroundColor: theme.rgb }}
      />

      <div className="relative min-h-full w-full max-w-2xl mx-auto px-3.5 py-4 sm:px-7 sm:py-6 flex flex-col gap-3.5 sm:gap-5">
        {/* Composer Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3 sm:pb-4">
          <div className="min-w-0">
            {/* <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-slate-400 font-medium">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: theme.rgb,
                  boxShadow: `0 0 10px ${theme.rgb}`,
                }}
              />
              New Message
            </div> */}
            <h2 className="text-base sm:text-xl font-semibold tracking-tight text-white mt-0.5 sm:mt-1 truncate">
              Start a Conversation
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-2">
              Engineering roles, product builds, or creative collaborations.
            </p>
          </div>

          {/* <div className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-[11px] text-slate-400 shrink-0">
            <FaPaperclip className="w-2.5 h-2.5 opacity-70" />
            <span>Direct</span>
          </div> */}
        </div>

        {/* Quick Topic Pills (horizontal scroll on mobile, wrapped on desktop) */}
        <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[11px] text-slate-500 mr-0.5 shrink-0">
            Topic:
          </span>
          {QUICK_TOPICS.map((topic) => {
            const active = form.subject === topic
            return (
              <button
                key={topic}
                type="button"
                onClick={() => applyTopic(topic)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer shrink-0 whitespace-nowrap"
                style={
                  active
                    ? {
                        backgroundColor: `rgba(${theme.rgb.replace(/[^\d,]/g, '')}, 0.18)`,
                        borderColor: theme.rgb,
                        color: '#ffffff',
                      }
                    : {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#94a3b8',
                      }
                }
              >
                {topic}
              </button>
            )
          })}
        </div>

        {/* Mail Fields */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3 sm:gap-3.5">
          <div className="flex-1 flex flex-col rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] divide-y divide-white/[0.07] overflow-hidden">
            {/* From Row: Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07]">
              <label className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 focus-within:bg-white/[0.02] transition">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 w-14 sm:w-12 shrink-0">
                  From
                </span>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none"
                />
              </label>

              <label className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 focus-within:bg-white/[0.02] transition">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 w-14 sm:w-auto shrink-0">
                  Reply
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                  className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none"
                />
              </label>
            </div>

            {/* Subject Row */}
            <label className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 focus-within:bg-white/[0.02] transition">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 w-14 sm:w-12 shrink-0">
                Subject
              </span>
              <input
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is this regarding?"
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none"
              />
            </label>

            {/* Body Row */}
            <div className="flex-1 flex flex-col px-3 sm:px-4 py-2.5 sm:py-3 focus-within:bg-white/[0.02] transition">
              <textarea
                name="message"
                rows={4}
                required
                value={form.message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Write your message..."
                className="w-full flex-1 min-h-[100px] sm:min-h-[130px] bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Status Banner */}
          {status && (
            <div
              className={`flex items-start sm:items-center gap-2.5 px-3 sm:px-3.5 py-2.5 rounded-xl text-xs border ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
              }`}
            >
              {status.type === 'success' ? (
                <FaCheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <FaExclamationTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <span className="leading-snug">{status.text}</span>
            </div>
          )}

          {/* Footer Bar */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-0.5">
            <span className="text-[11px] text-slate-500 text-center sm:text-left">
              {form.message.length} chars
              <span className="hidden sm:inline"> • Ctrl/⌘ + Enter to send</span>
            </span>

            <button
              type="submit"
              disabled={sending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-white shadow-lg transition transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: theme.rgb,
                boxShadow: `0 8px 24px -8px ${theme.rgb}`,
              }}
            >
              <IoMdSend className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}