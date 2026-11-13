const pad = (n: number) => String(n).padStart(2, '0')

/** The date as "YYYY-MM-DD" in the player's own time zone. */
export function toLocalDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Moves a "YYYY-MM-DD" day by whole calendar days (safe across daylight saving changes). */
export function addDays(day: string, delta: number): string {
  const [year, month, date] = day.split('-').map(Number)
  return toLocalDay(new Date(year, month - 1, date + delta))
}

/** Consecutive solved days ending exactly at `day`. */
export function streakAsOf(days: string[], day: string): number {
  const solved = new Set(days)
  let length = 0
  for (let current = day; solved.has(current); current = addDays(current, -1)) length += 1
  return length
}

/**
 * The current streak. It stays alive through today: if you have not solved anything yet
 * today but did yesterday, the streak still counts until the day ends.
 */
export function currentStreak(days: string[], today: string): number {
  const solved = new Set(days)
  if (solved.has(today)) return streakAsOf(days, today)
  return streakAsOf(days, addDays(today, -1))
}

export function bestStreak(days: string[]): number {
  return Math.max(0, ...[...new Set(days)].map((day) => streakAsOf(days, day)))
}
