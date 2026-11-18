import { describe, expect, it } from 'vitest'
import type { Challenge } from '../content/types.ts'
import { addDays } from '../progress/streak.ts'
import { dailyChallenge, dayNumber } from './daily.ts'

const make = (n: number) => ({ id: `c${n}`, number: n }) as Challenge
const five = [1, 2, 3, 4, 5].map(make)

describe('dayNumber', () => {
  it('counts calendar days', () => {
    expect(dayNumber('1970-01-01')).toBe(0)
    expect(dayNumber('1970-01-02')).toBe(1)
    expect(dayNumber('2026-03-29') - dayNumber('2026-03-28')).toBe(1)
  })
})

describe('dailyChallenge', () => {
  it('gives the same bug for the same day', () => {
    expect(dailyChallenge(five, '2026-11-18').id).toBe(
      dailyChallenge(five, '2026-11-18').id,
    )
  })

  it('walks through every challenge, then starts over', () => {
    const days = Array.from({ length: 10 }, (_, i) => addDays('2026-11-18', i))
    const ids = days.map((day) => dailyChallenge(five, day).id)
    expect(new Set(ids.slice(0, 5)).size).toBe(5)
    expect(ids.slice(5)).toEqual(ids.slice(0, 5))
  })

  it('changes at the year boundary like any other day', () => {
    const a = dailyChallenge(five, '2026-12-31').number
    const b = dailyChallenge(five, '2027-01-01').number
    expect(b).toBe((a % 5) + 1)
  })

  it('works with a single challenge and dates before 1970', () => {
    expect(dailyChallenge([make(1)], '2026-11-18').id).toBe('c1')
    expect(dailyChallenge(five, '1960-01-01')).toBeDefined()
  })

  it('throws a clear error with no challenges', () => {
    expect(() => dailyChallenge([], '2026-11-18')).toThrow('no challenges')
  })
})
