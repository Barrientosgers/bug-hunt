import { describe, expect, it } from 'vitest'
import type { ReviewRule } from '../content/types.ts'
import { firedRules, ruleFires } from './rules.ts'

const rule = (matches: boolean): ReviewRule => ({
  id: 'r',
  kind: 'root-cause',
  pattern: 'Number\\(',
  matches,
  feedback: 'x',
})

describe('ruleFires', () => {
  it('fires on a match when matches is true', () => {
    expect(ruleFires(rule(true), 'Number(a)')).toBe(true)
    expect(ruleFires(rule(true), 'a - b')).toBe(false)
  })

  it('fires on a non-match when matches is false', () => {
    expect(ruleFires(rule(false), 'a - b')).toBe(true)
    expect(ruleFires(rule(false), 'Number(a)')).toBe(false)
  })

  it('firedRules keeps only the rules that fire', () => {
    expect(firedRules([rule(true), rule(false)], 'Number(a)')).toHaveLength(1)
  })
})
