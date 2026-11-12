export type Theme = 'dark' | 'light'

export const THEME_KEY = 'bughunt.theme'

type StorageGetter = () => Pick<Storage, 'getItem' | 'setItem'>

const isTheme = (value: unknown): value is Theme => value === 'dark' || value === 'light'

/**
 * localStorage can throw (private windows, blocked site data) or be missing, so every
 * access is wrapped in try/catch and the app works fine without it.
 */
export function readStoredTheme(getStorage: StorageGetter = () => window.localStorage) {
  try {
    const value = getStorage().getItem(THEME_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

export function saveTheme(
  theme: Theme,
  getStorage: StorageGetter = () => window.localStorage,
): void {
  try {
    getStorage().setItem(THEME_KEY, theme)
  } catch {
    // Not being able to remember the choice is fine.
  }
}

/** A saved choice wins. Otherwise follow the system, and default to dark. */
export function resolveTheme(stored: Theme | null, systemPrefersLight: boolean): Theme {
  if (stored) return stored
  return systemPrefersLight ? 'light' : 'dark'
}
