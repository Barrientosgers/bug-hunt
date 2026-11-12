import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearSavedCode,
  codeKey,
  createDebouncedSaver,
  readSavedCode,
  saveCode,
} from './code.ts'

function fakeStorage() {
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

describe('saved code', () => {
  it('keeps a separate copy per challenge and language', () => {
    const storage = fakeStorage()
    saveCode('001-leaderboard', 'js', 'js code', storage)
    saveCode('001-leaderboard', 'python', 'py code', storage)
    expect(readSavedCode('001-leaderboard', 'js', storage)).toBe('js code')
    expect(readSavedCode('001-leaderboard', 'python', storage)).toBe('py code')
    expect(codeKey('001-leaderboard', 'js')).not.toBe(
      codeKey('001-leaderboard', 'python'),
    )
  })

  it('can be cleared', () => {
    const storage = fakeStorage()
    saveCode('a', 'js', 'x', storage)
    clearSavedCode('a', 'js', storage)
    expect(readSavedCode('a', 'js', storage)).toBeNull()
  })
})

describe('createDebouncedSaver', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('waits until typing pauses and saves only the latest value', () => {
    const save = vi.fn()
    const saver = createDebouncedSaver(save, 500)
    saver.schedule('k', 'a')
    vi.advanceTimersByTime(300)
    saver.schedule('k', 'ab')
    vi.advanceTimersByTime(499)
    expect(save).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(save).toHaveBeenCalledOnce()
    expect(save).toHaveBeenCalledWith('k', 'ab')
  })

  it('keeps separate timers per key', () => {
    const save = vi.fn()
    const saver = createDebouncedSaver(save, 500)
    saver.schedule('js', 'one')
    saver.schedule('python', 'two')
    vi.advanceTimersByTime(500)
    expect(save).toHaveBeenCalledTimes(2)
  })

  it('flush saves waiting values immediately, and cancel drops one', () => {
    const save = vi.fn()
    const saver = createDebouncedSaver(save, 500)
    saver.schedule('a', '1')
    saver.schedule('b', '2')
    saver.cancel('b')
    saver.flush()
    expect(save).toHaveBeenCalledOnce()
    expect(save).toHaveBeenCalledWith('a', '1')
    vi.advanceTimersByTime(1000)
    expect(save).toHaveBeenCalledOnce()
  })
})
