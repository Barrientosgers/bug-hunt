import { describe, expect, it } from 'vitest'
import { FLAG_PATTERN, generateFlag } from './flag.ts'

describe('generateFlag', () => {
  it('has the BUGHUNT{snackr-NNN-lang-xxxxxx} format', () => {
    expect(generateFlag(1, 'js')).toMatch(FLAG_PATTERN)
    expect(generateFlag(42, 'python')).toMatch(/^BUGHUNT\{snackr-042-py-[a-z2-9]{6}\}$/)
  })

  it('is deterministic for a given random source, and never uses confusing characters', () => {
    const fixed = () => [0, 1, 2, 3, 4, 5]
    expect(generateFlag(1, 'js', fixed)).toBe(generateFlag(1, 'js', fixed))
    for (let i = 0; i < 200; i++) {
      expect(generateFlag(1, 'js')).not.toMatch(/-[a-z2-9]*[01oil][a-z2-9]*\}/)
    }
  })

  it('differs between calls (random)', () => {
    expect(generateFlag(1, 'js')).not.toBe(generateFlag(1, 'js'))
  })
})
