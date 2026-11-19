import { describe, expect, it } from 'vitest'
import { plural } from './format.ts'

describe('plural', () => {
  it('uses the singular for exactly one', () => {
    expect(plural(1, 'day')).toBe('1 day')
  })

  it('uses the plural for zero and for many', () => {
    expect(plural(0, 'day')).toBe('0 days')
    expect(plural(2, 'day')).toBe('2 days')
    expect(plural(11, 'bug')).toBe('11 bugs')
  })
})
