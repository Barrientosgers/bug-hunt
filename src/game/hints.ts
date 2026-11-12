import type { Language } from '../content/types.ts'
import { readItem, writeItem, type StorageGetter } from '../storage/safeStorage.ts'

/** XP each hint costs. Solving still counts; hints are for learning. */
export const HINT_COST = 2

/** The ladder teaches debugging METHODS first and the answer last. */
export const HINT_TITLES = [
  'Read the failing test',
  'Inspect the data',
  'Understand the concept',
  'Full explanation',
] as const

export const HINT_COUNT = HINT_TITLES.length

/** The next level to reveal (1 to 4), or null when every hint has been used. */
export function nextHintLevel(used: number): number | null {
  return used >= HINT_COUNT ? null : used + 1
}

/** The last level nearly gives the answer, so we ask first. */
export function needsConfirmation(level: number): boolean {
  return level === HINT_COUNT
}

export function hintTitle(level: number): string {
  return HINT_TITLES[level - 1] ?? ''
}

export function hintsKey(challengeId: string, language: Language): string {
  return `bughunt.hints.${challengeId}.${language}`
}

export function readHintsUsed(
  challengeId: string,
  language: Language,
  getStorage?: StorageGetter,
): number {
  const value = Number(readItem(hintsKey(challengeId, language), getStorage))
  return Number.isInteger(value) ? Math.min(Math.max(value, 0), HINT_COUNT) : 0
}

export function saveHintsUsed(
  challengeId: string,
  language: Language,
  used: number,
  getStorage?: StorageGetter,
): void {
  writeItem(hintsKey(challengeId, language), String(used), getStorage)
}
