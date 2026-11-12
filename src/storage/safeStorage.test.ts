import { describe, expect, it } from 'vitest'
import { readItem, writeItem } from './safeStorage.ts'

const throwing = () => {
  throw new Error('storage blocked')
}

describe('safeStorage', () => {
  it('writes and reads a value', () => {
    const data: Record<string, string> = {}
    const storage = () => ({
      getItem: (key: string) => data[key] ?? null,
      setItem: (key: string, value: string) => {
        data[key] = value
      },
    })
    writeItem('a', '1', storage)
    expect(readItem('a', storage)).toBe('1')
    expect(readItem('missing', storage)).toBeNull()
  })

  it('never throws when storage is blocked', () => {
    expect(readItem('a', throwing)).toBeNull()
    expect(() => writeItem('a', '1', throwing)).not.toThrow()
  })
})
