'use client'

import React, { useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
import { IoMdSend } from 'react-icons/io'
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

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

export default function EmailApp() {
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[hydrated ? accent : 'blue']

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({
        type: 'error',
        text: 'Please fill in your name, email, and message.',
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
          subject: form.subject.trim() || 'Portfolio OS Inquiry',
          message: form.message.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.')
      }

      setStatus({
        type: 'success',
        text: 'Message sent! Thanks for reaching out.',
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

  return (
    <div className="h-full overflow-y-auto bg-[#0d1117] text-gray-200 p-4 sm:p-6">
      <div className="max-w-xl mx-auto flex flex-col gap-4">
        <div className="border-b border-white/10 pb-3">
          <h2 className="text-base font-semibold text-white">Contact Us</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Send a direct message for collaboration, freelance work, or inquiries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="contact-name" className="text-xs text-gray-300">
                Your Name *
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-white/10 focus:border-white/30 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="contact-email" className="text-xs text-gray-300">
                Email Address *
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-white/10 focus:border-white/30 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="contact-subject" className="text-xs text-gray-300">
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              placeholder="Project inquiry / Opportunity"
              className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-white/10 focus:border-white/30 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="contact-message" className="text-xs text-gray-300">
              Message *
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              required
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-white/10 focus:border-white/30 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none transition resize-none"
            />
          </div>

          {status && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {status.type === 'success' ? (
                <FaCheckCircle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <FaExclamationTriangle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{status.text}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white shadow-lg transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: theme.rgb }}
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