'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import { FaBackspace, FaHistory, FaTrash } from 'react-icons/fa'

type Operator = '+' | '-' | '*' | '/' | '%'

interface HistoryEntry {
  id: string
  expression: string
  result: string
}

const MAX_DIGITS = 14
const MAX_HISTORY = 20
const MAX_EXPR_CHARS = 100

function clampExpression(expr: string): string {
  if (expr.length <= MAX_EXPR_CHARS) return expr
  return `…${expr.slice(-(MAX_EXPR_CHARS - 1))}`
}

function computeBinary(a: number, b: number, op: Operator): number | 'Error' {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 'Error'
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '*':
      return a * b
    case '/':
      return b === 0 ? 'Error' : a / b
    case '%':
      return (a / 100) * b
  }
}

function formatNumber(value: number | 'Error'): string {
  if (value === 'Error' || !Number.isFinite(value)) return 'Error'
  if (Object.is(value, -0)) return '0'

  const abs = Math.abs(value)
  if ((abs !== 0 && abs < 1e-9) || abs >= 1e12) {
    return value.toExponential(6).replace(/\.?0+e/, 'e')
  }

  const rounded = Number(value.toPrecision(12))
  return String(rounded)
}

function formatOperatorSuffix(op: Operator): string {
  switch (op) {
    case '+':
      return ' +'
    case '-':
      return ' −'
    case '*':
      return ' ×'
    case '/':
      return ' ÷'
    case '%':
      return '% of'
  }
}

function stripTrailingOperator(expr: string): string {
  return expr.replace(/(?:\s*[+\−×÷]|%\s*of)\s*$/, '').trim()
}

