'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import {
  FaImage,
  FaUpload,
  FaDownload,
  FaCrop,
  FaExpandArrowsAlt,
  FaCompressArrowsAlt,
  FaLock,
  FaUnlock,
  FaUndo,
  FaRedo,
  FaArrowsAltH,
  FaEye,
  FaTrash,
} from 'react-icons/fa'

type OutputFormat = 'image/webp' | 'image/jpeg' | 'image/png'
type DragHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se'

interface CropRect {
  x: number // normalized 0..1
  y: number // normalized 0..1
  w: number // normalized 0..1
  h: number // normalized 0..1
}

interface AspectPreset {
  label: string
  ratio: number | null // width / height in pixels, null = freeform
}

const ASPECT_PRESETS: AspectPreset[] = [
  { label: 'Free', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '3:2', ratio: 3 / 2 },
  { label: '9:16', ratio: 9 / 16 },
]

const FORMAT_OPTIONS: { label: string; value: OutputFormat; ext: string }[] = [
  { label: 'WEBP', value: 'image/webp', ext: 'webp' },
  { label: 'JPEG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', value: 'image/png', ext: 'png' },
]

const SCALE_PRESETS = [25, 50, 75, 100] as const
const MIN_CROP_NORM = 0.06

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

function computeCenteredAspectCrop(
  natW: number,
  natH: number,
  targetPixelRatio: number | null
): CropRect {
  if (!targetPixelRatio || natW <= 0 || natH <= 0) {
    return { x: 0, y: 0, w: 1, h: 1 }
  }

  const imageRatio = natW / natH
  if (targetPixelRatio > imageRatio) {
    const h = imageRatio / targetPixelRatio
    return { x: 0, y: (1 - h) / 2, w: 1, h }
  } else {
    const w = targetPixelRatio / imageRatio
    return { x: (1 - w) / 2, y: 0, w, h: 1 }
  }
}

