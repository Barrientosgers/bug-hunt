import { useEffect, useMemo, useRef, useState } from 'react'
import { readItem, writeItem } from '../storage/safeStorage.ts'
import {
  TIMER_HIDDEN_KEY,
  advance,
  readDone,
  readElapsed,
  saveDone,
  saveElapsed,
  timerKey,
  type TimerState,
} from './timer.ts'
import type { Language } from '../content/types.ts'

interface Display {
  key: string
  elapsedMs: number
}

/**
 * Active-time timer for one challenge and language. It counts only while `ready` is true
 * (journal done) and the page is visible, and it freezes for good once `solved`.
 */
export function useTimer(
  challengeId: string,
  language: Language,
  ready: boolean,
  solved: boolean,
) {
  const key = timerKey(challengeId, language)
  const [display, setDisplay] = useState<Display>(() => ({
    key,
    elapsedMs: readElapsed(key),
  }))
  const clock = useRef<TimerState & { key: string }>({
    key,
    elapsedMs: display.elapsedMs,
    lastTickMs: null,
  })

  // A solve is remembered, so a refresh cannot restart the clock.
  const done = useMemo(() => solved || readDone(key), [solved, key])
  useEffect(() => {
    if (solved) saveDone(key)
  }, [solved, key])

  const counting = ready && !done

  useEffect(() => {
    if (!counting) return
    const tick = () => {
      if (clock.current.key !== key) {
        clock.current = { key, elapsedMs: readElapsed(key), lastTickMs: null }
      }
      const visible = document.visibilityState === 'visible'
      clock.current = { key, ...advance(clock.current, Date.now(), visible) }
      saveElapsed(key, clock.current.elapsedMs)
      setDisplay({ key, elapsedMs: clock.current.elapsedMs })
    }
    const id = setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
      clock.current.lastTickMs = null
    }
  }, [counting, key])

  const elapsedMs = display.key === key ? display.elapsedMs : readElapsed(key)
  return { elapsedMs, running: counting }
}

/** Whether the player chose to hide the timer (remembered between visits). */
export function useTimerHidden() {
  const [hidden, setHidden] = useState(() => readItem(TIMER_HIDDEN_KEY) === '1')
  function toggle() {
    const next = !hidden
    writeItem(TIMER_HIDDEN_KEY, next ? '1' : '0')
    setHidden(next)
  }
  return { hidden, toggle }
}
