import { useCallback, useRef, useState } from 'react'
import { getCodeRunner } from '../runners/run-code.ts'
import type { Language } from '../content/types.ts'
import type { RunResult } from '../runners/types.ts'
import { summarize } from './results.ts'

/** One finished run, kept so the mentor can tell whether the player is making progress. */
export interface RunRecord {
  key: string
  /** Required tests that passed. */
  passed: number
  /** Timer time (ms) when the player pressed Run. */
  atMs: number
}

interface LastRun {
  /** Which challenge and language this result belongs to. */
  key: string
  /** The exact code that was run, so we can tell when the player has edited it since. */
  ranCode: string
  result: RunResult
}

/** What a finished run means for progress. */
export interface RunOutcome {
  /** All required tests passed. */
  solved: boolean
  /** Every bonus test passed too (there is at least one). Only true when solved. */
  bonusFound: boolean
  /** How many required tests there are (all of them passed when `solved`). */
  totalRequired: number
  /** How many test runs it has taken for this challenge and language, including this one. */
  runNumber: number
}

/** Runs the player's code against the tests and remembers the last result. */
export function useRunTests() {
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<LastRun | null>(null)
  const [counts, setCounts] = useState({ runs: 0, failedRuns: 0 })
  const [history, setHistory] = useState<RunRecord[]>([])
  const historyRef = useRef<RunRecord[]>([])
  const busy = useRef(false)

  const run = useCallback(
    async (
      key: string,
      language: Language,
      code: string,
      tests: string,
      atMs: number,
    ): Promise<RunOutcome | null> => {
      if (busy.current) return null
      busy.current = true
      setRunning(true)
      try {
        const result = await getCodeRunner().run(language, code, tests)
        const summary = summarize(result)
        const solved = summary.status === 'solved'
        const record = { key, passed: summary.passedRequired, atMs }
        historyRef.current = [...historyRef.current, record]
        setHistory(historyRef.current)
        setLastRun({ key, ranCode: code, result })
        setCounts((previous) => ({
          runs: previous.runs + 1,
          failedRuns: previous.failedRuns + (solved ? 0 : 1),
        }))
        return {
          solved,
          bonusFound:
            solved &&
            summary.bonus.length > 0 &&
            summary.passedBonus === summary.bonus.length,
          totalRequired: summary.required.length,
          runNumber: historyRef.current.filter((entry) => entry.key === key).length,
        }
      } finally {
        busy.current = false
        setRunning(false)
      }
    },
    [],
  )

  return { running, lastRun, history, ...counts, run }
}
