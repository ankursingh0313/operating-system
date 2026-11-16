'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { moveWidget, focusWidget } from '@/lib/features/widgetsSlice'

interface DraggableWidgetProps {
  id: string
  children: React.ReactNode
}

export default function DraggableWidget({ id, children }: DraggableWidgetProps) {
  const dispatch = useAppDispatch()
  const [isMounted, setIsMounted] = useState(false)

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
      {children}
    </div>
  )
}