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

/** Runs the player's code against the tests and remembers the last result. */
export function useRunTests() {
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<LastRun | null>(null)
  const [counts, setCounts] = useState({ runs: 0, failedRuns: 0 })
  const [history, setHistory] = useState<RunRecord[]>([])
  const busy = useRef(false)

  const run = useCallback(
    async (
      key: string,
      language: Language,
      code: string,
      tests: string,
      atMs: number,
    ) => {
      if (busy.current) return
      busy.current = true
      setRunning(true)
      try {
        const result = await getCodeRunner().run(language, code, tests)
        const summary = summarize(result)
        const solved = summary.status === 'solved'
        setHistory((previous) => [
          ...previous,
          { key, passed: summary.passedRequired, atMs },
        ])
        setLastRun({ key, ranCode: code, result })
        setCounts((previous) => ({
          runs: previous.runs + 1,
          failedRuns: previous.failedRuns + (solved ? 0 : 1),
        }))
      } finally {
        busy.current = false
        setRunning(false)
      }
    },
    [],
  )

  return { running, lastRun, history, ...counts, run }
}
