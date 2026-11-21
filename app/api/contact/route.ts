import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function createTransporter() {
  const host = process.env.SMTP_HOST?.trim()
  const port = Number(process.env.SMTP_PORT || 587)
  // Only use implicit TLS on connect when explicitly set to "true"
  const secure = process.env.SMTP_SECURE === 'true'
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is incomplete in environment variables.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const subject = String(body?.subject ?? 'Portfolio OS Inquiry').trim() || 'Portfolio OS Inquiry'
    const message = String(body?.message ?? '').trim()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL || `"Portfolio OS" <${process.env.SMTP_USER}>`

    if (!toEmail) {
      return NextResponse.json(
        { error: 'Recipient email address is not configured.' },
        { status: 500 }
      )
    }

    const transporter = createTransporter()

    await transporter.sendMail({
  from: fromEmail,
  to: toEmail,
  // Omit `replyTo: email` if the SMTP server requires Reply-To to match the authenticated mailbox
  subject: `[DossierOS Contact] ${subject}`,
  text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
  html: `
    <div style="font-family: sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 12px;">New DossierOS Contact Message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `,
})

    return NextResponse.json({ ok: true, message: 'Email sent successfully.' })
  } catch (err: unknown) {
    console.error('Nodemailer send error:', err)
    const errorMessage =
      err instanceof Error ? "Some error occured from server side, please try again later." : 'Failed to send email.'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}