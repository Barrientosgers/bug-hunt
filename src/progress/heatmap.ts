import { addDays } from './streak.ts'

export interface HeatmapCell {
  /** "YYYY-MM-DD" */
  day: string
  count: number
  /** 0 (nothing solved) to 4 (four or more). Used for shading. */
  level: 0 | 1 | 2 | 3 | 4
  /** After today: shown as an empty slot, never as "0 solved". */
  future: boolean
}

export const HEATMAP_WEEKS = 12

/** 0 for Monday ... 6 for Sunday. */
function weekdayIndex(day: string): number {
  const [year, month, date] = day.split('-').map(Number)
  return (new Date(year, month - 1, date).getDay() + 6) % 7
}

export const levelFor = (count: number): HeatmapCell['level'] =>
  count <= 0 ? 0 : count >= 4 ? 4 : (count as 1 | 2 | 3)

/**
 * The heatmap grid: one array per week (Monday first), oldest week first. The last week
 * is the one that contains `today`.
 */
export function buildHeatmap(
  solvesPerDay: Record<string, number>,
  today: string,
  weeks = HEATMAP_WEEKS,
): HeatmapCell[][] {
  const thisMonday = addDays(today, -weekdayIndex(today))
  const start = addDays(thisMonday, -7 * (weeks - 1))
  const grid: HeatmapCell[][] = []
  for (let week = 0; week < weeks; week += 1) {
    const column: HeatmapCell[] = []
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const day = addDays(start, week * 7 + weekday)
      const future = day > today
      const count = future ? 0 : (solvesPerDay[day] ?? 0)
      column.push({ day, count, level: levelFor(count), future })
    }
    grid.push(column)
  }
  return grid
}

/** A text version of the heatmap for screen readers. */
export function describeHeatmap(grid: HeatmapCell[][]): string {
  const cells = grid.flat().filter((cell) => !cell.future)
  const solved = cells.reduce((sum, cell) => sum + cell.count, 0)
  const activeDays = cells.filter((cell) => cell.count > 0).length
  return `${solved} ${solved === 1 ? 'bug' : 'bugs'} solved on ${activeDays} ${
    activeDays === 1 ? 'day' : 'days'
  } in the last ${grid.length} weeks.`
}
