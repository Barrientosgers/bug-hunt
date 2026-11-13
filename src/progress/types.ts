import type { Difficulty, Language, Skill } from '../content/types.ts'

/** One solved challenge in one language. Everything else (XP, rank, ...) is derived from these. */
export interface Solve {
  challengeId: string
  /** The ticket number, used in the flag. */
  number: number
  language: Language
  difficulty: Difficulty
  skill: Skill
  /** Epoch milliseconds. */
  solvedAt: number
  /** The player's local calendar day, "YYYY-MM-DD". Streaks are counted in these. */
  day: string
  /** Test runs it took, including the one that solved it. */
  runs: number
  hintsUsed: number
  /** Active time (timer) when the bug was solved. */
  elapsedMs: number
  /** The hypothesis was saved before the first test run. */
  journalBeforeFirstRun: boolean
  /** All bonus tests passed at some point (may be found after the first solve). */
  bonusFound: boolean
  /** MVP flags are for personal progress only; a server will issue real ones later. */
  flag: string
  /** The player's code that passed (used to rebuild the code review after a refresh). */
  finalCode: string
  /**
   * How the runs went, one letter each: r = no progress, y = progress, g = solved.
   * Optional, because solves saved before this field existed do not have it.
   */
  trail?: string
  /** Solved on the day the daily bug was current (Phase 6). */
  isDaily: boolean
}

export interface ProgressData {
  version: 1
  solves: Solve[]
}