export default function CalculatorApp() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)

  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [expressionLine, setExpressionLine] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const pushHistory = useCallback((expr: string, res: string) => {
    if (res === 'Error') return
    const boundedExpr = clampExpression(expr.trim())
    if (!boundedExpr) return

    setHistory((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        expression: boundedExpr,
        result: res,
      },
      ...prev.slice(0, MAX_HISTORY - 1),
    ])
  }, [])

  const handleClearAll = useCallback(() => {
    setDisplay('0')
    setStoredValue(null)
    setOperator(null)
    setWaitingForOperand(false)
    setExpressionLine('')
  }, [])

  const handleDigit = useCallback(
    (digit: string) => {
      if (display === 'Error') {
        setDisplay(digit)
        setStoredValue(null)
        setOperator(null)
        setWaitingForOperand(false)
        setExpressionLine('')
        return
      }

      if (waitingForOperand) {
        if (operator === null) {
          setExpressionLine('')
        }
        setDisplay(digit)
        setWaitingForOperand(false)
        return
      }

      const plainDigits = display.replace(/[^0-9]/g, '')
      if (plainDigits.length >= MAX_DIGITS) return

      setDisplay(display === '0' ? digit : `${display}${digit}`)
    },
    [display, waitingForOperand, operator]
  )

  const handleDecimal = useCallback(() => {
    if (display === 'Error' || waitingForOperand) {
      if (operator === null) {
        setExpressionLine('')
      }
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(`${display}.`)
    }
  }, [display, waitingForOperand, operator])

  const handleToggleSign = useCallback(() => {
    if (display === 'Error' || display === '0') return
    setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`)
  }, [display])

  const handleBackspace = useCallback(() => {
    if (display === 'Error') {
      handleClearAll()
      return
    }
    if (waitingForOperand) return

    if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0')
    } else {
      setDisplay(display.slice(0, -1))
    }
  }, [display, waitingForOperand, handleClearAll])

  const handleOperator = useCallback(
    (nextOp: Operator) => {
      if (display === 'Error') return
      const current = parseFloat(display)
      if (Number.isNaN(current)) return

      const nextSuffix = formatOperatorSuffix(nextOp)

      // Starting a new operation (either fresh or continuing from a previous '=' result)
      if (storedValue === null || operator === null) {
        const formattedCurrent = formatNumber(current)
        setStoredValue(current)
        setOperator(nextOp)
        setWaitingForOperand(true)
        setExpressionLine(clampExpression(`${formattedCurrent}${nextSuffix}`))
        return
      }

      // User pressed a different operator before typing the next number: swap operator cleanly
      if (waitingForOperand) {
        const baseExpr = stripTrailingOperator(expressionLine) || formatNumber(storedValue)
        setOperator(nextOp)
        setExpressionLine(clampExpression(`${baseExpr}${nextSuffix}`))
        return
      }

      // Chained operation without '=': evaluate intermediate step & log it to history
      const computed = computeBinary(storedValue, current, operator)
      const formattedResult = formatNumber(computed)
      const formattedCurrent = formatNumber(current)

      if (computed === 'Error') {
        setDisplay('Error')
        setStoredValue(null)
        setOperator(null)
        setWaitingForOperand(true)
        setExpressionLine('')
        return
      }

      const stepExpr = `${formatNumber(storedValue)}${formatOperatorSuffix(operator)} ${formattedCurrent}`
      const chainedExpr = expressionLine
        ? `${expressionLine} ${formattedCurrent}`
        : stepExpr

      pushHistory(stepExpr, formattedResult)
      setDisplay(formattedResult)
      setStoredValue(computed)
      setOperator(nextOp)
      setWaitingForOperand(true)
      setExpressionLine(clampExpression(`${chainedExpr}${nextSuffix}`))
    },
    [display, storedValue, operator, waitingForOperand, expressionLine, pushHistory]
  )

  const handleEquals = useCallback(() => {
    if (display === 'Error' || storedValue === null || operator === null) return
    const current = parseFloat(display)
    if (Number.isNaN(current)) return

    const computed = computeBinary(storedValue, current, operator)
    const formattedResult = formatNumber(computed)
    const formattedCurrent = formatNumber(current)

    const fallbackExpr = `${formatNumber(storedValue)}${formatOperatorSuffix(operator)} ${formattedCurrent}`
    const fullExpr = expressionLine
      ? `${expressionLine} ${formattedCurrent}`
      : fallbackExpr

    setDisplay(formattedResult)
    setExpressionLine(clampExpression(`${fullExpr} =`))
    setStoredValue(null)
    setOperator(null)
    setWaitingForOperand(true)
    pushHistory(fullExpr, formattedResult)
  }, [display, storedValue, operator, expressionLine, pushHistory])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        handleDigit(e.key)
      } else if (e.key === '.') {
        e.preventDefault()
        handleDecimal()
      } else if (
        e.key === '+' ||
        e.key === '-' ||
        e.key === '*' ||
        e.key === '/' ||
        e.key === '%'
      ) {
        e.preventDefault()
        handleOperator(e.key)
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        handleEquals()
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleClearAll()
      }
    },
    [
      handleDigit,
      handleDecimal,
      handleOperator,
      handleEquals,
      handleBackspace,
      handleClearAll,
    ]
  )

  const numBtnClass = `${surface.subtleBg} ${surface.cardHoverBg} border ${surface.borderSubtle} ${surface.textPrimary}`
  const fnBtnClass = isLight
    ? 'bg-slate-200/80 hover:bg-slate-300/80 border-slate-300/80 text-slate-800'
    : 'bg-white/[0.08] hover:bg-white/[0.14] border-white/[0.1] text-slate-100'
  const opBtnClass = isLight
    ? 'border-slate-200/90 hover:brightness-95'
    : 'border-white/[0.1] hover:brightness-110'

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`h-full w-full overflow-y-auto outline-none select-none transition-colors duration-200 p-4 sm:p-6 flex items-center justify-center ${surface.appBg} ${surface.textPrimary}`}
    >
      <div
        className={`w-full max-w-[360px] rounded-2xl border p-4 flex flex-col gap-3.5 shadow-xl ${
          isLight
            ? 'bg-white/90 border-slate-200/90'
            : 'bg-black/35 border-white/[0.08]'
        }`}
      >
        {/* Top Utility Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            
            <span
              className={`text-xs font-semibold uppercase tracking-wider font-mono ${surface.textMuted}`}
            >
              Calculator
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
              showHistory ? '' : fnBtnClass
            }`}
            style={
              showHistory
                ? {
                    backgroundColor: `rgba(${accentRgbClean}, 0.16)`,
                    borderColor: `rgba(${accentRgbClean}, 0.5)`,
                    color: theme.rgb,
                  }
                : undefined
            }
          >
            <FaHistory className="w-3 h-3" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* Display or History View */}
        {showHistory ? (
          <div
            className={`h-[124px] rounded-xl border p-2.5 flex flex-col justify-between ${
              isLight
                ? 'bg-slate-100/90 border-slate-200/90'
                : 'bg-black/30 border-white/[0.07]'
            }`}
          >
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {history.length === 0 ? (
                <div
                  className={`h-full flex items-center justify-center text-xs ${surface.textMuted}`}
                >
                  No calculations yet
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDisplay(item.result)
                      setStoredValue(null)
                      setOperator(null)
                      setExpressionLine(clampExpression(`${item.expression} =`))
                      setWaitingForOperand(true)
                      setShowHistory(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg border transition flex flex-col gap-0.5 cursor-pointer ${
                      isLight
                        ? 'bg-white/80 hover:bg-white border-slate-200/80'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06]'
                    }`}
                  >
                    <span className={`text-[11px] font-mono truncate ${surface.textMuted}`}>
                      {item.expression}
                    </span>
                    <span className="text-xs font-mono font-semibold truncate">
                      = {item.result}
                    </span>
                  </button>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="pt-1.5 mt-1 border-t border-white/[0.06] flex justify-end">
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className={`inline-flex items-center gap-1 text-[10px] font-mono cursor-pointer ${surface.textMuted} hover:text-rose-400`}
                >
                  <FaTrash className="w-2.5 h-2.5" />
                  <span>Clear History</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`h-[124px] rounded-xl border px-4 py-3 flex flex-col justify-between text-right ${
              isLight
                ? 'bg-slate-100/90 border-slate-200/90'
                : 'bg-black/30 border-white/[0.07]'
            }`}
          >
            <div className="flex flex-col items-end gap-0.5 min-w-0">
              <div
                className={`text-[11px] font-mono h-4 w-full truncate ${surface.textMuted}`}
              >
                {expressionLine || '\u00A0'}
              </div>
              {history[0] && (
                <div
                  className={`text-[10px] font-mono h-3.5 w-full truncate opacity-75 ${surface.textMuted}`}
                >
                  Last: {history[0].expression} = {history[0].result}
                </div>
              )}
            </div>
            <div
              className={`font-mono font-semibold tracking-tight tabular-nums break-all leading-none ${
                display.length > 10 ? 'text-2xl' : 'text-4xl'
              }`}
            >
              {display}
            </div>
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className={`h-12 rounded-xl border text-xs font-semibold transition cursor-pointer ${fnBtnClass}`}
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleToggleSign}
            className={`h-12 rounded-xl border text-sm font-medium transition cursor-pointer ${fnBtnClass}`}
          >
            ±
          </button>
          <button
            type="button"
            onClick={() => handleOperator('%')}
            className={`h-12 rounded-xl border text-sm font-semibold transition cursor-pointer ${
              operator === '%' ? opBtnClass : fnBtnClass
            }`}
            style={
              operator === '%'
                ? {
                    backgroundColor: theme.rgb,
                    color: '#ffffff',
                  }
                : undefined
            }
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleOperator('/')}
            className={`h-12 rounded-xl border text-base font-semibold transition cursor-pointer ${opBtnClass}`}
            style={{
              backgroundColor:
                operator === '/'
                  ? theme.rgb
                  : `rgba(${accentRgbClean}, ${isLight ? '0.16' : '0.2'})`,
              color: operator === '/' ? '#ffffff' : theme.rgb,
            }}
          >
            ÷
          </button>

          {(['7', '8', '9'] as const).map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className={`h-12 rounded-xl border text-base font-mono font-medium transition cursor-pointer ${numBtnClass}`}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('*')}
            className={`h-12 rounded-xl border text-base font-semibold transition cursor-pointer ${opBtnClass}`}
            style={{
              backgroundColor:
                operator === '*'
                  ? theme.rgb
                  : `rgba(${accentRgbClean}, ${isLight ? '0.16' : '0.2'})`,
              color: operator === '*' ? '#ffffff' : theme.rgb,
            }}
          >
            ×
          </button>

          {(['4', '5', '6'] as const).map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className={`h-12 rounded-xl border text-base font-mono font-medium transition cursor-pointer ${numBtnClass}`}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('-')}
            className={`h-12 rounded-xl border text-base font-semibold transition cursor-pointer ${opBtnClass}`}
            style={{
              backgroundColor:
                operator === '-'
                  ? theme.rgb
                  : `rgba(${accentRgbClean}, ${isLight ? '0.16' : '0.2'})`,
              color: operator === '-' ? '#ffffff' : theme.rgb,
            }}
          >
            −
          </button>

          {(['1', '2', '3'] as const).map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className={`h-12 rounded-xl border text-base font-mono font-medium transition cursor-pointer ${numBtnClass}`}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className={`h-12 rounded-xl border text-base font-semibold transition cursor-pointer ${opBtnClass}`}
            style={{
              backgroundColor:
                operator === '+'
                  ? theme.rgb
                  : `rgba(${accentRgbClean}, ${isLight ? '0.16' : '0.2'})`,
              color: operator === '+' ? '#ffffff' : theme.rgb,
            }}
          >
            +
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className={`h-12 rounded-xl border text-base font-mono font-medium transition cursor-pointer ${numBtnClass}`}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDecimal}
            className={`h-12 rounded-xl border text-base font-mono font-medium transition cursor-pointer ${numBtnClass}`}
          >
            .
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Backspace"
            className={`h-12 rounded-xl border flex items-center justify-center transition cursor-pointer ${fnBtnClass}`}
          >
            <FaBackspace className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleEquals}
            className="h-12 rounded-xl text-lg font-semibold text-white transition hover:brightness-110 cursor-pointer"
            style={{ backgroundColor: theme.rgb }}
          >
            =
          </button>
        </div>
      </div>
    </div>
  )
}