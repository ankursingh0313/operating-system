'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

const INTERACTIVE_SELECTOR =
  'a[href], button, [role="button"], [data-cursor="shrink"]'

const RESIZE_SELECTOR =
  '[data-cursor="resize"], .cursor-se-resize, .cursor-nesw-resize, .cursor-nwse-resize, .cursor-ew-resize, .cursor-ns-resize'

interface BracketRect {
  top: number
  left: number
  width: number
  height: number
}

export default function CustomCursor() {
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isOverInteractive, setIsOverInteractive] = useState(false)
  const [isGrabbing, setIsGrabbing] = useState(false)
  const [isResizeHover, setIsResizeHover] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [targetRect, setTargetRect] = useState<BracketRect | null>(null)

  const cursorRef = useRef<HTMLDivElement>(null)
  const hoveredElRef = useRef<HTMLElement | null>(null)
  const isResizeHoverRef = useRef(false)
  const posRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number | null>(null)

  const syncTargetRect = useCallback(() => {
    const el = hoveredElRef.current
    if (!el || !el.isConnected) {
      hoveredElRef.current = null
      setTargetRect(null)
      setIsOverInteractive(false)
      return
    }

    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setTargetRect(null)
      return
    }

    const pad = 5
    setTargetRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    })
  }, [])

  useEffect(() => {
    setIsMounted(true)

    if (window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%)`
      }
      rafRef.current = null
    }

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      setIsVisible(true)

      const target = e.target as HTMLElement | null
      const resizeEl = target?.closest(RESIZE_SELECTOR) as HTMLElement | null
      const overResize = Boolean(resizeEl)
      isResizeHoverRef.current = overResize
      setIsResizeHover(overResize)

      const matchedEl = overResize
        ? null
        : ((target?.closest(INTERACTIVE_SELECTOR) as HTMLElement | null) ?? null)

      if (matchedEl !== hoveredElRef.current) {
        hoveredElRef.current = matchedEl
        if (matchedEl) {
          setIsOverInteractive(true)
          const rect = matchedEl.getBoundingClientRect()
          const pad = 5
          setTargetRect({
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          })
        } else {
          setIsOverInteractive(false)
          setTargetRect(null)
        }
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updatePosition)
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      posRef.current = { x: e.clientX, y: e.clientY }
      setIsGrabbing(true)

      const target = e.target as HTMLElement | null
      const overResize = Boolean(target?.closest(RESIZE_SELECTOR))
      isResizeHoverRef.current = overResize
      setIsResizeHover(overResize)
      setIsResizing(overResize)

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updatePosition)
      }
    }

    const handleMouseUp = () => {
      setIsGrabbing(false)
      setIsResizing(false)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
      setIsOverInteractive(false)
      setIsGrabbing(false)
      setIsResizeHover(false)
      setIsResizing(false)
      hoveredElRef.current = null
      isResizeHoverRef.current = false
      setTargetRect(null)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    const handleScrollOrResize = () => {
      if (hoveredElRef.current) {
        syncTargetRect()
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown, { passive: true })
    window.addEventListener('mouseup', handleMouseUp, { passive: true })
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true })
    window.addEventListener('resize', handleScrollOrResize, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true })
      window.removeEventListener('resize', handleScrollOrResize)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [syncTargetRect])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const theme = COLOR_PACKAGES[activeAccent]

  if (!isMounted || !isVisible) return null

  const sizePx = isResizeHover ? 16 : isOverInteractive ? 6 : 12
  const cornerLen = targetRect
    ? Math.max(8, Math.min(14, Math.min(targetRect.width, targetRect.height) * 0.28))
    : 10
  const cornerThickness = 2
  const resizeCornerSize = 14
  const resizeCornerThickness = 3

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          *,
          *::before,
          *::after {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Corner Focus Brackets Around Hovered Button / Link */}
      {targetRect && !isResizeHover && (
        <div
          aria-hidden="true"
          className="fixed pointer-events-none z-[99999] transition-all duration-150 ease-out"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
        >
          {/* Top-Left */}
          <span
            className="absolute top-0 left-0"
            style={{
              width: `${cornerLen}px`,
              height: `${cornerLen}px`,
              borderTop: `${cornerThickness}px solid ${theme.rgb}`,
              borderLeft: `${cornerThickness}px solid ${theme.rgb}`,
              filter: `drop-shadow(0 0 4px ${theme.rgb})`,
            }}
          />
          {/* Top-Right */}
          <span
            className="absolute top-0 right-0"
            style={{
              width: `${cornerLen}px`,
              height: `${cornerLen}px`,
              borderTop: `${cornerThickness}px solid ${theme.rgb}`,
              borderRight: `${cornerThickness}px solid ${theme.rgb}`,
              filter: `drop-shadow(0 0 4px ${theme.rgb})`,
            }}
          />
          {/* Bottom-Left */}
          <span
            className="absolute bottom-0 left-0"
            style={{
              width: `${cornerLen}px`,
              height: `${cornerLen}px`,
              borderBottom: `${cornerThickness}px solid ${theme.rgb}`,
              borderLeft: `${cornerThickness}px solid ${theme.rgb}`,
              filter: `drop-shadow(0 0 4px ${theme.rgb})`,
            }}
          />
          {/* Bottom-Right */}
          <span
            className="absolute bottom-0 right-0"
            style={{
              width: `${cornerLen}px`,
              height: `${cornerLen}px`,
              borderBottom: `${cornerThickness}px solid ${theme.rgb}`,
              borderRight: `${cornerThickness}px solid ${theme.rgb}`,
              filter: `drop-shadow(0 0 4px ${theme.rgb})`,
            }}
          />
        </div>
      )}

      {/* Custom Cursor: Resize L-Bracket or Theme Square */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[100000] transition-[width,height,opacity,box-shadow,filter] duration-150 ease-out"
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          ...(isResizeHover
            ? {
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `${resizeCornerThickness}px solid ${theme.rgb}`,
                borderRight: `${resizeCornerThickness}px solid ${theme.rgb}`,
                width: `${resizeCornerSize}px`,
                height: `${resizeCornerSize}px`,
                borderRadius: '0px',
                boxShadow: 'none',
                filter: isResizing
                  ? `invert(1) drop-shadow(0 0 6px ${theme.rgb})`
                  : `drop-shadow(0 0 5px ${theme.rgb})`,
              }
            : {
                backgroundColor: theme.rgb,
                border: '1px solid rgba(0, 0, 0, 0.55)',
                boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.35), 0 0 ${isOverInteractive ? 8 : 12}px ${theme.rgb}`,
                borderRadius: '2px',
                filter: isGrabbing ? 'invert(1)' : 'none',
              }),
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  )
}