import { useEffect, useState } from 'react'
import { loadStarterFiles, type StarterFiles } from '../content/loader.ts'
import type { Challenge, Language } from '../content/types.ts'

type ChallengeFiles =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; files: StarterFiles }

interface Loaded {
  key: string
  files?: StarterFiles
  message?: string
}

/** Loads the starter code and tests for a challenge in one language. */
export function useChallengeFiles(
  challenge: Challenge,
  language: Language,
): ChallengeFiles {
  const key = `${challenge.id}:${language}`
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    let cancelled = false
    loadStarterFiles(challenge, language)
      .then((files) => {
        if (!cancelled) setLoaded({ key, files })
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoaded({ key, message: String(error) })
      })
    return () => {
      cancelled = true
    }
  }, [challenge, language, key])

  // Results for an older challenge/language count as "still loading".
  if (loaded?.key !== key) return { status: 'loading' }
  if (loaded.files) return { status: 'ready', files: loaded.files }
  return { status: 'error', message: loaded.message ?? 'Unknown error' }
}
