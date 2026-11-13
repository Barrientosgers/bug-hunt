import { useCallback, useRef, useState } from 'react'
import { addSolve, loadProgress, markBonusFound, saveProgress } from './store.ts'
import type { ProgressData, Solve } from './types.ts'

/** The player's saved progress. Every change is saved straight away. */
export function useProgress() {
  const [data, setData] = useState<ProgressData>(() => loadProgress())
  // The latest data, so two quick changes in a row never overwrite each other.
  const latest = useRef(data)

  const commit = useCallback((next: ProgressData) => {
    if (next === latest.current) return
    latest.current = next
    saveProgress(next)
    setData(next)
  }, [])

  const recordSolve = useCallback(
    (solve: Solve) => commit(addSolve(latest.current, solve)),
    [commit],
  )
  const recordBonus = useCallback(
    (challengeId: string, language: string, code: string) =>
      commit(markBonusFound(latest.current, challengeId, language, code)),
    [commit],
  )

  return { data, recordSolve, recordBonus }
}
