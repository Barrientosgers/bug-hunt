import type { Language } from '../content/types.ts'
import {
  readItem,
  removeItem,
  writeItem,
  type StorageGetter,
} from '../storage/safeStorage.ts'

export function codeKey(challengeId: string, language: Language): string {
  return `bughunt.code.${challengeId}.${language}`
}

export function readSavedCode(
  challengeId: string,
  language: Language,
  getStorage?: StorageGetter,
): string | null {
  return readItem(codeKey(challengeId, language), getStorage)
}

export function saveCode(
  challengeId: string,
  language: Language,
  code: string,
  getStorage?: StorageGetter,
): void {
  writeItem(codeKey(challengeId, language), code, getStorage)
}

export function clearSavedCode(
  challengeId: string,
  language: Language,
  getStorage?: StorageGetter,
): void {
  removeItem(codeKey(challengeId, language), getStorage)
}

/**
 * Saving on every keystroke would hammer storage, so saves wait until typing pauses.
 * Each key has its own timer, so switching language never loses the other language's edit.
 */
export function createDebouncedSaver(
  save: (key: string, value: string) => void,
  delayMs: number,
) {
  const pending = new Map<
    string,
    { value: string; timer: ReturnType<typeof setTimeout> }
  >()

  return {
    schedule(key: string, value: string) {
      const existing = pending.get(key)
      if (existing) clearTimeout(existing.timer)
      const timer = setTimeout(() => {
        pending.delete(key)
        save(key, value)
      }, delayMs)
      pending.set(key, { value, timer })
    },
    /** Save everything that is waiting right now (used when the page closes). */
    flush() {
      for (const [key, { value, timer }] of pending) {
        clearTimeout(timer)
        save(key, value)
      }
      pending.clear()
    },
    /** Forget a waiting save without writing it (used by Reset). */
    cancel(key: string) {
      const existing = pending.get(key)
      if (existing) clearTimeout(existing.timer)
      pending.delete(key)
    },
  }
}