export default function ImageToolsApp() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

  // Source image state
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('image')
  const [originalBytes, setOriginalBytes] = useState<number>(0)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  // View mode: 'crop' (interactive crop overlay) vs 'preview' (final processed output)
  const [viewMode, setViewMode] = useState<'crop' | 'preview'>('crop')

  // Crop state
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 1, h: 1 })
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  // Resize state
  const [targetWidth, setTargetWidth] = useState<number>(0)
  const [targetHeight, setTargetHeight] = useState<number>(0)
  const [lockAspect, setLockAspect] = useState<boolean>(true)

  // Compression & format state
  const [format, setFormat] = useState<OutputFormat>('image/webp')
  const [quality, setQuality] = useState<number>(82)

  // Processed output state
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [outputBytes, setOutputBytes] = useState<number>(0)
  const [processing, setProcessing] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imgElementRef = useRef<HTMLImageElement | null>(null)
  const stageBoxRef = useRef<HTMLDivElement | null>(null)

  const dragStateRef = useRef<{
    handle: DragHandle
    startX: number
    startY: number
    startCrop: CropRect
    boxW: number
    boxH: number
  } | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Responsive layout switch for narrow windows & mobile
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const check = () => setIsCompact(el.clientWidth < 700)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    }
  }, [sourceUrl])

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl)
    }
  }, [outputUrl])

  // Cropped pixel dimensions
  const croppedDims = useMemo(() => {
    const w = Math.max(1, Math.round(crop.w * naturalSize.width))
    const h = Math.max(1, Math.round(crop.h * naturalSize.height))
    return { width: w, height: h }
  }, [crop.w, crop.h, naturalSize.width, naturalSize.height])

  // Keep resize dimensions synced to cropped size whenever crop changes
  useEffect(() => {
    if (croppedDims.width > 0 && croppedDims.height > 0) {
      setTargetWidth(croppedDims.width)
      setTargetHeight(croppedDims.height)
    }
  }, [croppedDims.width, croppedDims.height])

  const loadImageFromUrl = useCallback(
    (nextUrl: string, name: string, byteSize: number) => {
      const probe = new Image()
      probe.onload = () => {
        imgElementRef.current = probe
        setSourceUrl(nextUrl)
        setFileName(name)
        setOriginalBytes(byteSize)
        setNaturalSize({ width: probe.naturalWidth, height: probe.naturalHeight })
        setCrop({ x: 0, y: 0, w: 1, h: 1 })
        setAspectRatio(null)
        setViewMode('crop')
      }
      probe.src = nextUrl
    },
    []
  )

  const handleFileSelect = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'image'
    const url = URL.createObjectURL(file)
    loadImageFromUrl(url, baseName, file.size)
  }

  // Rotate 90° clockwise or Flip horizontally by baking into a fresh canvas source
  const transformSource = (action: 'rotate' | 'flipH') => {
    const img = imgElementRef.current
    if (!img || naturalSize.width === 0) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (action === 'rotate') {
      canvas.width = naturalSize.height
      canvas.height = naturalSize.width
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(Math.PI / 2)
      ctx.drawImage(img, -naturalSize.width / 2, -naturalSize.height / 2)
    } else {
      canvas.width = naturalSize.width
      canvas.height = naturalSize.height
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(img, 0, 0)
    }

    canvas.toBlob((blob) => {
      if (!blob) return
      const nextUrl = URL.createObjectURL(blob)
      loadImageFromUrl(nextUrl, fileName, originalBytes || blob.size)
    }, 'image/png')
  }

  // Generate compressed, cropped, and resized output blob
  useEffect(() => {
    const img = imgElementRef.current
    if (!img || !sourceUrl || targetWidth < 1 || targetHeight < 1) return

    let cancelled = false
    setProcessing(true)

    const timer = setTimeout(() => {
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        if (!cancelled) setProcessing(false)
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Fill white background for JPEG so transparent PNGs don't turn black
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, targetWidth, targetHeight)
      }

      const sx = Math.round(crop.x * naturalSize.width)
      const sy = Math.round(crop.y * naturalSize.height)
      const sw = Math.max(1, Math.round(crop.w * naturalSize.width))
      const sh = Math.max(1, Math.round(crop.h * naturalSize.height))

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight)

      const q = format === 'image/png' ? undefined : quality / 100
      canvas.toBlob(
        (blob) => {
          if (cancelled) return
          setProcessing(false)
          if (!blob) return
          const nextOutUrl = URL.createObjectURL(blob)
          setOutputBytes(blob.size)
          setOutputUrl(nextOutUrl)
        },
        format,
        q
      )
    }, 120)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [
    sourceUrl,
    crop.x,
    crop.y,
    crop.w,
    crop.h,
    naturalSize.width,
    naturalSize.height,
    targetWidth,
    targetHeight,
    format,
    quality,
  ])

  // Interactive crop pointer handlers
  const handleCropPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    handle: DragHandle
  ) => {
    e.stopPropagation()
    const box = stageBoxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    e.currentTarget.setPointerCapture(e.pointerId)
    dragStateRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
      boxW: rect.width,
      boxH: rect.height,
    }
  }

  const handleCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag) return

    const dx = (e.clientX - drag.startX) / drag.boxW
    const dy = (e.clientY - drag.startY) / drag.boxH
    const s = drag.startCrop

    if (drag.handle === 'move') {
      setCrop({
        ...s,
        x: clamp(s.x + dx, 0, 1 - s.w),
        y: clamp(s.y + dy, 0, 1 - s.h),
      })
      return
    }

    // Normalized aspect ratio: (w * natW) / (h * natH) = aspectRatio
    const normRatio =
      aspectRatio && naturalSize.width > 0 && naturalSize.height > 0
        ? aspectRatio * (naturalSize.height / naturalSize.width)
        : null

    let nextX = s.x
    let nextY = s.y
    let nextW = s.w
    let nextH = s.h

    if (drag.handle === 'se') {
      nextW = clamp(s.w + dx, MIN_CROP_NORM, 1 - s.x)
      nextH = normRatio
        ? nextW / normRatio
        : clamp(s.h + dy, MIN_CROP_NORM, 1 - s.y)
      if (normRatio && s.y + nextH > 1) {
        nextH = 1 - s.y
        nextW = nextH * normRatio
      }
    } else if (drag.handle === 'sw') {
      const right = s.x + s.w
      nextW = clamp(s.w - dx, MIN_CROP_NORM, right)
      nextH = normRatio
        ? nextW / normRatio
        : clamp(s.h + dy, MIN_CROP_NORM, 1 - s.y)
      if (normRatio && s.y + nextH > 1) {
        nextH = 1 - s.y
        nextW = nextH * normRatio
      }
      nextX = right - nextW
    } else if (drag.handle === 'ne') {
      const bottom = s.y + s.h
      nextW = clamp(s.w + dx, MIN_CROP_NORM, 1 - s.x)
      nextH = normRatio
        ? nextW / normRatio
        : clamp(s.h - dy, MIN_CROP_NORM, bottom)
      if (normRatio && bottom - nextH < 0) {
        nextH = bottom
        nextW = nextH * normRatio
      }
      nextY = bottom - nextH
    } else if (drag.handle === 'nw') {
      const right = s.x + s.w
      const bottom = s.y + s.h
      nextW = clamp(s.w - dx, MIN_CROP_NORM, right)
      nextH = normRatio
        ? nextW / normRatio
        : clamp(s.h - dy, MIN_CROP_NORM, bottom)
      if (normRatio && bottom - nextH < 0) {
        nextH = bottom
        nextW = nextH * normRatio
      }
      nextX = right - nextW
      nextY = bottom - nextH
    }

    setCrop({
      x: clamp(nextX, 0, 1 - MIN_CROP_NORM),
      y: clamp(nextY, 0, 1 - MIN_CROP_NORM),
      w: clamp(nextW, MIN_CROP_NORM, 1),
      h: clamp(nextH, MIN_CROP_NORM, 1),
    })
  }

  const handleCropPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current) {
      dragStateRef.current = null
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Ignore
      }
    }
  }

  const handleSelectAspectPreset = (ratio: number | null) => {
    setAspectRatio(ratio)
    setViewMode('crop')
    setCrop(computeCenteredAspectCrop(naturalSize.width, naturalSize.height, ratio))
  }

  const handleWidthChange = (rawVal: string) => {
    const val = Math.max(1, Math.min(8000, Number(rawVal) || 1))
    setTargetWidth(val)
    if (lockAspect && croppedDims.width > 0) {
      setTargetHeight(
        Math.max(1, Math.round(val * (croppedDims.height / croppedDims.width)))
      )
    }
  }

  const handleHeightChange = (rawVal: string) => {
    const val = Math.max(1, Math.min(8000, Number(rawVal) || 1))
    setTargetHeight(val)
    if (lockAspect && croppedDims.height > 0) {
      setTargetWidth(
        Math.max(1, Math.round(val * (croppedDims.width / croppedDims.height)))
      )
    }
  }

  const applyScalePreset = (pct: number) => {
    setTargetWidth(Math.max(1, Math.round((croppedDims.width * pct) / 100)))
    setTargetHeight(Math.max(1, Math.round((croppedDims.height * pct) / 100)))
  }

  const handleResetAll = () => {
    setAspectRatio(null)
    setCrop({ x: 0, y: 0, w: 1, h: 1 })
    setTargetWidth(naturalSize.width)
    setTargetHeight(naturalSize.height)
    setFormat('image/webp')
    setQuality(82)
    setViewMode('crop')
  }

  const handleDownload = () => {
    if (!outputUrl) return
    const ext = FORMAT_OPTIONS.find((f) => f.value === format)?.ext || 'webp'
    const a = document.createElement('a')
    a.href = outputUrl
    a.download = `${fileName}_${targetWidth}x${targetHeight}.${ext}`
    a.click()
  }

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const btnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-300/80 text-slate-800'
    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-gray-200'

  const sizeDeltaPct =
    originalBytes > 0 && outputBytes > 0
      ? Math.round(((outputBytes - originalBytes) / originalBytes) * 100)
      : 0

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDraggingFile(true)
      }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDraggingFile(false)
        handleFileSelect(e.dataTransfer.files?.[0])
      }}
      className={`h-full w-full flex flex-col overflow-hidden select-none transition-colors duration-200 ${surface.appBg} ${surface.textPrimary}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          handleFileSelect(e.target.files?.[0])
          e.target.value = ''
        }}
        className="hidden"
      />

      {/* Top Toolbar */}
      <div
        className={`shrink-0 px-3 sm:px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `rgba(${accentRgbClean}, 0.16)`,
              color: theme.rgb,
            }}
          >
            <FaImage className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold truncate">
              {sourceUrl ? fileName : 'Image Studio'}
            </h2>
            <p className={`text-[10px] font-mono truncate ${surface.textMuted}`}>
              {sourceUrl
                ? `${naturalSize.width}×${naturalSize.height}px · ${formatBytes(originalBytes)}`
                : 'Crop · Resize · Compress'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {sourceUrl && (
            <>
              <button
                type="button"
                onClick={() => transformSource('rotate')}
                title="Rotate 90° Clockwise"
                className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
              >
                <FaRedo className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => transformSource('flipH')}
                title="Flip Horizontal"
                className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
              >
                <FaArrowsAltH className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                title="Reset All"
                className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
              >
                <FaUndo className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceUrl(null)
                  setOutputUrl(null)
                }}
                title="Clear Image"
                className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer ${btnClass}`}
          >
            <FaUpload className="w-3 h-3" />
            <span>{sourceUrl ? 'Replace' : 'Open Image'}</span>
          </button>

          {sourceUrl && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={!outputUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white cursor-pointer hover:brightness-110 disabled:opacity-45"
              style={{ backgroundColor: theme.rgb }}
            >
              <FaDownload className="w-3 h-3" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty Dropzone State */}
      {!sourceUrl ? (
        <div className="flex-1 p-5 flex items-center justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-md rounded-2xl border-2 border-dashed p-8 text-center flex flex-col items-center gap-3 transition cursor-pointer ${
              isDraggingFile
                ? 'scale-[1.01]'
                : `${surface.subtleBg} ${surface.borderSubtle}`
            }`}
            style={
              isDraggingFile
                ? {
                    borderColor: theme.rgb,
                    backgroundColor: `rgba(${accentRgbClean}, 0.1)`,
                  }
                : undefined
            }
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: `rgba(${accentRgbClean}, 0.16)`,
                color: theme.rgb,
              }}
            >
              <FaImage className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Drop an image here or click to browse
              </p>
              <p className={`text-xs font-mono mt-1 ${surface.textMuted}`}>
                Supports PNG, JPEG, WEBP, SVG · 100% Client-Side
              </p>
            </div>
          </button>
        </div>
      ) : (
        /* Active Workspace */
        <div
          className={`flex-1 min-h-0 flex overflow-hidden ${
            isCompact ? 'flex-col' : 'flex-row'
          }`}
        >
          {/* Left / Top Stage */}
          <div
            className={`relative flex-1 min-h-[220px] p-4 flex flex-col items-center justify-center overflow-hidden ${
              isLight ? 'bg-slate-200/75' : 'bg-[#090c10]'
            }`}
          >
            {/* Stage Mode Switcher */}
            <div
              className={`absolute top-3 left-3 z-20 inline-flex rounded-xl border p-0.5 backdrop-blur-md ${surface.subtleBg} ${surface.borderSubtle}`}
            >
              <button
                type="button"
                onClick={() => setViewMode('crop')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium inline-flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'crop' ? 'text-white' : surface.textMuted
                }`}
                style={
                  viewMode === 'crop' ? { backgroundColor: theme.rgb } : undefined
                }
              >
                <FaCrop className="w-2.5 h-2.5" />
                <span>Crop Box</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium inline-flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'preview' ? 'text-white' : surface.textMuted
                }`}
                style={
                  viewMode === 'preview'
                    ? { backgroundColor: theme.rgb }
                    : undefined
                }
              >
                <FaEye className="w-2.5 h-2.5" />
                <span>Output Preview</span>
              </button>
            </div>

            {/* Interactive Crop Canvas OR Final Output Preview */}
            {viewMode === 'crop' ? (
              <div
                ref={stageBoxRef}
                className="relative inline-block max-w-full max-h-full overflow-hidden rounded-lg shadow-2xl"
                style={{
                  aspectRatio: `${naturalSize.width} / ${naturalSize.height}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourceUrl}
                  alt="Crop source"
                  draggable={false}
                  className="block max-w-full max-h-[62vh] w-auto h-auto object-contain pointer-events-none"
                />

                {/* Crop Selection Overlay */}
                <div
                  onPointerDown={(e) => handleCropPointerDown(e, 'move')}
                  onPointerMove={handleCropPointerMove}
                  onPointerUp={handleCropPointerUp}
                  style={{
                    left: `${crop.x * 100}%`,
                    top: `${crop.y * 100}%`,
                    width: `${crop.w * 100}%`,
                    height: `${crop.h * 100}%`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.58)',
                    borderColor: theme.rgb,
                  }}
                  className="absolute border-2 cursor-move touch-none"
                >
                  {/* Rule-of-thirds grid */}
                  <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, idx) => (
                      <div key={idx} className="border border-white/20" />
                    ))}
                  </div>

                  {/* Corner Resize Handles */}
                  {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
                    const posClass =
                      corner === 'nw'
                        ? '-top-1.5 -left-1.5 cursor-nwse-resize'
                        : corner === 'ne'
                          ? '-top-1.5 -right-1.5 cursor-nesw-resize'
                          : corner === 'sw'
                            ? '-bottom-1.5 -left-1.5 cursor-nesw-resize'
                            : '-bottom-1.5 -right-1.5 cursor-nwse-resize'
                    return (
                      <div
                        key={corner}
                        onPointerDown={(e) => handleCropPointerDown(e, corner)}
                        onPointerMove={handleCropPointerMove}
                        onPointerUp={handleCropPointerUp}
                        style={{ backgroundColor: theme.rgb }}
                        className={`absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow ${posClass}`}
                      />
                    )
                  })}
                </div>
              </div>
            ) : (
              outputUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={outputUrl}
                  alt="Compressed output preview"
                  className="max-w-full max-h-[62vh] object-contain rounded-lg shadow-2xl"
                />
              )
            )}
          </div>

          {/* Right / Bottom Inspector Panel */}
          <aside
            className={`${
              isCompact
                ? 'w-full max-h-[46%] border-t'
                : 'w-72 sm:w-80 shrink-0 border-l'
            } p-3.5 overflow-y-auto space-y-4 ${surface.subtleBg} ${surface.borderSubtle}`}
          >
            {/* 1. Crop Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1.5 font-semibold">
                  <FaCrop style={{ color: theme.rgb }} />
                  <span>Crop Aspect</span>
                </span>
                <span className={surface.textMuted}>
                  {croppedDims.width}×{croppedDims.height}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {ASPECT_PRESETS.map((preset) => {
                  const active = aspectRatio === preset.ratio
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectAspectPreset(preset.ratio)}
                      className={`py-1.5 rounded-lg border text-[11px] font-mono font-medium transition cursor-pointer ${
                        active ? 'text-white border-transparent' : btnClass
                      }`}
                      style={active ? { backgroundColor: theme.rgb } : undefined}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Resize Section */}
            <div className="pt-3 border-t border-current/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1.5 font-semibold">
                  <FaExpandArrowsAlt style={{ color: theme.rgb }} />
                  <span>Resize (px)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setLockAspect((l) => !l)}
                  title={lockAspect ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] cursor-pointer ${btnClass}`}
                  style={
                    lockAspect
                      ? { borderColor: theme.rgb, color: theme.rgb }
                      : undefined
                  }
                >
                  {lockAspect ? (
                    <FaLock className="w-2.5 h-2.5" />
                  ) : (
                    <FaUnlock className="w-2.5 h-2.5" />
                  )}
                  <span>{lockAspect ? 'Locked' : 'Free'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className={`text-[10px] font-mono ${surface.textMuted}`}>
                    Width
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={8000}
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono focus:outline-none ${surface.appBg} ${surface.borderSubtle}`}
                  />
                </label>

                <label className="space-y-1">
                  <span className={`text-[10px] font-mono ${surface.textMuted}`}>
                    Height
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={8000}
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono focus:outline-none ${surface.appBg} ${surface.borderSubtle}`}
                  />
                </label>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {SCALE_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyScalePreset(pct)}
                    className={`py-1 rounded-lg border text-[10px] font-mono cursor-pointer ${btnClass}`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Compress & Format Section */}
            <div className="pt-3 border-t border-current/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1.5 font-semibold">
                  <FaCompressArrowsAlt style={{ color: theme.rgb }} />
                  <span>Compress</span>
                </span>
                <span className={surface.textMuted}>
                  {format === 'image/png' ? 'Lossless' : `${quality}%`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {FORMAT_OPTIONS.map((opt) => {
                  const active = format === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormat(opt.value)}
                      className={`py-1.5 rounded-lg border text-[11px] font-mono font-semibold transition cursor-pointer ${
                        active ? 'text-white border-transparent' : btnClass
                      }`}
                      style={active ? { backgroundColor: theme.rgb } : undefined}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {format !== 'image/png' ? (
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ accentColor: theme.rgb }}
                  className="w-full cursor-pointer"
                />
              ) : (
                <p className={`text-[10px] font-mono ${surface.textMuted}`}>
                  PNG uses lossless compression; switch to WEBP or JPEG for smaller file sizes.
                </p>
              )}

              {/* Live Size Comparison Card */}
              <div
                className={`rounded-xl border p-2.5 space-y-1 text-[11px] font-mono ${surface.appBg} ${surface.borderSubtle}`}
              >
                <div className="flex justify-between">
                  <span className={surface.textMuted}>Original</span>
                  <span>{formatBytes(originalBytes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={surface.textMuted}>Output</span>
                  <span className="font-semibold">
                    {processing ? 'Calculating...' : formatBytes(outputBytes)}
                  </span>
                </div>
                {!processing && outputBytes > 0 && originalBytes > 0 && (
                  <div className="pt-1 border-t border-current/10 flex justify-between items-center">
                    <span className={surface.textMuted}>Change</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        sizeDeltaPct <= 0
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {sizeDeltaPct > 0 ? `+${sizeDeltaPct}%` : `${sizeDeltaPct}%`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}