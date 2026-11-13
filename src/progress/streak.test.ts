import { describe, expect, it } from 'vitest'
import { addDays, bestStreak, currentStreak, streakAsOf, toLocalDay } from './streak.ts'

describe('days', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toLocalDay(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('adds days across month and year ends', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09') // around a daylight saving change
  })
})

describe('streaks', () => {
  const days = ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-05']

  it('counts consecutive days ending at a given day', () => {
    expect(streakAsOf(days, '2026-11-12')).toBe(3)
    expect(streakAsOf(days, '2026-11-11')).toBe(2)
    expect(streakAsOf(days, '2026-11-07')).toBe(0)
  })

  it('keeps the streak alive through today if yesterday was solved', () => {
    expect(currentStreak(days, '2026-11-12')).toBe(3)
    expect(currentStreak(days, '2026-11-13')).toBe(3)
    expect(currentStreak(days, '2026-11-14')).toBe(0)
  })

  it('finds the best streak ever', () => {
    expect(bestStreak(days)).toBe(3)
    expect(bestStreak([])).toBe(0)
  })

  it('counts two solves on one day as one day', () => {
    expect(currentStreak(['2026-11-12', '2026-11-12'], '2026-11-12')).toBe(1)
  })
})
