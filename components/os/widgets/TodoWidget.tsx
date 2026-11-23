'use client'

import React, { useState, useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import { FaPlus, FaCheck, FaTrash } from 'react-icons/fa'

interface TodoItem {
  id: string
  text: string
  done: boolean
}

const STORAGE_KEY = 'dossieros_todo_list_v1'
const MAX_TODOS = 25
const MAX_TASK_LEN = 90

export default function TodoWidget() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)
  const [input, setInput] = useState('')
  const [todos, setTodos] = useState<TodoItem[]>([])

  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setTodos(parsed.slice(0, MAX_TODOS))
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, [])

  const persistTodos = (nextTodos: TodoItem[]) => {
    setTodos(nextTodos)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTodos))
    } catch {
      // Ignore storage quota/access errors
    }
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim().slice(0, MAX_TASK_LEN)
    if (!trimmed || todos.length >= MAX_TODOS) return

    const newItem: TodoItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: trimmed,
      done: false,
    }
    persistTodos([newItem, ...todos])
    setInput('')
  }

  const handleToggle = (id: string) => {
    persistTodos(
      todos.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    )
  }

  const handleDelete = (id: string) => {
    persistTodos(todos.filter((item) => item.id !== id))
  }

  const handleClearCompleted = () => {
    persistTodos(todos.filter((item) => !item.done))
  }

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const completedCount = todos.filter((t) => t.done).length
  const remainingCount = todos.length - completedCount

  return (
    <div
      className={`flex flex-col justify-between p-4 w-[350px] h-[220px] gap-2 ${surface.textPrimary}`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold truncate ${surface.textMuted}`}
          >
            Tasks
          </span>
        </div>

        <button
          type="button"
          onClick={handleClearCompleted}
          disabled={completedCount === 0}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition disabled:opacity-35 cursor-pointer shrink-0 ${surface.subtleBg} ${surface.cardHoverBg} ${surface.borderSubtle} ${surface.textSecondary}`}
        >
          Clear Done
        </button>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAdd} className="flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_TASK_LEN))}
          placeholder="Add a task..."
          aria-label="New task"
          className={`flex-1 min-w-0 rounded-lg border px-2.5 py-1 text-xs outline-none transition-colors ${surface.textPrimary} ${
            isLight
              ? 'bg-white/75 border-slate-200/90 placeholder:text-slate-400'
              : 'bg-black/25 border-white/[0.07] placeholder:text-slate-500'
          }`}
          style={{ caretColor: theme.rgb }}
        />
        <button
          type="submit"
          disabled={!input.trim() || todos.length >= MAX_TODOS}
          title="Add task"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs transition disabled:opacity-35 cursor-pointer shrink-0"
          style={{ backgroundColor: theme.rgb }}
        >
          <FaPlus className="w-2.5 h-2.5" />
        </button>
      </form>

      {/* Task List */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pr-0.5">
        {todos.length === 0 ? (
          <div
            className={`h-full rounded-lg border border-dashed flex items-center justify-center text-[11px] ${surface.borderSubtle} ${surface.textMuted}`}
          >
            No tasks yet
          </div>
        ) : (
          todos.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between gap-2 px-2 py-1 rounded-lg border text-xs transition-colors ${
                isLight
                  ? 'bg-white/60 border-slate-200/70 hover:bg-white/90'
                  : 'bg-black/20 border-white/[0.05] hover:bg-black/35'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
              >
                <span
                  className="w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 transition-colors"
                  style={
                    item.done
                      ? {
                          backgroundColor: theme.rgb,
                          borderColor: theme.rgb,
                          color: '#ffffff',
                        }
                      : {
                          borderColor: `rgba(${accentRgbClean}, 0.45)`,
                          backgroundColor: 'transparent',
                        }
                  }
                >
                  {item.done && <FaCheck className="w-2 h-2" />}
                </span>
                <span
                  className={`truncate ${
                    item.done
                      ? `line-through opacity-55 ${surface.textMuted}`
                      : surface.textPrimary
                  }`}
                >
                  {item.text}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                title="Delete task"
                aria-label={`Delete ${item.text}`}
                className={`opacity-60 hover:opacity-100 transition cursor-pointer shrink-0 ${surface.textMuted} hover:text-rose-500`}
              >
                <FaTrash className="w-2.5 h-2.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className={`flex items-center justify-between text-[10px] font-mono shrink-0 ${surface.textMuted}`}
      >
        <span>Local save</span>
        <span>
          {remainingCount} left · {completedCount} done
        </span>
      </div>
    </div>
  )
}