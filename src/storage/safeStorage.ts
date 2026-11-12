export type StorageGetter = () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const browserStorage: StorageGetter = () => window.localStorage

/**
 * localStorage can throw (private windows, blocked site data) or be missing, so every
 * access goes through these helpers. The app must work fine without storage.
 */
export function readItem(
  key: string,
  getStorage: StorageGetter = browserStorage,
): string | null {
  try {
    return getStorage().getItem(key)
  } catch {
    return null
  }
}

export function writeItem(
  key: string,
  value: string,
  getStorage: StorageGetter = browserStorage,
): void {
  try {
    getStorage().setItem(key, value)
  } catch {
    // Not being able to remember something is fine.
  }
}

export function removeItem(
  key: string,
  getStorage: StorageGetter = browserStorage,
): void {
  try {
    getStorage().removeItem(key)
  } catch {
    // Ignore: nothing to clean up if storage is unavailable.
  }
}
