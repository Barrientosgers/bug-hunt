import { describe, expect, it } from 'vitest'
import { readStoredTheme, resolveTheme, saveTheme, THEME_KEY } from './theme.ts'

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
    data,
  }
}

const throwingStorage = () => {
  throw new Error('storage blocked')
}

describe('resolveTheme', () => {
  it('prefers the saved choice over the system setting', () => {
    expect(resolveTheme('dark', true)).toBe('dark')
    expect(resolveTheme('light', false)).toBe('light')
  })

  it('follows the system when nothing is saved, and defaults to dark', () => {
    expect(resolveTheme(null, true)).toBe('light')
    expect(resolveTheme(null, false)).toBe('dark')
  })
})

describe('theme storage', () => {
  it('saves and reads a theme', () => {
    const storage = fakeStorage()
    saveTheme('light', () => storage)
    expect(storage.data[THEME_KEY]).toBe('light')
    expect(readStoredTheme(() => storage)).toBe('light')
  })

  it('ignores garbage values', () => {
    expect(readStoredTheme(() => fakeStorage({ [THEME_KEY]: 'neon' }))).toBeNull()
  })

  it('does not crash when storage throws', () => {
    expect(readStoredTheme(throwingStorage)).toBeNull()
    expect(() => saveTheme('dark', throwingStorage)).not.toThrow()
  })
})
