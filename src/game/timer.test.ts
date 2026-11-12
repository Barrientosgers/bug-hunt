import { describe, expect, it } from 'vitest'
import {
  MAX_GAP_MS,
  advance,
  formatDuration,
  readDone,
  readElapsed,
  saveDone,
  saveElapsed,
  type TimerState,
} from './timer.ts'

const memory = () => {
  const data: Record<string, string> = {}
  return () => ({
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
    removeItem: (key: string) => {
      delete data[key]
    },
  })
}

describe('advance', () => {
  it('adds the time since the last tick while counting', () => {
    let state: TimerState = { elapsedMs: 0, lastTickMs: null }
    state = advance(state, 1000, true) // first tick only starts the clock
    state = advance(state, 2000, true)
    state = advance(state, 3000, true)
    expect(state.elapsedMs).toBe(2000)
  })

  it('pauses and adds nothing while not counting', () => {
    let state: TimerState = { elapsedMs: 5000, lastTickMs: 1000 }
    state = advance(state, 2000, false)
    expect(state).toEqual({ elapsedMs: 5000, lastTickMs: null })
  })

  it('does not add the paused time when the clock resumes', () => {
    let state: TimerState = { elapsedMs: 5000, lastTickMs: 1000 }
    state = advance(state, 2000, false) // tab hidden
    state = advance(state, 600_000, true) // back ten minutes later
    expect(state.elapsedMs).toBe(5000)
  })

  it('ignores huge gaps, such as a laptop going to sleep', () => {
    const state = advance({ elapsedMs: 0, lastTickMs: 1000 }, 3_600_000, true)
    expect(state.elapsedMs).toBe(MAX_GAP_MS)
  })
})

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(252_000)).toBe('04:12')
    expect(formatDuration(59_999)).toBe('00:59')
  })

  it('adds hours after the first hour', () => {
    expect(formatDuration(3_845_000)).toBe('1:04:05')
  })
})

describe('timer storage', () => {
  it('saves elapsed time and the done flag', () => {
    const storage = memory()
    expect(readElapsed('k', storage)).toBe(0)
    saveElapsed('k', 12_345.6, storage)
    expect(readElapsed('k', storage)).toBe(12_346)
    expect(readDone('k', storage)).toBe(false)
    saveDone('k', storage)
    expect(readDone('k', storage)).toBe(true)
  })

  it('ignores corrupted values', () => {
    const storage = () => ({
      getItem: () => 'banana',
      setItem: () => undefined,
      removeItem: () => undefined,
    })
    expect(readElapsed('k', storage)).toBe(0)
  })
})
