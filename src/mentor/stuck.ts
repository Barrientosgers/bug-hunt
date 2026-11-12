import { HINT_COST } from '../game/hints.ts'

/** Runs in a row that fail to improve on the best result before Priya offers help. */
export const STALLED_RUNS_LIMIT = 3
/** Active time without progress, once the player has run the tests at least once. */
export const SLOW_MS = 5 * 60 * 1000
/** Active time after the journal step without ever running the tests. */
export const NOT_STARTED_MS = 3 * 60 * 1000

export type StuckReason = 'failed-runs' | 'slow' | 'not-started'

/** One test run: how many required tests passed, and when it happened (timer milliseconds). */
export interface RunPoint {
  passed: number
  atMs: number
}

/**
 * "Progress" means beating the best result so far. A run that passes fewer tests than an
 * earlier run is not punished, it just is not progress. `engagedRunIndex` is where the
 * player last engaged with Priya (dismissed an offer or took a hint): earlier stalled runs
 * no longer count.
 */
export function analyzeRuns(history: RunPoint[], engagedRunIndex = 0) {
  let best = -1
  let stalled = 0
  let lastProgressMs = 0
  history.forEach((run, index) => {
    if (run.passed > best) {
      best = run.passed
      stalled = 0
      lastProgressMs = run.atMs
    } else if (index >= engagedRunIndex) {
      stalled += 1
    }
  })
  return { stalled, lastProgressMs }
}

export interface StuckInput {
  history: RunPoint[]
  engagedRunIndex: number
  /** Timer time of the last engagement, or when the page opened. */
  engagedMs: number
  nowMs: number
  solved: boolean
  /** False while the editor is still locked behind the journal. */
  unlocked: boolean
}

/** Why Priya should speak right now, or null if she should stay quiet. */
export function stuckReason(input: StuckInput): StuckReason | null {
  if (!input.unlocked || input.solved) return null

  const { stalled, lastProgressMs } = analyzeRuns(input.history, input.engagedRunIndex)
  if (stalled >= STALLED_RUNS_LIMIT) return 'failed-runs'

  const quietSince = Math.max(input.engagedMs, lastProgressMs)
  const quietFor = input.nowMs - quietSince
  if (input.history.length === 0) return quietFor >= NOT_STARTED_MS ? 'not-started' : null
  return quietFor >= SLOW_MS ? 'slow' : null
}

export interface NudgeMessage {
  text: string
  /** Whether to offer the next hint (needs a hint left, and not the "run the tests" nudge). */
  offersHint: boolean
}

/** Priya's words. Warm, short, and never about the player being slow or wrong. */
export function nudgeMessage(
  reason: StuckReason,
  nextHintLevel: number | null,
): NudgeMessage {
  if (reason === 'not-started') {
    return {
      text: 'Not sure where to start? Press Run tests once. The failing tests are your map: they tell you exactly what the code should do.',
      offersHint: false,
    }
  }
  if (nextHintLevel === null) {
    return {
      text: 'You have used every hint, so let us do it the old-fashioned way. Re-read the last hint slowly, then try changing one thing at a time. A five-minute break also works wonders: fresh eyes find bugs fast.',
      offersHint: false,
    }
  }
  const text =
    reason === 'failed-runs'
      ? `A few runs without the tests budging is completely normal. Debugging often looks like this. Want a nudge? (A hint costs ${HINT_COST} XP, and solving still counts.)`
      : `You have been at this a while. That is persistence, not failure. Want a small nudge? (A hint costs ${HINT_COST} XP, and solving still counts.)`
  return { text, offersHint: true }
}
