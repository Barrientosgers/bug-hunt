import { describe, expect, it } from 'vitest'
import { FAST_SOLVE_MS, calculateXp } from './xp.ts'
import type { Solve } from './types.ts'

const solve = (overrides: Partial<Solve> = {}): Solve => ({
  challengeId: '001-leaderboard',
  number: 1,
  language: 'js',
  difficulty: 'easy',
  skill: 'data-types',
  solvedAt: 0,
  day: '2026-11-12',
  runs: 3,
  hintsUsed: 0,
  elapsedMs: 60 * 60_000, // an hour: not fast for any difficulty
  journalBeforeFirstRun: false,
  bonusFound: false,
  flag: 'BUGHUNT{snackr-001-js-abcdef}',
  finalCode: '',
  isDaily: false,
  ...overrides,
})
const first = { firstForChallenge: true, streakDays: 1 }
const lines = (breakdown: ReturnType<typeof calculateXp>) =>
  breakdown.lines.map((l) => l.id)

describe('calculateXp', () => {
  it('awards the base XP by difficulty, plus the no-hints bonus', () => {
    expect(calculateXp(solve(), first).total).toBe(13) // 10 + 3
    expect(calculateXp(solve({ difficulty: 'medium' }), first).total).toBe(28)
    expect(calculateXp(solve({ difficulty: 'hard' }), first).total).toBe(53)
  })

  it('adds the journal, fast solve and bonus find bonuses', () => {
    const best = solve({ journalBeforeFirstRun: true, elapsedMs: 1000, bonusFound: true })
    const breakdown = calculateXp(best, first)
    expect(lines(breakdown)).toEqual(['base', 'no-hints', 'journal', 'fast', 'bonus'])
    expect(breakdown.total).toBe(10 + 3 + 2 + 3 + 5)
  })

  it('only counts a fast solve within the time limit', () => {
    expect(lines(calculateXp(solve({ elapsedMs: FAST_SOLVE_MS.easy }), first))).toContain(
      'fast',
    )
    expect(
      lines(calculateXp(solve({ elapsedMs: FAST_SOLVE_MS.easy + 1 }), first)),
    ).not.toContain('fast')
  })

  it('subtracts 2 XP per hint and removes the no-hints bonus', () => {
    const breakdown = calculateXp(solve({ hintsUsed: 3 }), first)
    expect(lines(breakdown)).not.toContain('no-hints')
    expect(breakdown.total).toBe(10 - 6)
  })

  it('never goes below 1 XP, and the lines always add up to the total', () => {
    const breakdown = calculateXp(solve({ hintsUsed: 4 }), first) // 10 - 8 = 2, fine
    expect(breakdown.total).toBe(2)
    const harsh = calculateXp(solve({ hintsUsed: 4, difficulty: 'easy' }), {
      firstForChallenge: true,
      streakDays: 1,
    })
    expect(harsh.total).toBeGreaterThanOrEqual(1)
    const impossible = calculateXp(solve({ hintsUsed: 9 }), first)
    expect(impossible.total).toBe(1)
    expect(impossible.lines.reduce((sum, l) => sum + l.xp, 0)).toBe(1)
    expect(lines(impossible)).toContain('minimum')
  })

  it('adds a streak bonus of 1 per extra day, capped at 5', () => {
    const bonus = (streakDays: number) =>
      calculateXp(solve(), { firstForChallenge: true, streakDays }).lines.find(
        (l) => l.id === 'streak',
      )?.xp
    expect(bonus(1)).toBeUndefined()
    expect(bonus(2)).toBe(1)
    expect(bonus(4)).toBe(3)
    expect(bonus(30)).toBe(5)
  })

  it('adds the daily bonus only for the daily bug', () => {
    expect(lines(calculateXp(solve({ isDaily: true }), first))).toContain('daily')
    expect(lines(calculateXp(solve(), first))).not.toContain('daily')
  })

  it('gives no XP for the second language of the same bug', () => {
    const breakdown = calculateXp(solve(), { firstForChallenge: false, streakDays: 5 })
    expect(breakdown.total).toBe(0)
    expect(lines(breakdown)).toEqual(['practice'])
  })
})
