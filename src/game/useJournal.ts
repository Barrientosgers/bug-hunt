import { useCallback, useState } from 'react'
import {
  isUnlocked,
  loadJournal,
  saveJournal,
  skipJournal,
  writeEntry,
  type JournalState,
} from './journal.ts'

/** The player's debug journal for one challenge, saved as they go. */
export function useJournal(challengeId: string, runsSoFar: number) {
  const [state, setState] = useState<JournalState>(() => loadJournal(challengeId))

  const update = useCallback(
    (next: (previous: JournalState) => JournalState) => {
      const value = next(state)
      saveJournal(challengeId, value)
      setState(value)
    },
    [challengeId, state],
  )

  const save = useCallback(
    (where: string, because: string) =>
      update((previous) => writeEntry(previous, where, because, runsSoFar, Date.now())),
    [update, runsSoFar],
  )
  const skip = useCallback(() => update(skipJournal), [update])

  return { state, unlocked: isUnlocked(state), save, skip }
}
