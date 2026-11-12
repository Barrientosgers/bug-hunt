import { describe, expect, it } from 'vitest'
import {
  NOT_STARTED_MS,
  SLOW_MS,
  STALLED_RUNS_LIMIT,
  analyzeRuns,
  nudgeMessage,
  stuckReason,
  type RunPoint,
  type StuckInput,
} from './stuck.ts'

const runs = (...passed: number[]): RunPoint[] =>
  passed.map((count, index) => ({ passed: count, atMs: (index + 1) * 1000 }))

const base: StuckInput = {
  history: [],
  engagedRunIndex: 0,
  engagedMs: 0,
  nowMs: 0,
  solved: false,
  unlocked: true,
}

describe('analyzeRuns', () => {
  it('counts runs that do not beat the best so far, and resets on progress', () => {
    expect(analyzeRuns(runs(1, 1, 1)).stalled).toBe(2) // the first run is the baseline
    expect(analyzeRuns(runs(1, 1, 2)).stalled).toBe(0) // progress resets
    expect(analyzeRuns(runs(2, 1, 1, 0)).stalled).toBe(3)
  })

  it('does not treat a worse run as progress (exploring is allowed)', () => {
    expect(analyzeRuns(runs(2, 0, 1)).stalled).toBe(2)
  })

  it('remembers when progress last happened', () => {
    expect(analyzeRuns(runs(1, 2, 2, 2)).lastProgressMs).toBe(2000)
  })

  it('ignores stalled runs from before the player last engaged with Priya', () => {
    expect(analyzeRuns(runs(1, 1, 1, 1), 4).stalled).toBe(0)
    expect(analyzeRuns(runs(1, 1, 1, 1, 1), 4).stalled).toBe(1)
  })
})

describe('stuckReason', () => {
  it('offers help after repeated runs without progress', () => {
    const history = runs(1, ...Array(STALLED_RUNS_LIMIT).fill(1))
    expect(stuckReason({ ...base, history, nowMs: 5000 })).toBe('failed-runs')
  })

  it('stays quiet when the player is making progress', () => {
    expect(stuckReason({ ...base, history: runs(0, 1, 2, 3), nowMs: 5000 })).toBeNull()
  })

  it('suggests running the tests if nothing has been run for a while', () => {
    expect(stuckReason({ ...base, nowMs: NOT_STARTED_MS - 1 })).toBeNull()
    expect(stuckReason({ ...base, nowMs: NOT_STARTED_MS })).toBe('not-started')
  })

  it('offers help after a long time without progress', () => {
    const history = runs(1, 2) // last progress at 2000 ms
    expect(stuckReason({ ...base, history, nowMs: 2000 + SLOW_MS - 1 })).toBeNull()
    expect(stuckReason({ ...base, history, nowMs: 2000 + SLOW_MS })).toBe('slow')
  })

  it('waits for a full new period after the player engages with Priya', () => {
    const history = runs(1, 1, 1, 1)
    const engaged = { ...base, history, engagedRunIndex: 4, engagedMs: 10_000 }
    expect(stuckReason({ ...engaged, nowMs: 10_000 + SLOW_MS - 1 })).toBeNull()
    expect(stuckReason({ ...engaged, nowMs: 10_000 + SLOW_MS })).toBe('slow')
  })

  it('never speaks when solved or while the editor is locked', () => {
    const history = runs(1, 1, 1, 1)
    expect(stuckReason({ ...base, history, solved: true })).toBeNull()
    expect(stuckReason({ ...base, history, unlocked: false })).toBeNull()
  })
})

describe('nudgeMessage', () => {
  it('offers a hint when one is left, mentioning the cost', () => {
    const message = nudgeMessage('failed-runs', 2)
    expect(message.offersHint).toBe(true)
    expect(message.text).toMatch(/2 XP/)
  })

  it('suggests running the tests, without a hint, when nothing has been run', () => {
    expect(nudgeMessage('not-started', 1).offersHint).toBe(false)
  })

  it('does not offer a hint when all hints are used', () => {
    expect(nudgeMessage('slow', null).offersHint).toBe(false)
  })

  it('never blames the player', () => {
    for (const reason of ['failed-runs', 'slow', 'not-started'] as const) {
      expect(nudgeMessage(reason, 1).text).not.toMatch(/\b(wrong|fail|stupid|bad)\b/i)
    }
  })
})
