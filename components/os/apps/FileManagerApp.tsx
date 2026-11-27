'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import {
  FaFolder,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaHdd,
  FaLock,
  FaFolderPlus,
  FaFileMedical,
  FaUpload,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaArrowUp,
  FaArrowLeft,
  FaSearch,
  FaDownload,
  FaExternalLinkAlt,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
  FaUndo,
  FaChevronLeft,
  FaExpand,
  FaCompress,
} from 'react-icons/fa'

// Easily extend this array in the future (e.g., 'md', 'json', 'png', 'mp3')
export const SUPPORTED_EXTENSIONS = ['txt', 'pdf', 'docx'] as const
export type SupportedExt = (typeof SUPPORTED_EXTENSIONS)[number]

type DriveId = 'admin' | 'user'

interface FSNode {
  id: string
  drive: DriveId
  parentId: string | null
  name: string
  type: 'folder' | 'file'
  ext?: SupportedExt
  content?: string // Used for .txt files
  url?: string // Used for static assets or uploaded data URLs (.pdf, .docx)
  size?: string
  updatedAt: string
}

// Structured DOCX AST nodes for clean rich-document rendering
interface DocxRun {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

type DocxBlock =
  | {
      kind: 'paragraph'
      style: 'title' | 'h1' | 'h2' | 'h3' | 'body'
      isList?: boolean
      runs: DocxRun[]
    }
  | {
      kind: 'table'
      rows: DocxRun[][][] // rows -> cells -> runs
    }

const USER_DRIVE_STORAGE_KEY = 'dossier_os_user_drive_v1'
const MAX_USER_DRIVE_BYTES = 3 * 1024 * 1024 // 3 MB cap to prevent lag & quota errors
const PDF_WORKER_SRC_URL = '/pdf.worker.min.mjs'

export const FILE_MANAGER_OPEN_EVENT = 'dossier:file-manager-open'
export const FILE_MANAGER_PENDING_KEY = 'dossier_os_fm_pending_node'

/**
 * Optional helper: call from Desktop/Profile shortcuts before opening File Manager
 * to jump straight to a specific file (e.g., 'admin-resume-pdf').
 */
export function openNodeInFileManager(nodeId: string) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(FILE_MANAGER_PENDING_KEY, nodeId)
  } catch {
    // Ignore storage errors
  }
  window.dispatchEvent(new CustomEvent(FILE_MANAGER_OPEN_EVENT, { detail: nodeId }))
}

// Read-only Admin Drive contents
const ADMIN_DRIVE_NODES: FSNode[] = [
  {
    id: 'admin-docs',
    drive: 'admin',
    parentId: null,
    name: 'Documents',
    type: 'folder',
    updatedAt: 'Nov 2026',
  },
  {
    id: 'admin-resume-pdf',
    drive: 'admin',
    parentId: 'admin-docs',
    name: 'Ankur_Singh_Resume.pdf',
    type: 'file',
    ext: 'pdf',
    url: '/resume/Ankur_Singh_Resume.pdf',
    size: 'PDF',
    updatedAt: 'Nov 2026',
  },
  {
    id: 'admin-resume-docx',
    drive: 'admin',
    parentId: 'admin-docs',
    name: 'Ankur_Singh_Resume.docx',
    type: 'file',
    ext: 'docx',
    url: '/resume/Ankur_Singh_Resume.docx',
    size: 'DOCX',
    updatedAt: 'Nov 2026',
  },
  {
    id: 'admin-readme',
    drive: 'admin',
    parentId: null,
    name: 'README.txt',
    type: 'file',
    ext: 'txt',
    content:
      'Welcome to DossierOS File Manager.\n\n- Admin Drive is read-only: browse, preview PDF/DOCX/TXT documents, and download files.\n- User Drive is your personal workspace: create folders, edit .txt files, upload .pdf/.docx/.txt files, rename, or delete items.\n\nAll User Drive changes are saved locally in your browser (3 MB limit).',
    size: '1 KB',
    updatedAt: 'Nov 2026',
  },
]

// Default starter files for User Drive
const DEFAULT_USER_NODES: FSNode[] = [
  {
    id: 'user-notes-folder',
    drive: 'user',
    parentId: null,
    name: 'Notes',
    type: 'folder',
    updatedAt: 'Today',
  },
  {
    id: 'user-welcome-txt',
    drive: 'user',
    parentId: 'user-notes-folder',
    name: 'scratchpad.txt',
    type: 'file',
    ext: 'txt',
    content: 'Write your notes here and click Save.\n',
    size: '1 KB',
    updatedAt: 'Today',
  },
]

