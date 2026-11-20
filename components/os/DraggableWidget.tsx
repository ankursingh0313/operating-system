'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { moveWidget, focusWidget } from '@/lib/features/widgetsSlice'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'

interface DraggableWidgetProps {
  id: string
  children: React.ReactNode
}

export default function DraggableWidget({ id, children }: DraggableWidgetProps) {
  const dispatch = useAppDispatch()
  const [isMounted, setIsMounted] = useState(false)
  const { accent } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[accent]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const widgetState = useAppSelector((state) => state.widgets?.widgets?.[id])
  const widgetRef = useRef<HTMLDivElement>(null)
  
  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Calculate current pixel positions based on ratios and update DOM + Redux on resize
  const updatePositionOnResize = useCallback(() => {
    if (!widgetRef.current || !widgetState) return
    const rect = widgetRef.current.getBoundingClientRect()
    const maxX = Math.max(1, window.innerWidth - rect.width - 20)
    const maxY = Math.max(1, window.innerHeight - rect.height - 20)

    // Fallback if ratios aren't set yet
    const xRatio = widgetState.xRatio !== undefined ? widgetState.xRatio : 0.75
    const yRatio = widgetState.yRatio !== undefined ? widgetState.yRatio : 0.1

    const newX = Math.round(xRatio * maxX)
    const newY = Math.round(yRatio * maxY)

    // Apply transform instantly
    widgetRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`

    // Update Redux x and y so they match the resized screen perfectly on reload
    if (newX !== widgetState.x || newY !== widgetState.y) {
      dispatch(moveWidget({ id, x: newX, y: newY, xRatio, yRatio }))
    }
  }, [widgetState, id, dispatch])

  useEffect(() => {
    updatePositionOnResize()
    window.addEventListener('resize', updatePositionOnResize)
    return () => window.removeEventListener('resize', updatePositionResizeCleanUp => {
      window.removeEventListener('resize', updatePositionOnResize)
    })
  }, [updatePositionOnResize])

  if (!isMounted || !widgetState || !widgetState.isOpen) return null

  const handleMouseDown = (e: React.MouseEvent) => {
    dispatch(focusWidget(id))
    isDragging.current = true

    if (!widgetRef.current) return
    const rect = widgetRef.current.getBoundingClientRect()
    
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    let animationFrameId: number | null = null

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !widgetRef.current) return

      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      animationFrameId = requestAnimationFrame(() => {
        const rect = widgetRef.current!.getBoundingClientRect()
        const maxX = Math.max(0, window.innerWidth - rect.width - 20)
        const maxY = Math.max(0, window.innerHeight - rect.height - 20)

        const newX = Math.max(10, Math.min(moveEvent.clientX - dragOffset.current.x, maxX))
        const newY = Math.max(10, Math.min(moveEvent.clientY - dragOffset.current.y, maxY))

        widgetRef.current!.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`
      })
    }

    const handleMouseUp = () => {
      if (!isDragging.current || !widgetRef.current) return
      isDragging.current = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      const rect = widgetRef.current.getBoundingClientRect()
      const maxX = Math.max(1, window.innerWidth - rect.width - 20)
      const maxY = Math.max(1, window.innerHeight - rect.height - 20)

      const finalX = Math.max(10, Math.min(rect.left, maxX))
      const finalY = Math.max(10, Math.min(rect.top, maxY))

      const xRatio = finalX / maxX
      const yRatio = finalY / maxY

      // Save updated absolute pixels and ratios to Redux on drop
      dispatch(
        moveWidget({
          id,
          x: Math.round(finalX),
          y: Math.round(finalY),
          xRatio,
          yRatio,
        })
      )

      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return
    dispatch(focusWidget(id))
    isDragging.current = true

    if (!widgetRef.current) return
    const touch = e.touches[0]
    const rect = widgetRef.current.getBoundingClientRect()

    dragOffset.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }

    let animationFrameId: number | null = null

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDragging.current || !widgetRef.current || moveEvent.touches.length === 0) return
      if (moveEvent.cancelable) moveEvent.preventDefault()

      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      const moveTouch = moveEvent.touches[0]
      animationFrameId = requestAnimationFrame(() => {
        const currentRect = widgetRef.current!.getBoundingClientRect()
        const maxX = Math.max(0, window.innerWidth - currentRect.width - 20)
        const maxY = Math.max(0, window.innerHeight - currentRect.height - 20)

        const newX = Math.max(10, Math.min(moveTouch.clientX - dragOffset.current.x, maxX))
        const newY = Math.max(10, Math.min(moveTouch.clientY - dragOffset.current.y, maxY))

        widgetRef.current!.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`
      })
    }

    const handleTouchEnd = () => {
      if (!isDragging.current || !widgetRef.current) return
      isDragging.current = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      const finalRect = widgetRef.current.getBoundingClientRect()
      const maxX = Math.max(1, window.innerWidth - finalRect.width - 20)
      const maxY = Math.max(1, window.innerHeight - finalRect.height - 20)

      const finalX = Math.max(10, Math.min(finalRect.left, maxX))
      const finalY = Math.max(10, Math.min(finalRect.top, maxY))

      const xRatio = finalX / maxX
      const yRatio = finalY / maxY

      dispatch(
        moveWidget({
          id,
          x: Math.round(finalX),
          y: Math.round(finalY),
          xRatio,
          yRatio,
        })
      )

      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
    }

    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchcancel', handleTouchEnd)
  }

  return (
    <div
      ref={widgetRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'absolute',
        left: '0px',
        top: '0px',
        zIndex: widgetState.zIndex,
        transform: `translate3d(${widgetState.x || 0}px, ${widgetState.y || 0}px, 0px)`,
        cursor: 'grab',
      }}
      className="widget-card select-none active:cursor-grabbing absolute touch-none"
    >
      <style>{`
        .widget-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px) saturate(140%);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3),
                      0 0 15px rgba(${theme.rgb}, 0.1);
          color: #ffffff;
          transition: box-shadow 0.2s ease;
        }
        .widget-card:hover {
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4),
                      0 0 20px rgba(${theme.rgb}, 0.2);
        }
      `}</style>
      {children}
    </div>
  )
}