'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import {
  FaFilePdf,
  FaFileWord,
  FaDownload,
  FaExternalLinkAlt,
  FaPrint,
  FaSearchPlus,
  FaSearchMinus,
  FaUndo,
} from 'react-icons/fa'

const RESUME_PDF_URL = '/resume/Ankur_Singh_Resume.pdf'
const RESUME_DOCX_URL = '/resume/Ankur_Singh_Resume.docx'

export default function ResumeViewerApp() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [zoom, setZoom] = useState<number>(100)
  const [pdfAvailable, setPdfAvailable] = useState<boolean | null>(null)
  const [docxAvailable, setDocxAvailable] = useState<boolean | null>(null)
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'docx' | null>(
    null
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Verify static resume assets exist in /public/resume/
  useEffect(() => {
    let cancelled = false

    const checkAsset = async (url: string, setter: (ok: boolean) => void) => {
      try {
        const res = await fetch(url, { method: 'HEAD' })
        if (!cancelled) setter(res.ok)
      } catch {
        if (!cancelled) setter(false)
      }
    }

    checkAsset(RESUME_PDF_URL, setPdfAvailable)
    checkAsset(RESUME_DOCX_URL, setDocxAvailable)

    return () => {
      cancelled = true
    }
  }, [])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const handleDownload = useCallback(
    async (format: 'pdf' | 'docx') => {
      const url = format === 'pdf' ? RESUME_PDF_URL : RESUME_DOCX_URL
      const filename =
        format === 'pdf'
          ? 'Ankur_Singh_Resume.pdf'
          : 'Ankur_Singh_Resume.docx'

      setDownloadingFormat(format)
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Resume ${format.toUpperCase()} not found`)

        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
      } catch {
        // Fallback direct navigation if blob download fails
        window.open(url, '_blank', 'noopener,noreferrer')
      } finally {
        setDownloadingFormat(null)
      }
    },
    []
  )

  const handlePrint = useCallback(() => {
    const printWin = window.open(RESUME_PDF_URL, '_blank', 'noopener,noreferrer')
    if (printWin) {
      printWin.addEventListener('load', () => {
        printWin.print()
      })
    }
  }, [])

  const toolbarBtnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-300/80 text-slate-800'
    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-gray-200'

  const pdfViewerSrc = `${RESUME_PDF_URL}#toolbar=0&navpanes=0&view=FitH&zoom=${zoom}`

  return (
    <div
      className={`h-full w-full flex flex-col overflow-hidden select-none transition-colors duration-200 ${surface.appBg} ${surface.textPrimary}`}
    >
      {/* Top Action & Export Toolbar */}
      <div
        className={`shrink-0 px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${surface.subtleBg} ${surface.borderSubtle}`}
      >
        {/* Left: Document Title & Metadata */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `rgba(${accentRgbClean}, 0.16)`,
              color: theme.rgb,
            }}
          >
            <FaFilePdf className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold truncate">
              Ankur_Singh_Resume.pdf
            </h2>
            <p className={`text-[11px] font-mono truncate ${surface.textMuted}`}>
              Full-Stack Developer · Curriculum Vitae
            </p>
          </div>
        </div>

        {/* Center: Zoom & Print Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(50, z - 15))}
            title="Zoom Out"
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${toolbarBtnClass}`}
          >
            <FaSearchMinus className="w-3.5 h-3.5" />
          </button>

          <span
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono min-w-[54px] text-center ${surface.subtleBg} ${surface.borderSubtle}`}
          >
            {zoom}%
          </span>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(200, z + 15))}
            title="Zoom In"
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${toolbarBtnClass}`}
          >
            <FaSearchPlus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset Zoom"
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${toolbarBtnClass}`}
          >
            <FaUndo className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={pdfAvailable === false}
            title="Print Resume"
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-40 ${toolbarBtnClass}`}
          >
            <FaPrint className="w-3.5 h-3.5" />
          </button>

          <a
            href={RESUME_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open PDF in New Tab"
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${toolbarBtnClass}`}
          >
            <FaExternalLinkAlt className="w-3 h-3" />
          </a>
        </div>

        {/* Right: Download Buttons (PDF & DOC/DOCX) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownload('docx')}
            disabled={docxAvailable === false || downloadingFormat !== null}
            title={
              docxAvailable === false
                ? 'Add Ankur_Singh_Resume.docx to /public/resume/ to enable Word download'
                : 'Download as Word (.docx)'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${toolbarBtnClass}`}
          >
            <FaFileWord className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {downloadingFormat === 'docx' ? 'Downloading...' : 'DOCX'}
            </span>
            <FaDownload className="w-2.5 h-2.5 opacity-75" />
          </button>

          <button
            type="button"
            onClick={() => handleDownload('pdf')}
            disabled={pdfAvailable === false || downloadingFormat !== null}
            title="Download as PDF"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition hover:brightness-110 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.rgb }}
          >
            <FaFilePdf className="w-3.5 h-3.5" />
            <span>
              {downloadingFormat === 'pdf' ? 'Downloading...' : 'Download PDF'}
            </span>
            <FaDownload className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Main PDF Preview Frame */}
      <div
        className={`flex-1 min-h-0 p-3 sm:p-4 overflow-hidden flex items-center justify-center ${
          isLight ? 'bg-slate-200/70' : 'bg-[#090c10]'
        }`}
      >
        {pdfAvailable === false ? (
          <div
            className={`max-w-md w-full rounded-2xl border p-6 text-center flex flex-col items-center gap-3 ${surface.cardBg} ${surface.borderSubtle}`}
          >
            <FaFilePdf
              className="w-10 h-10 opacity-80"
              style={{ color: theme.rgb }}
            />
            <h3 className="text-sm font-semibold">Resume PDF Not Found</h3>
            <p className={`text-xs leading-relaxed ${surface.textMuted}`}>
              Place your resume file at{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/20 font-mono">
                public/resume/Ankur_Singh_Resume.pdf
              </code>{' '}
              (and optionally{' '}
              <code className="px-1.5 py-0.5 rounded bg-black/20 font-mono">
                Ankur_Singh_Resume.docx
              </code>
              ) to preview and download it here.
            </p>
          </div>
        ) : (
          <div
            className={`w-full h-full max-w-4xl rounded-xl border overflow-hidden shadow-2xl ${
              isLight
                ? 'bg-white border-slate-300'
                : 'bg-[#161b22] border-white/10'
            }`}
          >
            <iframe
              key={pdfViewerSrc}
              src={pdfViewerSrc}
              title="Resume PDF Preview"
              className="w-full h-full border-0 block"
            />
          </div>
        )}
      </div>
    </div>
  )
}