function getExtension(filename: string): SupportedExt | null {
  const parts = filename.toLowerCase().split('.')
  if (parts.length < 2) return null
  const ext = parts[parts.length - 1]
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)
    ? (ext as SupportedExt)
    : null
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatNow(): string {
  return new Date().toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchFileBuffer(url: string, expectedLabel: string): Promise<ArrayBuffer> {
  if (url.startsWith('data:')) {
    const commaIdx = url.indexOf(',')
    if (commaIdx === -1) throw new Error('Invalid embedded file data.')
    const base64 = url.slice(commaIdx + 1)
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`${expectedLabel} file not found at ${url} (HTTP ${res.status})`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('text/html')) {
    throw new Error(`Expected a ${expectedLabel} file at ${url}, but received HTML.`)
  }
  const buffer = await res.arrayBuffer()
  if (buffer.byteLength === 0) {
    throw new Error(`${expectedLabel} file is empty (0 bytes).`)
  }
  return buffer
}

/**
 * Extracts word/document.xml from a .docx ZIP buffer using native browser APIs
 * (zero external dependencies).
 */
async function extractDocxXml(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  // Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1
  const minOffset = Math.max(0, bytes.length - 65557)
  for (let i = bytes.length - 22; i >= minOffset; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i
      break
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Invalid DOCX archive (missing directory header).')
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true)
  let ptr = view.getUint32(eocdOffset + 16, true)
  const decoder = new TextDecoder('utf-8')

  for (let entry = 0; entry < totalEntries; entry += 1) {
    if (ptr + 46 > bytes.length || view.getUint32(ptr, true) !== 0x02014b50) {
      break
    }

    const compressionMethod = view.getUint16(ptr + 10, true)
    const compressedSize = view.getUint32(ptr + 20, true)
    const fileNameLen = view.getUint16(ptr + 28, true)
    const extraLen = view.getUint16(ptr + 30, true)
    const commentLen = view.getUint16(ptr + 32, true)
    const localHeaderOffset = view.getUint32(ptr + 42, true)

    const fileName = decoder.decode(bytes.subarray(ptr + 46, ptr + 46 + fileNameLen))

    if (fileName === 'word/document.xml') {
      if (
        localHeaderOffset + 30 > bytes.length ||
        view.getUint32(localHeaderOffset, true) !== 0x04034b50
      ) {
        throw new Error('Corrupted DOCX entry header.')
      }

      const localNameLen = view.getUint16(localHeaderOffset + 26, true)
      const localExtraLen = view.getUint16(localHeaderOffset + 28, true)
      const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen
      const compressedSlice = bytes.slice(dataStart, dataStart + compressedSize)

      if (compressionMethod === 0) {
        return decoder.decode(compressedSlice)
      }

      if (compressionMethod === 8) {
        if (typeof DecompressionStream === 'undefined') {
          throw new Error('Browser does not support DecompressionStream for DOCX.')
        }
        const ds = new DecompressionStream('deflate-raw')
        const writer = ds.writable.getWriter()
        writer.write(compressedSlice)
        writer.close()
        return await new Response(ds.readable).text()
      }

      throw new Error(`Unsupported DOCX compression method (${compressionMethod}).`)
    }

    ptr += 46 + fileNameLen + extraLen + commentLen
  }

  throw new Error('Could not find document content inside DOCX file.')
}

function parseDocxRuns(container: Element): DocxRun[] {
  const runs: DocxRun[] = []
  const children = Array.from(container.children)

  for (const child of children) {
    if (child.localName === 'hyperlink') {
      runs.push(...parseDocxRuns(child))
      continue
    }
    if (child.localName !== 'r') continue

    let bold = false
    let italic = false
    let underline = false

    const rPr = Array.from(child.children).find((c) => c.localName === 'rPr')
    if (rPr) {
      for (const prop of Array.from(rPr.children)) {
        const val =
          prop.getAttribute('w:val') ?? prop.getAttribute('val') ?? ''
        const disabled = val === '0' || val === 'false' || val === 'none'
        if (prop.localName === 'b' && !disabled) bold = true
        if (prop.localName === 'i' && !disabled) italic = true
        if (prop.localName === 'u' && !disabled) underline = true
      }
    }

    let text = ''
    for (const part of Array.from(child.children)) {
      if (part.localName === 't') text += part.textContent ?? ''
      else if (part.localName === 'br') text += '\n'
      else if (part.localName === 'tab') text += '    '
    }

    if (text) {
      runs.push({ text, bold, italic, underline })
    }
  }

  return runs
}

function parseDocxParagraph(
  pEl: Element
): Extract<DocxBlock, { kind: 'paragraph' }> {
  let style: 'title' | 'h1' | 'h2' | 'h3' | 'body' = 'body'
  let isList = false

  const pPr = Array.from(pEl.children).find((c) => c.localName === 'pPr')
  if (pPr) {
    for (const prop of Array.from(pPr.children)) {
      if (prop.localName === 'pStyle') {
        const val = (
          prop.getAttribute('w:val') ??
          prop.getAttribute('val') ??
          ''
        ).toLowerCase()
        if (val.includes('title')) style = 'title'
        else if (val.includes('heading1') || val === '1') style = 'h1'
        else if (val.includes('heading2') || val === '2') style = 'h2'
        else if (val.includes('heading3') || val === '3') style = 'h3'
      } else if (prop.localName === 'numPr') {
        isList = true
      }
    }
  }

  return {
    kind: 'paragraph',
    style,
    isList,
    runs: parseDocxRuns(pEl),
  }
}

function parseDocxXml(xmlString: string): DocxBlock[] {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml')
  const parseError = xmlDoc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Failed to parse DOCX XML content.')
  }

  const body = Array.from(xmlDoc.documentElement.children).find(
    (c) => c.localName === 'body'
  )
  if (!body) return []

  const blocks: DocxBlock[] = []

  for (const child of Array.from(body.children)) {
    if (child.localName === 'p') {
      blocks.push(parseDocxParagraph(child))
    } else if (child.localName === 'tbl') {
      const rows: DocxRun[][][] = []
      for (const tr of Array.from(child.children)) {
        if (tr.localName !== 'tr') continue
        const rowCells: DocxRun[][] = []
        for (const tc of Array.from(tr.children)) {
          if (tc.localName !== 'tc') continue
          const cellRuns: DocxRun[] = []
          const paragraphs = Array.from(tc.children).filter(
            (c) => c.localName === 'p'
          )
          paragraphs.forEach((p, idx) => {
            if (idx > 0) cellRuns.push({ text: '\n' })
            cellRuns.push(...parseDocxRuns(p))
          })
          rowCells.push(cellRuns)
        }
        if (rowCells.length > 0) rows.push(rowCells)
      }
      if (rows.length > 0) {
        blocks.push({ kind: 'table', rows })
      }
    }
  }

  return blocks
}

