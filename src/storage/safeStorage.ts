export type StorageGetter = () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

// `globalThis` (not `window`) so this file also type-checks where there is no browser,
// e.g. when the Node-side tests import code that uses it. A missing localStorage throws
// here and is handled like blocked storage by the helpers below.
const browserStorage: StorageGetter = () => {
  const storage = (globalThis as { localStorage?: Storage }).localStorage
  if (!storage) throw new Error('localStorage is not available')
  return storage
}

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
