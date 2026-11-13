import { describe, expect, it } from 'vitest'
import { badgeProgress } from './badges.ts'
import {
  addSolve,
  emptyProgress,
  isFirstForChallenge,
  loadProgress,
  markBonusFound,
  parseProgress,
  saveProgress,
} from './store.ts'
import {
  newlyEarnedBadges,
  solveBreakdown,
  summarizeProgress,
  totalXp,
} from './summary.ts'
import type { ProgressData, Solve } from './types.ts'

const solve = (overrides: Partial<Solve> = {}): Solve => ({
  challengeId: '001-leaderboard',
  number: 1,
  language: 'js',
  difficulty: 'easy',
  skill: 'data-types',
  solvedAt: 1000,
  day: '2026-11-10',
  runs: 3,
  hintsUsed: 0,
  elapsedMs: 60 * 60_000,
  journalBeforeFirstRun: false,
  bonusFound: false,
  flag: 'BUGHUNT{snackr-001-js-abcdef}',
  finalCode: 'code',
  isDaily: false,
  ...overrides,
})

const build = (...solves: Solve[]): ProgressData =>
  solves.reduce(addSolve, emptyProgress())

const memory = () => {
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

describe('store', () => {
  it('accepts solves saved without a trail, and rejects a malformed trail', () => {
    const withTrail = solve({ trail: 'ryg' })
    const raw = JSON.stringify({
      version: 1,
      solves: [solve(), withTrail, { ...solve({ challengeId: 'z' }), trail: 'xyz' }],
    })
    expect(parseProgress(raw).solves).toHaveLength(2)
  })

  it('round-trips progress through storage', () => {
    const storage = memory()
    const data = build(solve())
    saveProgress(data, storage)
    expect(loadProgress(storage)).toEqual(data)
  })

  it('survives corrupted or unknown data', () => {
    expect(parseProgress(null)).toEqual(emptyProgress())
    expect(parseProgress('not json')).toEqual(emptyProgress())
    expect(parseProgress('{"version":2,"solves":[]}')).toEqual(emptyProgress())
    expect(parseProgress('{"version":1,"solves":"nope"}')).toEqual(emptyProgress())
  })

  it('drops malformed solves but keeps the valid ones', () => {
    const raw = JSON.stringify({
      version: 1,
      solves: [solve(), { challengeId: 'x' }, solve({ day: 'yesterday' })],
    })
    expect(parseProgress(raw).solves).toHaveLength(1)
  })

  it('ignores a second solve of the same bug in the same language', () => {
    const once = build(solve())
    expect(addSolve(once, solve({ solvedAt: 5000 }))).toBe(once)
  })

  it('marks the bonus found once, with the code that found it', () => {
    const data = build(solve())
    const updated = markBonusFound(data, '001-leaderboard', 'js', 'better code')
    expect(updated.solves[0]).toMatchObject({
      bonusFound: true,
      finalCode: 'better code',
    })
    expect(markBonusFound(updated, '001-leaderboard', 'js', 'again')).toBe(updated)
    expect(markBonusFound(data, 'other', 'js', 'x')).toBe(data)
  })

  it('knows which language was solved first', () => {
    const js = solve({ solvedAt: 1000 })
    const py = solve({ language: 'python', solvedAt: 2000 })
    const data = build(js, py)
    expect(isFirstForChallenge(data, js)).toBe(true)
    expect(isFirstForChallenge(data, py)).toBe(false)
  })
})

describe('summary', () => {
  const skills = ['data-types' as const]

  it('derives XP from solves, giving XP once per challenge', () => {
    const js = solve({ solvedAt: 1000 })
    const py = solve({ language: 'python', solvedAt: 2000 })
    const data = build(js, py)
    expect(solveBreakdown(data, js).total).toBe(13)
    expect(solveBreakdown(data, py).total).toBe(0)
    expect(totalXp(data)).toBe(13)
  })

  it('adds the streak bonus from the days solved so far', () => {
    const data = build(
      solve({ challengeId: 'a', day: '2026-11-10' }),
      solve({ challengeId: 'b', day: '2026-11-11' }),
      solve({ challengeId: 'c', day: '2026-11-12' }),
    )
    const [, second, third] = data.solves
    expect(solveBreakdown(data, second).lines.find((l) => l.id === 'streak')?.xp).toBe(1)
    expect(solveBreakdown(data, third).lines.find((l) => l.id === 'streak')?.xp).toBe(2)
  })

  it('later bonus finds raise the XP of the earlier solve', () => {
    const data = build(solve())
    const updated = markBonusFound(data, '001-leaderboard', 'js', 'x')
    expect(totalXp(updated)).toBe(totalXp(data) + 5)
  })

  it('summarizes rank, streaks, skill points and solves per day', () => {
    const data = build(
      solve({ challengeId: 'a', day: '2026-11-11' }),
      solve({ challengeId: 'b', day: '2026-11-12', difficulty: 'medium' }),
      solve({
        challengeId: 'b',
        language: 'python',
        day: '2026-11-12',
        solvedAt: 3000,
        difficulty: 'medium',
      }),
    )
    const summary = summarizeProgress(data, '2026-11-12', skills)
    expect(summary.solvedCount).toBe(3)
    expect(summary.currentStreak).toBe(2)
    expect(summary.skillPoints['data-types']).toEqual({ js: 3, python: 2 })
    expect(summary.solvesPerDay['2026-11-12']).toBe(2)
    expect(summary.rank.rank.name).toBe('Intern')
  })

  it('reports newly earned badges after a solve', () => {
    const before = emptyProgress()
    const after = build(solve())
    const earned = newlyEarnedBadges(before, after, '2026-11-10', skills).map((b) => b.id)
    expect(earned).toContain('first-catch')
    expect(earned).toContain('type-detective')
    expect(newlyEarnedBadges(after, after, '2026-11-10', skills)).toEqual([])
  })
})

describe('badges', () => {
  const context = (
    solves: Solve[],
    bestStreak = 0,
    availableSkills: Solve['skill'][] = [],
  ) => badgeProgress({ solves, bestStreak, availableSkills })
  const badge = (list: ReturnType<typeof context>, id: string) =>
    list.find((b) => b.id === id)!

  it('awards Polyglot only when one bug is solved in both languages', () => {
    const oneEach = [
      solve({ challengeId: 'a' }),
      solve({ challengeId: 'b', language: 'python' }),
    ]
    expect(badge(context(oneEach), 'polyglot').earned).toBe(false)
    const both = [
      solve({ challengeId: 'a' }),
      solve({ challengeId: 'a', language: 'python' }),
    ]
    expect(badge(context(both), 'polyglot').earned).toBe(true)
  })

  it('counts progress toward badges and caps it at the target', () => {
    const solves = [1, 2, 3, 4].map((n) => solve({ challengeId: String(n) }))
    const noHints = badge(context(solves), 'no-hints')
    expect(noHints).toMatchObject({ current: 3, target: 3, earned: true })
  })

  it('earns On a Roll from the best streak', () => {
    expect(badge(context([solve()], 3), 'on-a-roll').earned).toBe(true)
    expect(badge(context([solve()], 2), 'on-a-roll').earned).toBe(false)
  })

  it('marks skill badges as coming soon when no challenge of that skill exists', () => {
    const list = context([], 0, ['data-types'])
    expect(badge(list, 'async-whisperer').comingSoon).toBe(true)
    expect(badge(list, 'type-detective').comingSoon).toBe(false)
  })
})
