import { describe, expect, it } from 'vitest'
import {
  HINT_COUNT,
  hintTitle,
  hintsKey,
  needsConfirmation,
  nextHintLevel,
  readHintsUsed,
  saveHintsUsed,
} from './hints.ts'

const memory = (initial: Record<string, string> = {}) => {
  const data = { ...initial }
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

describe('hint ladder', () => {
  it('reveals levels 1 to 4 in order, then stops', () => {
    expect([0, 1, 2, 3, 4].map(nextHintLevel)).toEqual([1, 2, 3, 4, null])
    expect(nextHintLevel(99)).toBeNull()
  })

  it('has a title for each of the 4 levels, starting with a method not the answer', () => {
    expect(HINT_COUNT).toBe(4)
    expect(hintTitle(1)).toBe('Read the failing test')
    expect(hintTitle(4)).toBe('Full explanation')
  })

  it('asks for confirmation only before the full explanation', () => {
    expect([1, 2, 3, 4].map(needsConfirmation)).toEqual([false, false, false, true])
  })
})

describe('hint storage', () => {
  it('keeps a separate count per challenge and language', () => {
    const storage = memory()
    saveHintsUsed('a', 'js', 2, storage)
    saveHintsUsed('a', 'python', 1, storage)
    expect(readHintsUsed('a', 'js', storage)).toBe(2)
    expect(readHintsUsed('a', 'python', storage)).toBe(1)
    expect(readHintsUsed('b', 'js', storage)).toBe(0)
    expect(hintsKey('a', 'js')).not.toBe(hintsKey('a', 'python'))
  })

  it('ignores corrupted or out-of-range values', () => {
    expect(readHintsUsed('a', 'js', memory({ [hintsKey('a', 'js')]: 'banana' }))).toBe(0)
    expect(readHintsUsed('a', 'js', memory({ [hintsKey('a', 'js')]: '9' }))).toBe(
      HINT_COUNT,
    )
    expect(readHintsUsed('a', 'js', memory({ [hintsKey('a', 'js')]: '-3' }))).toBe(0)
  })
})
