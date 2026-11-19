import { readItem, writeItem, type StorageGetter } from '../storage/safeStorage.ts'

export const INTRO_KEY = 'bughunt.introDismissed'

/** The welcome banner is for brand-new players only: no solves yet, and not dismissed. */
export function shouldShowIntro(solvedCount: number, dismissed: boolean): boolean {
  return solvedCount === 0 && !dismissed
}

export function readIntroDismissed(getStorage?: StorageGetter): boolean {
  return readItem(INTRO_KEY, getStorage) === 'yes'
}

export function saveIntroDismissed(getStorage?: StorageGetter): void {
  writeItem(INTRO_KEY, 'yes', getStorage)
}