/* -------------------------------------------------------------------------- */
/*                       Inline PDF Canvas Previewer                          */
/* -------------------------------------------------------------------------- */
interface InlinePdfPreviewProps {
  url: string
  themeRgb: string
  isLight: boolean
  toolbarBtnClass: string
  subtleBg: string
  borderSubtle: string
  textMuted: string
  onDownload: () => void
}

function InlinePdfPreview({
  url,
  themeRgb,
  isLight,
  toolbarBtnClass,
  subtleBg,
  borderSubtle,
  textMuted,
  onDownload,
}: InlinePdfPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [rendering, setRendering] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [stageWidth, setStageWidth] = useState(520)

  const pdfDocRef = useRef<PDFDocumentProxy | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    const updateWidth = () => {
      setStageWidth(Math.max(240, el.clientWidth - 24))
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Load PDF document
  useEffect(() => {
    let cancelled = false

    async function load() {
      setRendering(true)
      setError(null)
      setNumPages(0)
      setPageNum(1)

      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC_URL

        const buffer = await fetchFileBuffer(url, 'PDF')
        if (cancelled) return

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
          setError(err instanceof Error ? err.message : 'Unable to load PDF file.')
          setRendering(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup().catch(() => {})
        pdfDocRef.current = null
      }
    }
  }, [url, reloadKey])

  // Render active page
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
        const fitScale = Math.min(stageWidth, 820) / baseViewport.width
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

        if (!cancelled) setRendering(false)
      } catch (err: unknown) {
        if (
          !cancelled &&
          !(err instanceof Error && err.name === 'RenderingCancelledException')
        ) {
          setError('Failed to render PDF page.')
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
  }, [pageNum, numPages, zoom, stageWidth])

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* PDF Controls Bar */}
      <div
        className={`shrink-0 px-3 py-1.5 border-b flex flex-wrap items-center justify-between gap-1.5 ${subtleBg} ${borderSubtle}`}
      >
        <div className="flex items-center gap-1">
          {numPages > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                disabled={pageNum <= 1}
                title="Previous Page"
                className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer disabled:opacity-40 ${toolbarBtnClass}`}
              >
                <FaChevronLeft className="w-2.5 h-2.5" />
              </button>
              <span className="px-1.5 text-[10px] font-mono">
                {pageNum}/{numPages}
              </span>
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                disabled={pageNum >= numPages}
                title="Next Page"
                className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer disabled:opacity-40 ${toolbarBtnClass}`}
              >
                <FaChevronRight className="w-2.5 h-2.5" />
              </button>
            </>
          ) : (
            <span className={`text-[10px] font-mono ${textMuted}`}>
              {numPages === 1 ? '1 Page · PDF' : 'Loading PDF...'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(60, z - 15))}
            title="Zoom Out"
            className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${toolbarBtnClass}`}
          >
            <FaSearchMinus className="w-2.5 h-2.5" />
          </button>
          <span className="px-1.5 text-[10px] font-mono min-w-[40px] text-center">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(180, z + 15))}
            title="Zoom In"
            className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${toolbarBtnClass}`}
          >
            <FaSearchPlus className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset Zoom"
            className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${toolbarBtnClass}`}
          >
            <FaUndo className="w-2.5 h-2.5" />
          </button>
          {!url.startsWith('data:') && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in New Tab"
              className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${toolbarBtnClass}`}
            >
              <FaExternalLinkAlt className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Canvas Stage */}
      <div
        ref={stageRef}
        className={`flex-1 min-h-0 p-3 overflow-auto flex items-start justify-center ${
          isLight ? 'bg-slate-200/75' : 'bg-[#090c10]'
        }`}
      >
        {error ? (
          <div
            className={`max-w-sm w-full my-auto rounded-2xl border p-5 text-center flex flex-col items-center gap-2.5 ${subtleBg} ${borderSubtle}`}
          >
            <FaFilePdf className="w-8 h-8 text-rose-400" />
            <p className="text-xs font-semibold">Unable to Render PDF</p>
            <p className={`text-[11px] leading-relaxed ${textMuted}`}>{error}</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer ${toolbarBtnClass}`}
              >
                Retry
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
                style={{ backgroundColor: themeRgb }}
              >
                Download
              </button>
            </div>
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
                    borderTopColor: themeRgb,
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

/* -------------------------------------------------------------------------- */
/*                       Inline DOCX Document Previewer                       */
/* -------------------------------------------------------------------------- */
interface InlineDocxPreviewProps {
  url: string
  themeRgb: string
  isLight: boolean
  toolbarBtnClass: string
  subtleBg: string
  borderSubtle: string
  textMuted: string
  onDownload: () => void
}

function InlineDocxPreview({
  url,
  themeRgb,
  isLight,
  toolbarBtnClass,
  subtleBg,
  borderSubtle,
  textMuted,
  onDownload,
}: InlineDocxPreviewProps) {
  const [blocks, setBlocks] = useState<DocxBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    let cancelled = false

    async function loadDocx() {
      setLoading(true)
      setError(null)
      try {
        const buffer = await fetchFileBuffer(url, 'DOCX')
        const xml = await extractDocxXml(buffer)
        const parsed = parseDocxXml(xml)
        if (!cancelled) {
          setBlocks(parsed)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Unable to preview DOCX file.'
          )
          setLoading(false)
        }
      }
    }

    loadDocx()
    return () => {
      cancelled = true
    }
  }, [url])

  const renderRuns = (runs: DocxRun[]) => {
    if (runs.length === 0) return <br />
    return runs.map((run, i) => (
      <span
        key={i}
        className={[
          run.bold ? 'font-bold' : '',
          run.italic ? 'italic' : '',
          run.underline ? 'underline' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {run.text}
      </span>
    ))
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* DOCX Controls Bar */}
      <div
        className={`shrink-0 px-3 py-1.5 border-b flex items-center justify-between gap-2 ${subtleBg} ${borderSubtle}`}
      >
        <span className={`text-[10px] font-mono ${textMuted}`}>
          Word Document Preview
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(75, z - 10))}
            title="Decrease Text Scale"
            className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${toolbarBtnClass}`}
          >
            <FaSearchMinus className="w-2.5 h-2.5" />
          </button>
          <span className="px-1.5 text-[10px] font-mono min-w-[40px] text-center">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            title="Increase Text Scale"
            className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${toolbarBtnClass}`}
          >
            <FaSearchPlus className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset Scale"
            className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${toolbarBtnClass}`}
          >
            <FaUndo className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Document Sheet Stage */}
      <div
        className={`flex-1 min-h-0 p-3 sm:p-4 overflow-auto flex justify-center ${
          isLight ? 'bg-slate-200/75' : 'bg-[#090c10]'
        }`}
      >
        {loading ? (
          <div className="my-auto flex flex-col items-center gap-2">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: isLight
                  ? 'rgba(15,23,42,0.15)'
                  : 'rgba(255,255,255,0.15)',
                borderTopColor: themeRgb,
              }}
            />
            <span className={`text-xs font-mono ${textMuted}`}>
              Rendering DOCX...
            </span>
          </div>
        ) : error ? (
          <div
            className={`max-w-sm w-full my-auto rounded-2xl border p-5 text-center flex flex-col items-center gap-2.5 ${subtleBg} ${borderSubtle}`}
          >
            <FaFileWord className="w-8 h-8 text-sky-400" />
            <p className="text-xs font-semibold">Unable to Preview DOCX</p>
            <p className={`text-[11px] leading-relaxed ${textMuted}`}>{error}</p>
            <button
              type="button"
              onClick={onDownload}
              className="mt-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
              style={{ backgroundColor: themeRgb }}
            >
              Download DOCX
            </button>
          </div>
        ) : (
          <div
            className="w-full max-w-[740px] h-fit rounded-xl bg-white text-slate-900 shadow-2xl p-5 sm:p-8 space-y-2.5 select-text"
            style={{ fontSize: `${(13 * zoom) / 100}px` }}
          >
            {blocks.length === 0 ? (
              <p className="text-slate-400 italic text-xs">
                (Document has no readable text)
              </p>
            ) : (
              blocks.map((block, idx) => {
                if (block.kind === 'table') {
                  return (
                    <div key={idx} className="overflow-x-auto my-2">
                      <table className="w-full border-collapse border border-slate-200 text-left">
                        <tbody>
                          {block.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-slate-200">
                              {row.map((cellRuns, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="p-2 border-r border-slate-200 align-top whitespace-pre-wrap leading-snug"
                                >
                                  {renderRuns(cellRuns)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }

                const headingClass =
                  block.style === 'title'
                    ? 'text-[1.5em] font-bold tracking-tight text-slate-950 pb-1 border-b border-slate-200'
                    : block.style === 'h1'
                      ? 'text-[1.28em] font-bold text-slate-950 pt-2'
                      : block.style === 'h2'
                        ? 'text-[1.12em] font-bold text-slate-900 pt-1.5'
                        : block.style === 'h3'
                          ? 'text-[1.02em] font-semibold text-slate-800 pt-1'
                          : 'leading-relaxed text-slate-800'

                if (block.isList) {
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 pl-3 ${headingClass}`}
                    >
                      <span className="select-none text-slate-500">•</span>
                      <div className="flex-1 whitespace-pre-wrap">
                        {renderRuns(block.runs)}
                      </div>
                    </div>
                  )
                }

                return (
                  <p key={idx} className={`whitespace-pre-wrap ${headingClass}`}>
                    {renderRuns(block.runs)}
                  </p>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Main File Manager App                           */
/* -------------------------------------------------------------------------- */
export default function FileManagerApp() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)

  const [activeDrive, setActiveDrive] = useState<DriveId>('admin')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [userNodes, setUserNodes] = useState<FSNode[]>(DEFAULT_USER_NODES)
  const [searchQuery, setSearchQuery] = useState('')

  // Active file viewer / editor state
  const [selectedFile, setSelectedFile] = useState<FSNode | null>(null)
  const [editorText, setEditorText] = useState('')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  // Inline create / rename state
  const [creatingType, setCreatingType] = useState<'folder' | 'txt' | null>(null)
  const [newName, setNewName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const containerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Track container width so narrow desktop windows AND mobile screens switch to compact mode
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const checkSize = () => {
      setIsCompact(el.clientWidth < 720)
    }

    checkSize()
    const observer = new ResizeObserver(checkSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Jump directly to a specific file when requested externally (e.g., Resume shortcut)
  const navigateToNodeId = useCallback((nodeId: string, currentUserNodes: FSNode[]) => {
    const adminNode = ADMIN_DRIVE_NODES.find((n) => n.id === nodeId)
    if (adminNode) {
      setActiveDrive('admin')
      if (adminNode.type === 'folder') {
        setCurrentFolderId(adminNode.id)
        setSelectedFile(null)
      } else {
        setCurrentFolderId(adminNode.parentId)
        setSelectedFile(adminNode)
        setEditorText(adminNode.content ?? '')
      }
      return
    }

    const userNode = currentUserNodes.find((n) => n.id === nodeId)
    if (userNode) {
      setActiveDrive('user')
      if (userNode.type === 'folder') {
        setCurrentFolderId(userNode.id)
        setSelectedFile(null)
      } else {
        setCurrentFolderId(userNode.parentId)
        setSelectedFile(userNode)
        setEditorText(userNode.content ?? '')
      }
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    let loadedUserNodes = DEFAULT_USER_NODES
    try {
      const saved = localStorage.getItem(USER_DRIVE_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          loadedUserNodes = parsed
          setUserNodes(parsed)
        }
      }
    } catch {
      // Fallback to default user nodes
    }

    try {
      const pendingNodeId = sessionStorage.getItem(FILE_MANAGER_PENDING_KEY)
      if (pendingNodeId) {
        sessionStorage.removeItem(FILE_MANAGER_PENDING_KEY)
        navigateToNodeId(pendingNodeId, loadedUserNodes)
      }
    } catch {
      // Ignore
    }
  }, [navigateToNodeId])

  useEffect(() => {
    const handleExternalOpen = (e: Event) => {
      const nodeId = (e as CustomEvent<string>).detail
      if (!nodeId) return
      try {
        sessionStorage.removeItem(FILE_MANAGER_PENDING_KEY)
      } catch {
        // Ignore
      }
      navigateToNodeId(nodeId, userNodes)
    }

    window.addEventListener(FILE_MANAGER_OPEN_EVENT, handleExternalOpen)
    return () => window.removeEventListener(FILE_MANAGER_OPEN_EVENT, handleExternalOpen)
  }, [navigateToNodeId, userNodes])

  // Persist User Drive changes
  useEffect(() => {
    if (!isMounted) return
    try {
      localStorage.setItem(USER_DRIVE_STORAGE_KEY, JSON.stringify(userNodes))
    } catch {
      // Ignore quota errors
    }
  }, [userNodes, isMounted])

  const showToast = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), 2600)
  }

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const isReadOnly = activeDrive === 'admin'
  const driveNodes = activeDrive === 'admin' ? ADMIN_DRIVE_NODES : userNodes

  // Live User Drive storage calculation
  const userDriveUsedBytes = useMemo(() => {
    try {
      return new Blob([JSON.stringify(userNodes)]).size
    } catch {
      return 0
    }
  }, [userNodes])

  const usagePercent = Math.min(
    100,
    Math.round((userDriveUsedBytes / MAX_USER_DRIVE_BYTES) * 100)
  )

  // Build breadcrumb trail from root to currentFolderId
  const breadcrumbs = useMemo(() => {
    const trail: FSNode[] = []
    let cursor = currentFolderId
    while (cursor) {
      const found = driveNodes.find((n) => n.id === cursor)
      if (!found) break
      trail.unshift(found)
      cursor = found.parentId
    }
    return trail
  }, [currentFolderId, driveNodes])

  // Items visible in current folder (filtered by search)
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = driveNodes.filter((n) => {
      if (q) return n.name.toLowerCase().includes(q)
      return n.parentId === currentFolderId
    })

    return [...list].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [driveNodes, currentFolderId, searchQuery])

  const closePreview = () => {
    setSelectedFile(null)
    setIsPreviewExpanded(false)
  }

  const switchDrive = (drive: DriveId) => {
    setActiveDrive(drive)
    setCurrentFolderId(null)
    closePreview()
    setCreatingType(null)
    setRenamingId(null)
    setSearchQuery('')
  }

  const handleOpenNode = (node: FSNode) => {
    if (node.type === 'folder') {
      setCurrentFolderId(node.id)
      closePreview()
      setSearchQuery('')
      return
    }
    setSelectedFile(node)
    setEditorText(node.content ?? '')
  }

  const handleGoUp = () => {
    if (!currentFolderId) return
    const current = driveNodes.find((n) => n.id === currentFolderId)
    setCurrentFolderId(current?.parentId ?? null)
  }

  // Create Folder or .txt file in User Drive
  const handleConfirmCreate = () => {
    if (isReadOnly || !creatingType) return
    const trimmed = newName.trim()
    if (!trimmed) return

    const finalName =
      creatingType === 'txt' && !trimmed.toLowerCase().endsWith('.txt')
        ? `${trimmed}.txt`
        : trimmed

    const duplicate = userNodes.some(
      (n) =>
        n.parentId === currentFolderId &&
        n.name.toLowerCase() === finalName.toLowerCase()
    )
    if (duplicate) {
      showToast('An item with that name already exists.')
      return
    }

    const newNode: FSNode =
      creatingType === 'folder'
        ? {
            id: `user-${Date.now()}`,
            drive: 'user',
            parentId: currentFolderId,
            name: finalName,
            type: 'folder',
            updatedAt: formatNow(),
          }
        : {
            id: `user-${Date.now()}`,
            drive: 'user',
            parentId: currentFolderId,
            name: finalName,
            type: 'file',
            ext: 'txt',
            content: '',
            size: '0 B',
            updatedAt: formatNow(),
          }

    const nextNodes = [...userNodes, newNode]
    if (new Blob([JSON.stringify(nextNodes)]).size > MAX_USER_DRIVE_BYTES) {
      showToast('User Drive is full. Delete items to free space.')
      return
    }

    setUserNodes(nextNodes)
    setCreatingType(null)
    setNewName('')

    if (newNode.type === 'file') {
      setSelectedFile(newNode)
      setEditorText('')
    }
    showToast(`Created ${finalName}`)
  }

  // Upload .txt, .pdf, or .docx into User Drive (with strict quota check)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    files.forEach((file) => {
      const ext = getExtension(file.name)
      if (!ext) {
        showToast(`Unsupported file: ${file.name} (only .txt, .pdf, .docx)`)
        return
      }

      const estimatedBytes = ext === 'txt' ? file.size : Math.ceil(file.size * 1.37)
      if (estimatedBytes > MAX_USER_DRIVE_BYTES) {
        showToast(
          `${file.name} exceeds the ${formatBytes(MAX_USER_DRIVE_BYTES)} disk limit.`
        )
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : ''
        const uploadedNode: FSNode = {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          drive: 'user',
          parentId: currentFolderId,
          name: file.name,
          type: 'file',
          ext,
          content: ext === 'txt' ? result : undefined,
          url: ext !== 'txt' ? result : undefined,
          size: formatBytes(file.size),
          updatedAt: formatNow(),
        }

        let blocked = false
        setUserNodes((prev) => {
          const next = [...prev, uploadedNode]
          const nextSize = new Blob([JSON.stringify(next)]).size
          if (nextSize > MAX_USER_DRIVE_BYTES) {
            blocked = true
            return prev
          }
          return next
        })

        if (blocked) {
          showToast('Not enough space on User Drive. Delete files to free space.')
        } else {
          showToast(`Uploaded ${file.name}`)
        }
      }

      if (ext === 'txt') {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  // Save edited .txt file in User Drive (with quota check)
  const handleSaveTextFile = () => {
    if (isReadOnly || !selectedFile || selectedFile.ext !== 'txt') return
    const updated: FSNode = {
      ...selectedFile,
      content: editorText,
      size: formatBytes(new Blob([editorText]).size),
      updatedAt: formatNow(),
    }

    const nextNodes = userNodes.map((n) => (n.id === updated.id ? updated : n))
    if (new Blob([JSON.stringify(nextNodes)]).size > MAX_USER_DRIVE_BYTES) {
      showToast('Save failed: User Drive storage limit reached.')
      return
    }

    setUserNodes(nextNodes)
    setSelectedFile(updated)
    showToast('File saved')
  }

  // Rename item in User Drive
  const handleConfirmRename = (node: FSNode) => {
    if (isReadOnly) return
    const trimmed = renameValue.trim()
    if (!trimmed) {
      setRenamingId(null)
      return
    }

    let finalName = trimmed
    if (node.type === 'file' && node.ext) {
      const newExt = getExtension(trimmed)
      if (!newExt) {
        finalName = `${trimmed}.${node.ext}`
      } else if (newExt !== node.ext) {
        showToast(`Keep .${node.ext} extension`)
        return
      }
    }

    setUserNodes((prev) =>
      prev.map((n) =>
        n.id === node.id ? { ...n, name: finalName, updatedAt: formatNow() } : n
      )
    )
    if (selectedFile?.id === node.id) {
      setSelectedFile((prev) => (prev ? { ...prev, name: finalName } : null))
    }
    setRenamingId(null)
    showToast(`Renamed to ${finalName}`)
  }

  // Delete file or folder (recursively) in User Drive
  const handleDeleteNode = (node: FSNode) => {
    if (isReadOnly) return
    const idsToDelete = new Set<string>([node.id])

    if (node.type === 'folder') {
      let added = true
      while (added) {
        added = false
        for (const item of userNodes) {
          if (item.parentId && idsToDelete.has(item.parentId) && !idsToDelete.has(item.id)) {
            idsToDelete.add(item.id)
            added = true
          }
        }
      }
    }

    setUserNodes((prev) => prev.filter((n) => !idsToDelete.has(n.id)))
    if (selectedFile && idsToDelete.has(selectedFile.id)) {
      closePreview()
    }
    showToast(`Deleted ${node.name}`)
  }

  const handleDownloadFile = (file: FSNode) => {
    if (file.ext === 'txt') {
      const blob = new Blob([file.content ?? ''], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return
    }
    if (file.url) {
      const a = document.createElement('a')
      a.href = file.url
      a.download = file.name
      a.click()
    }
  }

  const renderIcon = (node: FSNode) => {
    if (node.type === 'folder') {
      return <FaFolder className="w-4 h-4 shrink-0" style={{ color: theme.rgb }} />
    }
    if (node.ext === 'pdf') return <FaFilePdf className="w-4 h-4 shrink-0 text-rose-400" />
    if (node.ext === 'docx') return <FaFileWord className="w-4 h-4 shrink-0 text-sky-400" />
    return <FaFileAlt className={`w-4 h-4 shrink-0 ${surface.textMuted}`} />
  }

  const btnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-300/80 text-slate-800'
    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-gray-200'

  const useFullOverlay = isCompact || isPreviewExpanded

  const renderPreviewPanel = () => {
    if (!selectedFile) return null

    const isRichDoc = selectedFile.ext === 'pdf' || selectedFile.ext === 'docx'

    return (
      <div
        className={
          useFullOverlay
            ? `absolute inset-0 z-20 flex flex-col overflow-hidden ${surface.appBg}`
            : `${
                isRichDoc ? 'w-[54%] min-w-[340px] max-w-[660px]' : 'w-80 md:w-96'
              } shrink-0 border-l flex flex-col overflow-hidden ${surface.subtleBg} ${surface.borderSubtle}`
        }
      >
        {/* Preview Header */}
        <div
          className={`shrink-0 px-3.5 py-2.5 border-b flex items-center justify-between gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {useFullOverlay && (
              <button
                type="button"
                onClick={closePreview}
                title="Back to Files"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 cursor-pointer ${btnClass}`}
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}
            {renderIcon(selectedFile)}
            <span className="text-xs font-semibold truncate">
              {selectedFile.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsPreviewExpanded((v) => !v)}
                title={isPreviewExpanded ? 'Exit Full View' : 'Expand Document'}
                className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
              >
                {isPreviewExpanded ? (
                  <FaCompress className="w-3 h-3" />
                ) : (
                  <FaExpand className="w-3 h-3" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDownloadFile(selectedFile)}
              title="Download"
              className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
            >
              <FaDownload className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={closePreview}
              title="Close Document"
              className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Preview Body */}
        {selectedFile.ext === 'pdf' && selectedFile.url ? (
          <InlinePdfPreview
            url={selectedFile.url}
            themeRgb={theme.rgb}
            isLight={isLight}
            toolbarBtnClass={btnClass}
            subtleBg={surface.subtleBg}
            borderSubtle={surface.borderSubtle}
            textMuted={surface.textMuted}
            onDownload={() => handleDownloadFile(selectedFile)}
          />
        ) : selectedFile.ext === 'docx' && selectedFile.url ? (
          <InlineDocxPreview
            url={selectedFile.url}
            themeRgb={theme.rgb}
            isLight={isLight}
            toolbarBtnClass={btnClass}
            subtleBg={surface.subtleBg}
            borderSubtle={surface.borderSubtle}
            textMuted={surface.textMuted}
            onDownload={() => handleDownloadFile(selectedFile)}
          />
        ) : (
          <div className="flex-1 min-h-0 p-3.5 flex flex-col overflow-auto">
            {isReadOnly ? (
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed select-text">
                {selectedFile.content || '(Empty file)'}
              </pre>
            ) : (
              <>
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  className={`flex-1 w-full resize-none rounded-xl border p-3 text-xs font-mono leading-relaxed focus:outline-none select-text ${surface.appBg} ${surface.borderSubtle}`}
                />
                <button
                  type="button"
                  onClick={handleSaveTextFile}
                  className="mt-2.5 w-full py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110"
                  style={{ backgroundColor: theme.rgb }}
                >
                  <FaSave className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full flex overflow-hidden select-none transition-colors duration-200 ${
        isCompact ? 'flex-col' : 'flex-row'
      } ${surface.appBg} ${surface.textPrimary}`}
    >
      {/* Hidden File Input for Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.pdf,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Compact Top Drive Switcher (Mobile / Small Window) */}
      {isCompact ? (
        <div
          className={`shrink-0 px-3 py-2 border-b flex items-center justify-between gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
        >
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => switchDrive('admin')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer ${
                activeDrive === 'admin'
                  ? 'text-white shadow-sm'
                  : `${surface.textPrimary} hover:bg-white/[0.06]`
              }`}
              style={
                activeDrive === 'admin'
                  ? { backgroundColor: theme.rgb }
                  : undefined
              }
            >
              <FaHdd className="w-3 h-3" />
              <span>Admin</span>
              <FaLock className="w-2.5 h-2.5 opacity-80" />
            </button>

            <button
              type="button"
              onClick={() => switchDrive('user')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer ${
                activeDrive === 'user'
                  ? 'text-white shadow-sm'
                  : `${surface.textPrimary} hover:bg-white/[0.06]`
              }`}
              style={
                activeDrive === 'user'
                  ? { backgroundColor: theme.rgb }
                  : undefined
              }
            >
              <FaHdd className="w-3 h-3" />
              <span>User</span>
            </button>
          </div>

          <span className={`text-[10px] font-mono ${surface.textMuted}`}>
            Disk: {usagePercent}% ({formatBytes(userDriveUsedBytes)})
          </span>
        </div>
      ) : (
        /* Desktop Left Sidebar: Drives */
        <aside
          className={`w-48 sm:w-52 shrink-0 border-r p-3 flex flex-col gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
        >
          <span
            className={`px-2 text-[10px] font-mono font-semibold uppercase tracking-widest ${surface.textMuted}`}
          >
            Drives
          </span>

          <button
            type="button"
            onClick={() => switchDrive('admin')}
            className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 text-xs font-medium transition cursor-pointer ${
              activeDrive === 'admin'
                ? 'text-white shadow-sm'
                : `${surface.textPrimary} hover:bg-white/[0.06]`
            }`}
            style={
              activeDrive === 'admin'
                ? { backgroundColor: theme.rgb }
                : undefined
            }
          >
            <span className="flex items-center gap-2 truncate">
              <FaHdd className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Admin Drive</span>
            </span>
            <FaLock className="w-3 h-3 opacity-80 shrink-0" title="Read-Only" />
          </button>

          <button
            type="button"
            onClick={() => switchDrive('user')}
            className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 text-xs font-medium transition cursor-pointer ${
              activeDrive === 'user'
                ? 'text-white shadow-sm'
                : `${surface.textPrimary} hover:bg-white/[0.06]`
            }`}
            style={
              activeDrive === 'user'
                ? { backgroundColor: theme.rgb }
                : undefined
            }
          >
            <span className="flex items-center gap-2 truncate">
              <FaHdd className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">User Drive</span>
            </span>
            <span className="text-[9px] font-mono uppercase opacity-80">R/W</span>
          </button>

          {/* User Drive Storage Meter + Supported Types */}
          <div className="mt-auto pt-3 border-t border-current/10 px-2 space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={surface.textMuted}>User Disk</span>
                <span className="font-semibold">{usagePercent}%</span>
              </div>

              <div
                className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isLight ? 'bg-slate-200' : 'bg-white/10'
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${usagePercent}%`,
                    backgroundColor:
                      usagePercent >= 90
                        ? '#f43f5e'
                        : usagePercent >= 75
                          ? '#f59e0b'
                          : theme.rgb,
                  }}
                />
              </div>

              <div className={`text-[10px] font-mono ${surface.textMuted}`}>
                {formatBytes(userDriveUsedBytes)} / {formatBytes(MAX_USER_DRIVE_BYTES)}
              </div>
            </div>

            <div className="pt-2 border-t border-current/10 space-y-1">
              <div className={`text-[10px] font-mono ${surface.textMuted}`}>
                Supported Types
              </div>
              <div className="flex flex-wrap gap-1">
                {SUPPORTED_EXTENSIONS.map((ext) => (
                  <span
                    key={ext}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border ${surface.borderSubtle}`}
                  >
                    .{ext}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div
          className={`shrink-0 px-3 sm:px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
        >
          {/* Navigation & Breadcrumbs */}
          <div className="flex items-center gap-1.5 min-w-0 text-xs font-mono">
            <button
              type="button"
              onClick={handleGoUp}
              disabled={!currentFolderId}
              title="Up One Level"
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-35 ${btnClass}`}
            >
              <FaArrowUp className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentFolderId(null)
                closePreview()
              }}
              className="px-1.5 py-1 rounded hover:underline font-semibold cursor-pointer"
            >
              {activeDrive === 'admin' ? 'Admin Drive' : 'User Drive'}
            </button>

            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.id}>
                <FaChevronRight className={`w-2.5 h-2.5 ${surface.textMuted}`} />
                <button
                  type="button"
                  onClick={() => {
                    setCurrentFolderId(crumb.id)
                    closePreview()
                  }}
                  className="px-1 py-0.5 rounded hover:underline truncate max-w-[110px] cursor-pointer"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Right Controls: Search + Actions */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch
                className={`w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 ${surface.textMuted}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={`pl-7 pr-2.5 py-1 rounded-lg border text-xs w-28 sm:w-36 focus:outline-none ${surface.appBg} ${surface.borderSubtle}`}
              />
            </div>

            {isReadOnly ? (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap"
                style={{
                  backgroundColor: `rgba(${accentRgbClean}, 0.14)`,
                  color: theme.rgb,
                }}
              >
                <FaLock className="w-2.5 h-2.5" />
                Read-Only
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingType('folder')
                    setNewName('')
                  }}
                  title="New Folder"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${btnClass}`}
                >
                  <FaFolderPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreatingType('txt')
                    setNewName('')
                  }}
                  title="New .txt File"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${btnClass}`}
                >
                  <FaFileMedical className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">.txt</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload .txt, .pdf, or .docx"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer hover:brightness-110"
                  style={{ backgroundColor: theme.rgb }}
                >
                  <FaUpload className="w-3 h-3" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inline Creation Bar (User Drive Only) */}
        {creatingType && !isReadOnly && (
          <div
            className={`shrink-0 px-4 py-2 border-b flex items-center gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
          >
            <span className="text-xs font-mono">
              New {creatingType === 'folder' ? 'Folder' : '.txt File'}:
            </span>
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate()
                if (e.key === 'Escape') setCreatingType(null)
              }}
              placeholder={creatingType === 'folder' ? 'Folder name' : 'notes.txt'}
              className={`flex-1 max-w-xs px-2.5 py-1 rounded-lg border text-xs focus:outline-none ${surface.appBg} ${surface.borderSubtle}`}
            />
            <button
              type="button"
              onClick={handleConfirmCreate}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white cursor-pointer"
              style={{ backgroundColor: theme.rgb }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setCreatingType(null)}
              className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Split Body: File List + Desktop Side Preview Drawer */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* File List */}
          <div className="flex-1 min-w-0 overflow-y-auto p-3 space-y-1">
            {visibleItems.length === 0 ? (
              <div
                className={`h-full flex flex-col items-center justify-center text-center gap-2 py-12 ${surface.textMuted}`}
              >
                <FaFolder className="w-8 h-8 opacity-30" />
                <p className="text-xs font-mono">
                  {searchQuery ? 'No matching files' : 'This folder is empty'}
                </p>
              </div>
            ) : (
              visibleItems.map((node) => {
                const isSelected = selectedFile?.id === node.id
                const isRenaming = renamingId === node.id

                return (
                  <div
                    key={node.id}
                    onClick={() => !isRenaming && handleOpenNode(node)}
                    className={`group px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition cursor-pointer border ${
                      isSelected
                        ? 'border-current/20 bg-white/[0.08]'
                        : 'border-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {renderIcon(node)}
                      {isRenaming ? (
                        <input
                          type="text"
                          autoFocus
                          value={renameValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRename(node)
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onBlur={() => handleConfirmRename(node)}
                          className={`px-2 py-0.5 rounded border text-xs w-44 focus:outline-none ${surface.appBg} ${surface.borderSubtle}`}
                        />
                      ) : (
                        <span className="truncate font-medium">{node.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`hidden md:inline text-[10px] font-mono ${surface.textMuted}`}
                      >
                        {node.type === 'folder' ? 'Folder' : node.size || node.ext?.toUpperCase()}
                      </span>
                      <span
                        className={`hidden lg:inline text-[10px] font-mono ${surface.textMuted}`}
                      >
                        {node.updatedAt}
                      </span>

                      {/* User Drive Row Actions */}
                      {!isReadOnly && !isRenaming && (
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Rename"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRenamingId(node.id)
                              setRenameValue(node.name)
                            }}
                            className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNode(node)
                            }}
                            className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Desktop Side Preview Drawer */}
          {!useFullOverlay && renderPreviewPanel()}
        </div>

        {/* Bottom Status Bar */}
        <div
          className={`shrink-0 px-3.5 py-1.5 border-t flex items-center justify-between text-[10px] font-mono ${surface.subtleBg} ${surface.borderSubtle} ${surface.textMuted}`}
        >
          <span>
            {visibleItems.length} item{visibleItems.length === 1 ? '' : 's'} ·{' '}
            {isReadOnly
              ? 'Admin Drive (View Only)'
              : `User Drive (${formatBytes(userDriveUsedBytes)} / ${formatBytes(MAX_USER_DRIVE_BYTES)})`}
          </span>
          {statusMsg && (
            <span style={{ color: theme.rgb }} className="font-semibold">
              {statusMsg}
            </span>
          )}
        </div>
      </div>

      {/* Full-App Takeover Preview Overlay (Compact Mode or Expanded Desktop View) */}
      {useFullOverlay && renderPreviewPanel()}
    </div>
  )
}