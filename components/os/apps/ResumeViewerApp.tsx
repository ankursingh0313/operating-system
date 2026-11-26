'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import {
  FaFilePdf,
  FaFileWord,
  FaDownload,
  FaExternalLinkAlt,
  FaSearchPlus,
  FaSearchMinus,
  FaUndo,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'

const RESUME_PDF_URL = '/resume/Ankur_Singh_Resume.pdf'
const RESUME_DOCX_URL = '/resume/Ankur_Singh_Resume.docx'
const WORKER_SRC_URL = '/pdf.worker.min.mjs'

export default function ResumeViewerApp() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [loadVersion, setLoadVersion] = useState(0)
  const [zoom, setZoom] = useState<number>(100)
  const [pageNum, setPageNum] = useState<number>(1)
  const [numPages, setNumPages] = useState<number>(0)
  const [rendering, setRendering] = useState<boolean>(true)
  const [viewerError, setViewerError] = useState<string | null>(null)
  const [docxAvailable, setDocxAvailable] = useState<boolean | null>(null)
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'docx' | null>(
    null
  )

  const pdfDocRef = useRef<PDFDocumentProxy | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(680)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Track available container width so pages fit cleanly on both mobile and desktop
  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    const updateWidth = () => {
      const nextWidth = Math.max(260, el.clientWidth - 24)
      setContainerWidth(nextWidth)
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(el)
    return () => observer.disconnect()
  }, [isMounted])

  // Check if optional DOCX file exists
  useEffect(() => {
    let cancelled = false
    fetch(RESUME_DOCX_URL, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) setDocxAvailable(res.ok)
      })
      .catch(() => {
        if (!cancelled) setDocxAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])


  // Load PDF document via pdfjs-dist (client-side only)
  useEffect(() => {
    if (!isMounted) return
    let cancelled = false

    async function loadPdf() {
      setRendering(true)
      setViewerError(null)
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER_SRC_URL

        const fileRes = await fetch(RESUME_PDF_URL, { cache: 'no-store' })
        if (!fileRes.ok) {
          throw new Error(
            `Resume file not found at ${RESUME_PDF_URL} (HTTP ${fileRes.status})`
          )
        }

        const contentType = fileRes.headers.get('content-type') || ''
        if (contentType.includes('text/html')) {
          throw new Error(
            `Expected a PDF at ${RESUME_PDF_URL}, but received HTML. Check that the file is in public/resume/.`
          )
        }

        const buffer = await fileRes.arrayBuffer()
        if (buffer.byteLength === 0) {
          throw new Error(`Resume PDF at ${RESUME_PDF_URL} is empty (0 bytes).`)
        }

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(buffer),
        })
        const doc = await loadingTask.promise
        if (cancelled) {
          await doc.cleanup()
          return
        }

        pdfDocRef.current = doc
        setNumPages(doc.numPages)
        setPageNum(1)
      } catch (err: unknown) {
        if (!cancelled) {
          setViewerError(
            err instanceof Error
              ? err.message
              : 'Could not load PDF file from /public/resume/Ankur_Singh_Resume.pdf'
          )
          setRendering(false)
        }
      }
    }

    loadPdf()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup().catch(() => {})
        pdfDocRef.current = null
      }
    }
  }, [isMounted, loadVersion])

  // Render active page onto canvas
  useEffect(() => {
    const doc = pdfDocRef.current
    const canvas = canvasRef.current
    if (!doc || !canvas || pageNum < 1 || pageNum > numPages) return

    let cancelled = false

    async function renderPage() {
      if (!doc || !canvas) return
      setRendering(true)

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }

      try {
        const page = await doc.getPage(pageNum)
        if (cancelled) return

        const baseViewport = page.getViewport({ scale: 1 })
        const fitScale = Math.min(containerWidth, 820) / baseViewport.width
        const finalScale = fitScale * (zoom / 100)
        const viewport = page.getViewport({ scale: finalScale })

        const dpr =
          typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        const task = page.render({
          canvas,
          canvasContext: ctx,
          viewport,
        })
        renderTaskRef.current = task
        await task.promise

        if (!cancelled) {
          setRendering(false)
        }
      } catch (err: unknown) {
        if (
          !cancelled &&
          !(err instanceof Error && err.name === 'RenderingCancelledException')
        ) {
          setViewerError('Failed to render PDF page.')
          setRendering(false)
        }
      }
    }

    renderPage()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }
    }
  }, [pageNum, numPages, zoom, containerWidth])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const handleDownload = useCallback(async (format: 'pdf' | 'docx') => {
    const url = format === 'pdf' ? RESUME_PDF_URL : RESUME_DOCX_URL
    const filename =
      format === 'pdf'
        ? 'Ankur_Singh_Resume.pdf'
        : 'Ankur_Singh_Resume.docx'

    setDownloadingFormat(format)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('File not found')
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
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloadingFormat(null)
    }
  }, [])

  const toolbarBtnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-300/80 text-slate-800'
    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-gray-200'

  return (
    <div
      className={`h-full w-full flex flex-col overflow-hidden select-none transition-colors duration-200 ${surface.appBg} ${surface.textPrimary}`}
    >
      {/* Top Toolbar */}
      <div
        className={`shrink-0 px-3 sm:px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
      >
        {/* File Title */}
        <div className="flex items-center gap-2 min-w-0">
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
            <p className={`text-[10px] sm:text-[11px] font-mono truncate ${surface.textMuted}`}>
              Canvas PDF Renderer · {numPages > 0 ? `${numPages} page${numPages > 1 ? 's' : ''}` : 'CV'}
            </p>
          </div>
        </div>

        {/* Page & Zoom Controls */}
        <div className="flex items-center gap-1">
          {numPages > 1 && (
            <>
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                disabled={pageNum <= 1}
                title="Previous Page"
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-40 ${toolbarBtnClass}`}
              >
                <FaChevronLeft className="w-3 h-3" />
              </button>
              <span
                className={`px-2 py-1 rounded-lg border text-[11px] font-mono ${surface.subtleBg} ${surface.borderSubtle}`}
              >
                {pageNum}/{numPages}
              </span>
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                disabled={pageNum >= numPages}
                title="Next Page"
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-40 ${toolbarBtnClass}`}
              >
                <FaChevronRight className="w-3 h-3" />
              </button>
              <span className="w-1.5" />
            </>
          )}

          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(60, z - 15))}
            title="Zoom Out"
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${toolbarBtnClass}`}
          >
            <FaSearchMinus className="w-3 h-3" />
          </button>

          <span
            className={`px-2 py-1 rounded-lg border text-[11px] font-mono min-w-[48px] text-center ${surface.subtleBg} ${surface.borderSubtle}`}
          >
            {zoom}%
          </span>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(180, z + 15))}
            title="Zoom In"
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${toolbarBtnClass}`}
          >
            <FaSearchPlus className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset Zoom"
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${toolbarBtnClass}`}
          >
            <FaUndo className="w-3 h-3" />
          </button>

          <a
            href={RESUME_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Raw PDF in New Tab"
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${toolbarBtnClass}`}
          >
            <FaExternalLinkAlt className="w-3 h-3" />
          </a>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleDownload('docx')}
            disabled={docxAvailable === false || downloadingFormat !== null}
            title={
              docxAvailable === false
                ? 'Add Ankur_Singh_Resume.docx to /public/resume/ to enable'
                : 'Download DOCX'
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${toolbarBtnClass}`}
          >
            <FaFileWord className="w-3.5 h-3.5 text-sky-400" />
            <span>{downloadingFormat === 'docx' ? '...' : 'DOCX'}</span>
            <FaDownload className="w-2.5 h-2.5 opacity-75" />
          </button>

          <button
            type="button"
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat !== null}
            title="Download PDF"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition hover:brightness-110 cursor-pointer disabled:opacity-45"
            style={{ backgroundColor: theme.rgb }}
          >
            <FaFilePdf className="w-3.5 h-3.5" />
            <span>{downloadingFormat === 'pdf' ? 'Saving...' : 'PDF'}</span>
            <FaDownload className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={stageRef}
        className={`flex-1 min-h-0 p-3 sm:p-5 overflow-auto flex items-start justify-center ${
          isLight ? 'bg-slate-200/75' : 'bg-[#090c10]'
        }`}
      >
        {viewerError ? (
          <div
            className={`max-w-md w-full my-auto rounded-2xl border p-6 text-center flex flex-col items-center gap-3 ${surface.subtleBg} ${surface.borderSubtle}`}
          >
            <FaFilePdf className="w-9 h-9 opacity-80" style={{ color: theme.rgb }} />
            <h3 className="text-sm font-semibold">Unable to Display PDF</h3>
            <p className={`text-xs leading-relaxed ${surface.textMuted}`}>
              {viewerError}
            </p>
            <a
              href={RESUME_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 px-4 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5"
              style={{ backgroundColor: theme.rgb }}
            >
              <span>Open PDF Directly</span>
              <FaExternalLinkAlt className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="relative flex items-center justify-center my-auto">
            {rendering && (
              <div
                className={`absolute inset-0 z-10 rounded-xl flex items-center justify-center backdrop-blur-[2px] ${
                  isLight ? 'bg-white/60' : 'bg-black/40'
                }`}
              >
                <div
                  className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                  style={{
                    borderColor: isLight
                      ? 'rgba(15,23,42,0.15)'
                      : 'rgba(255,255,255,0.15)',
                    borderTopColor: theme.rgb,
                  }}
                />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="rounded-xl shadow-2xl bg-white block max-w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}