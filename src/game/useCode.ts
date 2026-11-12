import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Language } from '../content/types.ts'
import { clearSavedCode, codeKey, createDebouncedSaver, readSavedCode } from './code.ts'
import { writeItem } from '../storage/safeStorage.ts'

/**
 * The player's code for one challenge and language. It starts from their saved edit
 * (if any), otherwise from the starter code, and is saved shortly after they stop typing.
 */
export function useCode(
  challengeId: string,
  language: Language,
  starter: string | undefined,
) {
  const key = codeKey(challengeId, language)
  // Edits made in this session, by key. Keeps edits when switching languages back and forth.
  const [edits, setEdits] = useState<Record<string, string>>({})
  const saved = useMemo(
    () => readSavedCode(challengeId, language),
    [challengeId, language],
  )
  const saver = useRef(createDebouncedSaver((k, value) => writeItem(k, value), 500))

  useEffect(() => {
    const current = saver.current
    const flush = () => current.flush()
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      current.flush()
    }
  }, [])

  const setCode = useCallback(
    (value: string) => {
      setEdits((previous) => ({ ...previous, [key]: value }))
      saver.current.schedule(key, value)
    },
    [key],
  )

  const reset = useCallback(() => {
    if (starter === undefined) return
    saver.current.cancel(key)
    clearSavedCode(challengeId, language)
    setEdits((previous) => ({ ...previous, [key]: starter }))
  }, [challengeId, language, key, starter])

  // Saved code is only trusted once the starter code has loaded.
  const code = starter === undefined ? undefined : (edits[key] ?? saved ?? starter)
  return { code, setCode, reset, isEdited: code !== undefined && code !== starter }
}
