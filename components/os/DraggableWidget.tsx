'use client'

import React, { useRef, useState, useEffect } from 'react'
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
  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Do not render positions on the server until client mounts
  if (!isMounted || !widgetState || !widgetState.isOpen) return null

  const handleMouseDown = (e: React.MouseEvent) => {
    dispatch(focusWidget(id))

    isDragging.current = true
    dragOffset.current = {
      x: e.clientX - widgetState.x,
      y: e.clientY - widgetState.y,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return
      const newX = moveEvent.clientX - dragOffset.current.x
      const newY = moveEvent.clientY - dragOffset.current.y
      dispatch(moveWidget({ id, x: newX, y: newY }))
    }

    const handleMouseUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${widgetState.x}px`,
        top: `${widgetState.y}px`,
        zIndex: widgetState.zIndex,
        cursor: 'grab',
      }}
      className="select-none active:cursor-grabbing"
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
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .widget-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4),
                      0 0 20px rgba(${theme.rgb}, 0.2);
        }
      `}</style>
      {children}
    </div>
  )
}