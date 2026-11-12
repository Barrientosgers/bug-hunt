import { useCallback, useState } from 'react'
import type { Language } from '../content/types.ts'
import { nextHintLevel, readHintsUsed, saveHintsUsed } from './hints.ts'

interface Stored {
  key: string
  used: number
}

/** How many hints the player has revealed for one challenge and language. */
export function useHints(challengeId: string, language: Language) {
  const key = `${challengeId}:${language}`
  const [stored, setStored] = useState<Stored>(() => ({
    key,
    used: readHintsUsed(challengeId, language),
  }))
  // After a language switch, read the count for the new language until the next reveal.
  const used = stored.key === key ? stored.used : readHintsUsed(challengeId, language)

  const reveal = useCallback(() => {
    const level = nextHintLevel(used)
    if (level === null) return
    saveHintsUsed(challengeId, language, level)
    setStored({ key, used: level })
  }, [challengeId, language, key, used])

  return { used, nextLevel: nextHintLevel(used), reveal }
}
