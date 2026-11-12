import { LANGUAGES, type Language } from '../content/types.ts'
import { readItem, writeItem, type StorageGetter } from '../storage/safeStorage.ts'

export const LANGUAGE_KEY = 'bughunt.language'

const isLanguage = (value: unknown): value is Language =>
  (LANGUAGES as readonly unknown[]).includes(value)

/** The saved language if this challenge offers it, otherwise the first one it offers. */
export function pickLanguage(saved: string | null, available: Language[]): Language {
  return isLanguage(saved) && available.includes(saved) ? saved : available[0]
}

export function readSavedLanguage(getStorage?: StorageGetter): string | null {
  return readItem(LANGUAGE_KEY, getStorage)
}

export function saveLanguage(language: Language, getStorage?: StorageGetter): void {
  writeItem(LANGUAGE_KEY, language, getStorage)
}
