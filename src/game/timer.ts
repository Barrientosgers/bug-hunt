import { readItem, writeItem, type StorageGetter } from '../storage/safeStorage.ts'

/** The clock ticks about once a second; a bigger gap means the computer slept, so ignore it. */
export const MAX_GAP_MS = 5000

export interface TimerState {
  elapsedMs: number
  /** When we last counted, or null if the clock was paused. */
  lastTickMs: number | null
}

/**
 * Moves the clock forward. Time only counts while `counting` is true (journal done, not
 * solved yet, tab visible). When it is false the clock pauses and forgets its last tick, so
 * no paused time is ever added later.
 */
export function advance(state: TimerState, nowMs: number, counting: boolean): TimerState {
  const gap =
    state.lastTickMs === null ? 0 : Math.min(nowMs - state.lastTickMs, MAX_GAP_MS)
  return {
    elapsedMs: counting ? state.elapsedMs + Math.max(gap, 0) : state.elapsedMs,
    lastTickMs: counting ? nowMs : null,
  }
}

/** 04:12, or 1:04:12 once it passes an hour. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.max(ms, 0) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`
}

export const timerKey = (challengeId: string, language: string) =>
  `bughunt.timer.${challengeId}.${language}`
const doneKey = (key: string) => `${key}.done`
export const TIMER_HIDDEN_KEY = 'bughunt.timerHidden'

export function readElapsed(key: string, getStorage?: StorageGetter): number {
  const value = Number(readItem(key, getStorage))
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function saveElapsed(
  key: string,
  elapsedMs: number,
  getStorage?: StorageGetter,
): void {
  writeItem(key, String(Math.round(elapsedMs)), getStorage)
}

/** Once solved, the clock stays frozen, even after a refresh. */
export function readDone(key: string, getStorage?: StorageGetter): boolean {
  return readItem(doneKey(key), getStorage) === '1'
}

export function saveDone(key: string, getStorage?: StorageGetter): void {
  writeItem(doneKey(key), '1', getStorage)
}
