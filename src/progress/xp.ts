import type { Difficulty } from '../content/types.ts'
import { HINT_COST } from '../game/hints.ts'
import type { Solve } from './types.ts'

export const BASE_XP: Record<Difficulty, number> = { easy: 10, medium: 25, hard: 50 }

export const BONUS_XP = {
  noHints: 3,
  journal: 2,
  fastSolve: 3,
  bonusFind: 5,
  daily: 10,
} as const

/** Active time that counts as a "fast solve". */
export const FAST_SOLVE_MS: Record<Difficulty, number> = {
  easy: 5 * 60_000,
  medium: 12 * 60_000,
  hard: 25 * 60_000,
}

/** The streak bonus grows by 1 per extra streak day, up to this many XP. */
export const STREAK_BONUS_CAP = 5

export interface XpLine {
  id: string
  label: string
  xp: number
}

export interface XpBreakdown {
  lines: XpLine[]
  total: number
}

export const isFastSolve = (solve: Pick<Solve, 'difficulty' | 'elapsedMs'>) =>
  solve.elapsedMs <= FAST_SOLVE_MS[solve.difficulty]

export interface XpContext {
  /** XP is awarded once per challenge: for the first language solved. */
  firstForChallenge: boolean
  /** Length of the streak as of this solve's day (1 = no streak yet). */
  streakDays: number
}

/** The XP for one solve, as a list of lines the reward screen can show. */
export function calculateXp(solve: Solve, context: XpContext): XpBreakdown {
  if (!context.firstForChallenge) {
    return {
      lines: [
        { id: 'practice', label: 'Practice solve (XP is awarded once per bug)', xp: 0 },
      ],
      total: 0,
    }
  }

  const lines: XpLine[] = [
    {
      id: 'base',
      label: `Bug solved (${solve.difficulty})`,
      xp: BASE_XP[solve.difficulty],
    },
  ]
  if (solve.hintsUsed === 0)
    lines.push({ id: 'no-hints', label: 'No hints needed', xp: BONUS_XP.noHints })
  if (solve.journalBeforeFirstRun) {
    lines.push({ id: 'journal', label: 'Debug journal', xp: BONUS_XP.journal })
  }
  if (isFastSolve(solve))
    lines.push({ id: 'fast', label: 'Fast solve', xp: BONUS_XP.fastSolve })
  if (solve.bonusFound)
    lines.push({ id: 'bonus', label: 'Bonus find', xp: BONUS_XP.bonusFind })
  if (solve.isDaily)
    lines.push({ id: 'daily', label: 'Daily bug solved today', xp: BONUS_XP.daily })

  const streakBonus = Math.min(Math.max(context.streakDays - 1, 0), STREAK_BONUS_CAP)
  if (streakBonus > 0) {
    lines.push({
      id: 'streak',
      label: `${context.streakDays}-day streak`,
      xp: streakBonus,
    })
  }
  if (solve.hintsUsed > 0) {
    lines.push({
      id: 'hints',
      label: `Hints used (${solve.hintsUsed})`,
      xp: -HINT_COST * solve.hintsUsed,
    })
  }

  // Solving always counts, even after many hints.
  const raw = lines.reduce((sum, line) => sum + line.xp, 0)
  if (raw < 1) {
    lines.push({
      id: 'minimum',
      label: 'Solving always counts (minimum 1 XP)',
      xp: 1 - raw,
    })
  }
  return { lines, total: Math.max(raw, 1) }
}
