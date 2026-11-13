import { DIFFICULTIES, LANGUAGES, SKILLS } from '../content/types.ts'
import { readItem, writeItem, type StorageGetter } from '../storage/safeStorage.ts'
import type { ProgressData, Solve } from './types.ts'

export const PROGRESS_KEY = 'bughunt.progress'

export const emptyProgress = (): ProgressData => ({ version: 1, solves: [] })

const includes = (list: readonly unknown[], value: unknown) => list.includes(value)

function isSolve(value: unknown): value is Solve {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.challengeId === 'string' &&
    typeof s.number === 'number' &&
    includes(LANGUAGES, s.language) &&
    includes(DIFFICULTIES, s.difficulty) &&
    includes(SKILLS, s.skill) &&
    typeof s.solvedAt === 'number' &&
    typeof s.day === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.day) &&
    typeof s.runs === 'number' &&
    typeof s.hintsUsed === 'number' &&
    typeof s.elapsedMs === 'number' &&
    typeof s.journalBeforeFirstRun === 'boolean' &&
    typeof s.bonusFound === 'boolean' &&
    typeof s.flag === 'string' &&
    typeof s.finalCode === 'string' &&
    (s.trail === undefined ||
      (typeof s.trail === 'string' && /^[ryg]*$/.test(s.trail))) &&
    typeof s.isDaily === 'boolean'
  )
}

/**
 * Reads saved progress defensively. Anything unexpected (corrupted JSON, a different
 * version, a malformed solve) is dropped instead of crashing the app.
 */
export function parseProgress(raw: string | null): ProgressData {
  if (!raw) return emptyProgress()
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return emptyProgress()
    const record = data as Record<string, unknown>
    if (record.version !== 1 || !Array.isArray(record.solves)) return emptyProgress()
    return { version: 1, solves: record.solves.filter(isSolve) }
  } catch {
    return emptyProgress()
  }
}

export const loadProgress = (getStorage?: StorageGetter): ProgressData =>
  parseProgress(readItem(PROGRESS_KEY, getStorage))

export function saveProgress(data: ProgressData, getStorage?: StorageGetter): void {
  writeItem(PROGRESS_KEY, JSON.stringify(data), getStorage)
}

export const findSolve = (data: ProgressData, challengeId: string, language: string) =>
  data.solves.find((s) => s.challengeId === challengeId && s.language === language)

/** Adds a solve. Solving the same bug in the same language again changes nothing. */
export function addSolve(data: ProgressData, solve: Solve): ProgressData {
  if (findSolve(data, solve.challengeId, solve.language)) return data
  return { ...data, solves: [...data.solves, solve] }
}

/**
 * Records that the bonus was found, with the code that found it (so the code review can
 * reflect it). Does nothing if there is no solve yet or the bonus is already recorded.
 */
export function markBonusFound(
  data: ProgressData,
  challengeId: string,
  language: string,
  code: string,
): ProgressData {
  const existing = findSolve(data, challengeId, language)
  if (!existing || existing.bonusFound) return data
  return {
    ...data,
    solves: data.solves.map((solve) =>
      solve === existing ? { ...solve, bonusFound: true, finalCode: code } : solve,
    ),
  }
}

/** XP is awarded for the first language solved for each challenge. */
export function isFirstForChallenge(data: ProgressData, solve: Solve): boolean {
  return !data.solves.some(
    (other) =>
      other.challengeId === solve.challengeId &&
      other.language !== solve.language &&
      other.solvedAt < solve.solvedAt,
  )
}
