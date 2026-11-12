import { readItem, writeItem, type StorageGetter } from '../storage/safeStorage.ts'

export type Theme = 'dark' | 'light'

export const THEME_KEY = 'bughunt.theme'

const isTheme = (value: unknown): value is Theme => value === 'dark' || value === 'light'

export function readStoredTheme(getStorage?: StorageGetter): Theme | null {
  const value = readItem(THEME_KEY, getStorage)
  return isTheme(value) ? value : null
}

export function saveTheme(theme: Theme, getStorage?: StorageGetter): void {
  writeItem(THEME_KEY, theme, getStorage)
}

/** A saved choice wins. Otherwise follow the system, and default to dark. */
export function resolveTheme(stored: Theme | null, systemPrefersLight: boolean): Theme {
  if (stored) return stored
  return systemPrefersLight ? 'light' : 'dark'
}
