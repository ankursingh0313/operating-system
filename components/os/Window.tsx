'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { closeApp, focusApp, toggleMaximizeApp } from '@/lib/features/dockSlice'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import { VscMultipleWindows, VscWindow } from 'react-icons/vsc'
import { IoMdClose } from 'react-icons/io'

interface WindowProps {
  id: string
  title: string
  icon?: string
  children: React.ReactNode
  defaultWidth?: number
  defaultHeight?: number
}

export default function Window({
  id,
  title,
  children,
  defaultWidth = 700,
  defaultHeight = 450,
}: WindowProps) {
  const dispatch = useAppDispatch()
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const { openApps, minimizedApps, maximizedApps, focusedApp, windowOrder } =
    useAppSelector((state) => state.dock)

  const activeAccent = hydrated ? accent : 'blue'
  const activeMode = hydrated ? mode : 'dark'
  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)

  const isOpen = openApps.includes(id)
  const isMinimized = minimizedApps.includes(id)
  const isMaximized = maximizedApps.includes(id)
  const isFocused = focusedApp === id
  const zIndex = windowOrder.indexOf(id) + 10

  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })

  const windowRef = useRef<HTMLDivElement>(null)

  // Safe initial positioning based on window width/height
  const index = Math.max(0, windowOrder.indexOf(id))
  const initialX =
    typeof window !== 'undefined'
      ? (window.innerWidth - defaultWidth) / 2 + index * 25
      : 100
  const initialY =
    typeof window !== 'undefined'
      ? (window.innerHeight - defaultHeight) / 2 + index * 25
      : 100

  const posRef = useRef({ x: initialX, y: initialY })
  const unmaximizedPos = useRef({ x: initialX, y: initialY })
  const unmaximizedSize = useRef({ width: defaultWidth, height: defaultHeight })

  useEffect(() => {
    const node = windowRef.current
    if (!node) return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    node.addEventListener('contextmenu', handleContextMenu, { capture: true })

    return () => {
      node.removeEventListener('contextmenu', handleContextMenu, { capture: true })
    }
  }, [])

  // Apply initial position transform on mount (desktop only)
  useEffect(() => {
    if (windowRef.current && window.innerWidth >= 640) {
      windowRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0px)`
    }
  }, [])

  if (!isOpen || isMinimized) return null

  // 1. Smooth Dragging Handler
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    dispatch(focusApp(id))
    if (isMaximized || window.innerWidth < 640) return

    const startX = e.clientX - posRef.current.x
    const startY = e.clientY - posRef.current.y
    let animationFrameId: number | null = null

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      animationFrameId = requestAnimationFrame(() => {
        const newX = moveEvent.clientX - startX
        const newY = Math.max(0, moveEvent.clientY - startY)
        posRef.current = { x: newX, y: newY }

        if (windowRef.current) {
          windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`
        }
      })
    }

    const handleMouseUp = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // 2. Resize Handler
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(focusApp(id))
    if (isMaximized || window.innerWidth < 640) return

    const startWidth = size.width
    const startHeight = size.height
    const startX = e.clientX
    const startY = e.clientY

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(350, startWidth + (moveEvent.clientX - startX))
      const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY))
      setSize({ width: newWidth, height: newHeight })
      unmaximizedSize.current = { width: newWidth, height: newHeight }
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // 3. Toggle Maximize / Fullscreen (synced with Redux dockSlice)
  const toggleMaximize = () => {
    dispatch(focusApp(id))
    if (!isMaximized) {
      unmaximizedPos.current = { ...posRef.current }
      unmaximizedSize.current = { ...size }
      dispatch(toggleMaximizeApp(id))
      if (windowRef.current && window.innerWidth >= 640) {
        windowRef.current.style.transform = 'translate3d(0px, 0px, 0px)'
      }
    } else {
      dispatch(toggleMaximizeApp(id))
      posRef.current = { ...unmaximizedPos.current }
      setSize({ ...unmaximizedSize.current })
      if (windowRef.current && window.innerWidth >= 640) {
        windowRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0px)`
      }
    }
  }

  // 4. Touch Dragging Handler
  const handleTouchStartHeader = (e: React.TouchEvent) => {
    dispatch(focusApp(id))
    if (isMaximized) return

    const touch = e.touches[0]
    const startX = touch.clientX - posRef.current.x
    const startY = touch.clientY - posRef.current.y
    let animationFrameId: number | null = null

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      animationFrameId = requestAnimationFrame(() => {
        const moveTouch = moveEvent.touches[0]
        const newX = moveTouch.clientX - startX
        const newY = Math.max(0, moveTouch.clientY - startY)
        posRef.current = { x: newX, y: newY }

        if (windowRef.current) {
          windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`
        }
      })
    }

    const handleTouchEnd = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }

    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <div
      ref={windowRef}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => dispatch(focusApp(id))}
      className={`flex flex-col overflow-hidden shadow-2xl border backdrop-blur-2xl transition-[width,height,background-color,border-color] duration-150 ${surface.border} ${surface.windowBg} ${surface.textPrimary}
        ${
          isMaximized
            ? 'fixed inset-0 w-screen h-screen rounded-none top-0 left-0 translate-x-0 bottom-0 z-[9999]'
            : 'fixed top-12 left-1/2 -translate-x-1/2 w-[90vw] h-[75vh] sm:absolute sm:top-0 sm:left-0 sm:translate-x-0 sm:w-[var(--desktop-w)] sm:h-[var(--desktop-h)] rounded-2xl'
        }
        ${isFocused ? 'ring-1 ring-[var(--window-ring)]' : 'opacity-95'}
      `}
      style={{
        zIndex: isFocused ? 999 : zIndex,
        '--window-ring': theme.rgb,
        '--desktop-w': `${size.width}px`,
        '--desktop-h': `${size.height}px`,
      } as React.CSSProperties & Record<string, string | number>}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        onTouchStart={handleTouchStartHeader}
        className={`h-10 px-4 flex items-center justify-between border-b select-none cursor-grab active:cursor-grabbing touch-none ${surface.windowHeaderBg} ${surface.borderSubtle}`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold tracking-wide ${surface.textPrimary}`}>
            {title}
          </span>
        </div>

        {/* Window Controls (Maximize & Close) */}
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={toggleMaximize}
            className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition text-xs text-black font-bold opacity-80 hover:opacity-100 shadow-sm cursor-pointer"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <VscMultipleWindows /> : <VscWindow />}
          </button>
          <button
            type="button"
            onClick={() => dispatch(closeApp(id))}
            className="w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center transition text-xs text-black font-bold opacity-80 hover:opacity-100 shadow-sm cursor-pointer"
            title="Close"
          >
            <IoMdClose />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className={`flex-1 overflow-auto p-0 text-sm ${surface.textPrimary}`}>
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-end justify-end p-1 opacity-40 hover:opacity-100 hidden sm:flex"
          title="Resize"
        >
          <div className={`w-2 h-2 border-r-2 border-b-2 ${surface.border}`} />
        </div>
      )}
    </div>
  )
}