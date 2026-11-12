import { readItem, writeItem, type StorageGetter } from '../storage/safeStorage.ts'

export const MIN_WHERE = 3
export const MIN_BECAUSE = 10

export interface JournalEntry {
  where: string
  because: string
  savedAt: number
  /** True if the hypothesis was first saved before the player's first test run (earns the bonus). */
  beforeFirstRun: boolean
}

export type JournalState =
  { status: 'none' } | { status: 'skipped' } | { status: 'written'; entry: JournalEntry }

export const JOURNAL_NONE: JournalState = { status: 'none' }

export interface JournalErrors {
  where?: string
  because?: string
}

export function validateJournal(where: string, because: string): JournalErrors {
  const errors: JournalErrors = {}
  if (where.trim().length < MIN_WHERE) {
    errors.where = `Say where you think the bug is (at least ${MIN_WHERE} characters).`
  }
  if (because.trim().length < MIN_BECAUSE) {
    errors.because = `Say why, in a few words (at least ${MIN_BECAUSE} characters).`
  }
  return errors
}

/** The editor and Run button unlock once the player has written a hypothesis or skipped. */
export function isUnlocked(state: JournalState): boolean {
  return state.status !== 'none'
}

/**
 * Saves a hypothesis. Editing an existing one keeps its original `beforeFirstRun` flag,
 * so changing your mind after seeing test results can never earn the bonus.
 */
export function writeEntry(
  previous: JournalState,
  where: string,
  because: string,
  runsSoFar: number,
  now: number,
): JournalState {
  const beforeFirstRun =
    previous.status === 'written' ? previous.entry.beforeFirstRun : runsSoFar === 0
  return {
    status: 'written',
    entry: { where: where.trim(), because: because.trim(), savedAt: now, beforeFirstRun },
  }
}

export function skipJournal(previous: JournalState): JournalState {
  return previous.status === 'none' ? { status: 'skipped' } : previous
}

/** Reads stored JSON defensively: anything unexpected becomes "no journal yet". */
export function parseJournal(raw: string | null): JournalState {
  if (!raw) return JOURNAL_NONE
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return JOURNAL_NONE
    const value = data as Record<string, unknown>
    if (value.status === 'skipped') return { status: 'skipped' }
    if (
      value.status === 'written' &&
      typeof value.where === 'string' &&
      typeof value.because === 'string' &&
      typeof value.savedAt === 'number' &&
      typeof value.beforeFirstRun === 'boolean'
    ) {
      return {
        status: 'written',
        entry: {
          where: value.where,
          because: value.because,
          savedAt: value.savedAt,
          beforeFirstRun: value.beforeFirstRun,
        },
      }
    }
  } catch {
    // fall through
  }
  return JOURNAL_NONE
}

export function serializeJournal(state: JournalState): string {
  return JSON.stringify(
    state.status === 'written' ? { status: 'written', ...state.entry } : state,
  )
}

const journalKey = (challengeId: string) => `bughunt.journal.${challengeId}`

export function loadJournal(
  challengeId: string,
  getStorage?: StorageGetter,
): JournalState {
  return parseJournal(readItem(journalKey(challengeId), getStorage))
}

export function saveJournal(
  challengeId: string,
  state: JournalState,
  getStorage?: StorageGetter,
): void {
  writeItem(journalKey(challengeId), serializeJournal(state), getStorage)
}
