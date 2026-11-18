import type { Challenge } from '../content/types.ts'

/** Whole days since 1970-01-01 for a "YYYY-MM-DD" day (calendar days, no time zones). */
export function dayNumber(day: string): number {
  const [year, month, date] = day.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, date) / 86_400_000)
}

/**
 * The daily bug: the same one for everyone on the same calendar day, with no server.
 * It walks through the challenges in ticket order and starts over after the last one.
 */
export function dailyChallenge(challenges: Challenge[], day: string): Challenge {
  if (challenges.length === 0) throw new Error('There are no challenges.')
  const index =
    ((dayNumber(day) % challenges.length) + challenges.length) % challenges.length
  return challenges[index]
}
