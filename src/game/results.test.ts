import { describe, expect, it } from 'vitest'
import type { RunResult, TestOutcome } from '../runners/types.ts'
import { displayTestName, headline, summarize } from './results.ts'

const pass = (name: string, bonus = false): TestOutcome => ({ name, bonus, passed: true })
const fail = (name: string, bonus = false): TestOutcome => ({
  name,
  bonus,
  passed: false,
})
const run = (tests: TestOutcome[], extra: Partial<RunResult> = {}): RunResult => ({
  tests,
  console: [],
  ...extra,
})

describe('displayTestName', () => {
  it('turns Python test names into readable text', () => {
    expect(displayTestName('test_ranks_120_points_above_95')).toBe(
      'ranks 120 points above 95',
    )
    expect(displayTestName('test_bonus_does_not_reorder')).toBe('does not reorder')
  })

  it('leaves JavaScript test names alone', () => {
    expect(displayTestName('ranks 120 points above 95 points')).toBe(
      'ranks 120 points above 95 points',
    )
  })
})

describe('summarize', () => {
  it('is failing while a required test fails, and keeps bonus tests locked', () => {
    const summary = summarize(run([pass('a'), fail('b'), fail('c', true)]))
    expect(summary.status).toBe('failing')
    expect(summary.passedRequired).toBe(1)
    expect(summary.bonusUnlocked).toBe(false)
    expect(headline(summary)).toBe('1 of 2 required tests passing')
  })

  it('is solved when every required test passes, even if a bonus test fails', () => {
    const summary = summarize(run([pass('a'), pass('b'), fail('c', true)]))
    expect(summary.status).toBe('solved')
    expect(summary.bonusUnlocked).toBe(true)
    expect(summary.passedBonus).toBe(0)
    expect(summary.bonus).toHaveLength(1)
  })

  it('reports a timeout', () => {
    const summary = summarize(run([], { error: 'too slow', timedOut: true }))
    expect(summary).toMatchObject({ status: 'timeout', message: 'too slow' })
    expect(headline(summary)).toMatch(/took too long/)
  })

  it('reports an error such as a syntax error', () => {
    const summary = summarize(run([], { error: 'SyntaxError: bad' }))
    expect(summary).toMatchObject({ status: 'error', message: 'SyntaxError: bad' })
  })

  it('treats a run with no tests as an error, not as solved', () => {
    const summary = summarize(run([]))
    expect(summary.status).toBe('error')
    expect(summary.message).toMatch(/No tests ran/)
  })
})
