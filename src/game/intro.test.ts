import { describe, expect, it } from 'vitest'
import {
  INTRO_KEY,
  readIntroDismissed,
  saveIntroDismissed,
  shouldShowIntro,
} from './intro.ts'

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
    removeItem: (key: string) => {
      delete data[key]
    },
  }
}

const blocked = () => {
  throw new Error('blocked')
}

describe('shouldShowIntro', () => {
  it('shows for new players who have not dismissed it', () => {
    expect(shouldShowIntro(0, false)).toBe(true)
  })

  it('hides after a dismissal or after the first solve', () => {
    expect(shouldShowIntro(0, true)).toBe(false)
    expect(shouldShowIntro(1, false)).toBe(false)
    expect(shouldShowIntro(5, true)).toBe(false)
  })
})

describe('saved dismissal', () => {
  it('starts as not dismissed and remembers a dismissal', () => {
    const storage = fakeStorage()
    expect(readIntroDismissed(() => storage)).toBe(false)
    saveIntroDismissed(() => storage)
    expect(readIntroDismissed(() => storage)).toBe(true)
  })

  it('ignores unexpected saved values', () => {
    expect(readIntroDismissed(() => fakeStorage({ [INTRO_KEY]: 'maybe' }))).toBe(false)
  })

  it('works when storage is blocked', () => {
    expect(readIntroDismissed(blocked)).toBe(false)
    expect(() => saveIntroDismissed(blocked)).not.toThrow()
  })
})
