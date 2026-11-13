import type { Skill } from '../content/types.ts'
import type { Solve } from './types.ts'
import { isFastSolve } from './xp.ts'

export interface BadgeContext {
  solves: Solve[]
  bestStreak: number
  /** Skills that at least one challenge exists for. */
  availableSkills: Skill[]
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  target: number
  /** Progress toward the target (may exceed it). */
  current: (context: BadgeContext) => number
  /** If set, the badge needs challenges of this skill to exist. */
  needsSkill?: Skill
}

export interface BadgeProgress {
  id: string
  name: string
  description: string
  current: number
  target: number
  earned: boolean
  /** True when no challenge can earn it yet. */
  comingSoon: boolean
}

const count = (solves: Solve[], test: (solve: Solve) => boolean) =>
  solves.filter(test).length

/** Badges are data: add one here and it shows up everywhere. */
export const BADGES: readonly BadgeDefinition[] = [
  {
    id: 'first-catch',
    name: 'First Catch',
    description: 'Solve your first bug.',
    target: 1,
    current: ({ solves }) => solves.length,
  },
  {
    id: 'no-hints',
    name: 'No Hints Needed',
    description: 'Solve 3 bugs without using any hints.',
    target: 3,
    current: ({ solves }) => count(solves, (s) => s.hintsUsed === 0),
  },
  {
    id: 'journal-keeper',
    name: 'Journal Keeper',
    description: 'Write your hypothesis before running the tests, 5 times.',
    target: 5,
    current: ({ solves }) => count(solves, (s) => s.journalBeforeFirstRun),
  },
  {
    id: 'quick-draw',
    name: 'Quick Draw',
    description: 'Make 3 fast solves.',
    target: 3,
    current: ({ solves }) => count(solves, isFastSolve),
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Solve the same bug in both JavaScript and Python.',
    target: 2,
    current: ({ solves }) => {
      const languages = new Map<string, Set<string>>()
      for (const solve of solves) {
        const set = languages.get(solve.challengeId) ?? new Set<string>()
        set.add(solve.language)
        languages.set(solve.challengeId, set)
      }
      return Math.max(0, ...[...languages.values()].map((set) => set.size))
    },
  },
  {
    id: 'on-a-roll',
    name: 'On a Roll',
    description: 'Solve a bug 3 days in a row.',
    target: 3,
    current: ({ bestStreak }) => bestStreak,
  },
  {
    id: 'type-detective',
    name: 'Type Detective',
    description: 'Solve a bug about data types.',
    target: 1,
    needsSkill: 'data-types',
    current: ({ solves }) => count(solves, (s) => s.skill === 'data-types'),
  },
  {
    id: 'async-whisperer',
    name: 'Async Whisperer',
    description: 'Solve a bug about async code.',
    target: 1,
    needsSkill: 'async',
    current: ({ solves }) => count(solves, (s) => s.skill === 'async'),
  },
]

export function badgeProgress(context: BadgeContext): BadgeProgress[] {
  return BADGES.map((badge) => {
    const current = badge.current(context)
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      current: Math.min(current, badge.target),
      target: badge.target,
      earned: current >= badge.target,
      comingSoon:
        badge.needsSkill !== undefined &&
        !context.availableSkills.includes(badge.needsSkill),
    }
  })
}
