'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { closeApp, focusApp } from '@/lib/features/dockSlice'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

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
  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const { openApps, minimizedApps, focusedApp, windowOrder } = useAppSelector((state) => state.dock)

  const activeAccent = hydrated ? accent : 'blue'
  const theme = COLOR_PACKAGES[activeAccent]

  const isOpen = openApps.includes(id)
  const isMinimized = minimizedApps.includes(id)
  const isFocused = focusedApp === id
  const zIndex = windowOrder.indexOf(id) + 10

  const [isMaximized, setIsMaximized] = useState(false)
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  
  const windowRef = useRef<HTMLDivElement>(null)
  
  // Safe initial positioning based on window width/height
  const index = Math.max(0, windowOrder.indexOf(id))
  const initialX = typeof window !== 'undefined' ? (window.innerWidth - defaultWidth) / 2 + (index * 25) : 100
  const initialY = typeof window !== 'undefined' ? (window.innerHeight - defaultHeight) / 2 + (index * 25) : 100
  
  const posRef = useRef({ x: initialX, y: initialY })
  const unmaximizedPos = useRef({ x: initialX, y: initialY })
  const unmaximizedSize = useRef({ width: defaultWidth, height: defaultHeight })

  // Apply initial position transform on mount
  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0px)`
    }
  }, [])

  if (!isOpen || isMinimized) return null

  // 1. Smooth Dragging Handler
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    dispatch(focusApp(id))
    if (isMaximized) return

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
    if (isMaximized) return

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

  // 3. Toggle Maximize / Fullscreen
  const toggleMaximize = () => {
    dispatch(focusApp(id))
    if (!isMaximized) {
      unmaximizedPos.current = { ...posRef.current }
      unmaximizedSize.current = { ...size }
      setIsMaximized(true)
      if (windowRef.current) {
        windowRef.current.style.transform = 'translate3d(0px, 0px, 0px)'
      }
    } else {
      setIsMaximized(false)
      posRef.current = { ...unmaximizedPos.current }
      setSize({ ...unmaximizedSize.current })
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0px)`
      }
    }
  }

  return (
    <div
      ref={windowRef}
      onClick={() => dispatch(focusApp(id))}
      style={{
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: isMaximized ? '100vw' : `${size.width}px`,
        height: isMaximized ? 'calc(100vh - 5rem)' : `${size.height}px`,
        zIndex: isFocused ? 999 : zIndex,
        '--window-ring': theme.rgb,
      } as React.CSSProperties}
      className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-gray-900/90 backdrop-blur-2xl transition-[width,height] duration-150 ${
        isFocused ? 'ring-1 ring-[var(--window-ring)]' : 'opacity-95'
      }`}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className="h-11 px-4 flex items-center justify-between bg-white/[0.04] border-b border-white/10 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-gray-200">{title}</span>
        </div>

        {/* 2 Window Controls (Maximize & Close) */}
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={toggleMaximize}
            className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition text-[9px] text-black font-bold opacity-80 hover:opacity-100 shadow-sm"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? '🗗' : '⁺'}
          </button>
          <button
            onClick={() => dispatch(closeApp(id))}
            className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center transition text-[9px] text-black font-bold opacity-80 hover:opacity-100 shadow-sm"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-auto p-5 text-gray-100 text-sm">
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-end justify-end p-1 opacity-40 hover:opacity-100"
          title="Resize"
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-white/50" />
        </div>
      )}
    </div>
  )
}