import type { Language, Skill } from '../content/types.ts'
import { badgeProgress, type BadgeProgress } from './badges.ts'
import { rankFor, type RankInfo } from './ranks.ts'
import { isFirstForChallenge } from './store.ts'
import { bestStreak, currentStreak, streakAsOf } from './streak.ts'
import type { ProgressData, Solve } from './types.ts'
import { calculateXp, type XpBreakdown } from './xp.ts'

/** Skill points per solve: harder bugs teach more. */
export const SKILL_POINTS = { easy: 1, medium: 2, hard: 3 } as const

/** The XP breakdown for one solve, derived from everything saved. */
export function solveBreakdown(data: ProgressData, solve: Solve): XpBreakdown {
  const daysUpToSolve = data.solves.filter((s) => s.day <= solve.day).map((s) => s.day)
  return calculateXp(solve, {
    firstForChallenge: isFirstForChallenge(data, solve),
    streakDays: streakAsOf(daysUpToSolve, solve.day),
  })
}

export const totalXp = (data: ProgressData) =>
  data.solves.reduce((sum, solve) => sum + solveBreakdown(data, solve).total, 0)

export type SkillPoints = Partial<Record<Skill, Partial<Record<Language, number>>>>

export interface ProgressSummary {
  totalXp: number
  rank: RankInfo
  solvedCount: number
  currentStreak: number
  bestStreak: number
  /** Points per skill category and language (the data behind the skill map). */
  skillPoints: SkillPoints
  badges: BadgeProgress[]
  /** Solves per day, for the heatmap. */
  solvesPerDay: Record<string, number>
}

export function summarizeProgress(
  data: ProgressData,
  today: string,
  availableSkills: Skill[],
): ProgressSummary {
  const days = data.solves.map((s) => s.day)
  const best = bestStreak(days)

  const skillPoints: SkillPoints = {}
  const solvesPerDay: Record<string, number> = {}
  for (const solve of data.solves) {
    const bySkill = (skillPoints[solve.skill] ??= {})
    bySkill[solve.language] =
      (bySkill[solve.language] ?? 0) + SKILL_POINTS[solve.difficulty]
    solvesPerDay[solve.day] = (solvesPerDay[solve.day] ?? 0) + 1
  }

  const xp = totalXp(data)
  return {
    totalXp: xp,
    rank: rankFor(xp),
    solvedCount: data.solves.length,
    currentStreak: currentStreak(days, today),
    bestStreak: best,
    skillPoints,
    badges: badgeProgress({ solves: data.solves, bestStreak: best, availableSkills }),
    solvesPerDay,
  }
}

/** Badges that are earned with `after` but were not with `before` (for the reward screen). */
export function newlyEarnedBadges(
  before: ProgressData,
  after: ProgressData,
  today: string,
  availableSkills: Skill[],
): BadgeProgress[] {
  const earnedBefore = new Set(
    summarizeProgress(before, today, availableSkills)
      .badges.filter((b) => b.earned)
      .map((b) => b.id),
  )
  return summarizeProgress(after, today, availableSkills).badges.filter(
    (b) => b.earned && !earnedBefore.has(b.id),
  )
}
