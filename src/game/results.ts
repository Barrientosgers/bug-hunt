import type { RunResult, TestOutcome } from '../runners/types.ts'

export type SummaryStatus = 'solved' | 'failing' | 'error' | 'timeout'

export interface ResultSummary {
  status: SummaryStatus
  required: TestOutcome[]
  bonus: TestOutcome[]
  passedRequired: number
  passedBonus: number
  /** Bonus tests are revealed only after every required test passes. */
  bonusUnlocked: boolean
  /** The reason the code could not run (error and timeout only). */
  message?: string
}

/** "ranks_120_above_95" style names (Python) become readable; other names are unchanged. */
export function displayTestName(name: string): string {
  return name.replace(/^test_(bonus_)?/, '').replaceAll('_', ' ')
}

export function summarize(result: RunResult): ResultSummary {
  const required = result.tests.filter((test) => !test.bonus)
  const bonus = result.tests.filter((test) => test.bonus)
  const passedRequired = required.filter((test) => test.passed).length
  const passedBonus = bonus.filter((test) => test.passed).length
  const base = { required, bonus, passedRequired, passedBonus }

  if (result.timedOut) {
    return { ...base, status: 'timeout', bonusUnlocked: false, message: result.error }
  }
  if (result.error || required.length === 0) {
    return {
      ...base,
      status: 'error',
      bonusUnlocked: false,
      message: result.error ?? 'No tests ran. Did the code define what the tests expect?',
    }
  }
  const solved = passedRequired === required.length
  return { ...base, status: solved ? 'solved' : 'failing', bonusUnlocked: solved }
}

/** One short line that describes the run. */
export function headline(summary: ResultSummary): string {
  switch (summary.status) {
    case 'timeout':
      return 'Your code took too long, so we stopped it'
    case 'error':
      return 'Your code could not run'
    default:
      return `${summary.passedRequired} of ${summary.required.length} required tests passing`
  }
}
