import { describe, expect, it } from 'vitest'
import {
  JOURNAL_NONE,
  isUnlocked,
  loadJournal,
  parseJournal,
  saveJournal,
  serializeJournal,
  skipJournal,
  validateJournal,
  writeEntry,
} from './journal.ts'

describe('validateJournal', () => {
  it('accepts a real hypothesis', () => {
    expect(
      validateJournal('the sort function', 'it compares strings, not numbers'),
    ).toEqual({})
  })

  it('asks for more when fields are too short, ignoring surrounding spaces', () => {
    const errors = validateJournal('  a ', 'because   ')
    expect(errors.where).toBeDefined()
    expect(errors.because).toBeDefined()
  })
})

describe('writeEntry', () => {
  it('earns the "before first run" flag only if no test was run yet', () => {
    const early = writeEntry(JOURNAL_NONE, ' sort ', ' strings compare badly ', 0, 1)
    const late = writeEntry(JOURNAL_NONE, 'sort', 'strings compare badly', 2, 1)
    expect(early).toMatchObject({ entry: { where: 'sort', beforeFirstRun: true } })
    expect(late).toMatchObject({ entry: { beforeFirstRun: false } })
  })

  it('keeps the original flag when the hypothesis is edited later', () => {
    const first = writeEntry(JOURNAL_NONE, 'sort', 'strings compare badly', 0, 1)
    const edited = writeEntry(first, 'sort call', 'strings compare char by char', 5, 2)
    expect(edited).toMatchObject({ entry: { where: 'sort call', beforeFirstRun: true } })
    const lateFirst = writeEntry(JOURNAL_NONE, 'sort', 'strings compare badly', 3, 1)
    const lateEdited = writeEntry(lateFirst, 'sort', 'strings compare badly!!', 0, 2)
    expect(lateEdited).toMatchObject({ entry: { beforeFirstRun: false } })
  })
})

describe('locking and skipping', () => {
  it('is locked only while there is no journal and no skip', () => {
    expect(isUnlocked(JOURNAL_NONE)).toBe(false)
    expect(isUnlocked(skipJournal(JOURNAL_NONE))).toBe(true)
    expect(
      isUnlocked(writeEntry(JOURNAL_NONE, 'sort', 'strings compare badly', 0, 1)),
    ).toBe(true)
  })

  it('never downgrades a written journal to skipped', () => {
    const written = writeEntry(JOURNAL_NONE, 'sort', 'strings compare badly', 0, 1)
    expect(skipJournal(written)).toBe(written)
  })
})

describe('storage', () => {
  const memory = () => {
    const data: Record<string, string> = {}
    return () => ({
      getItem: (key: string) => data[key] ?? null,
      setItem: (key: string, value: string) => {
        data[key] = value
      },
      removeItem: (key: string) => {
        delete data[key]
      },
    })
  }

  it('round-trips a written journal and a skip', () => {
    const storage = memory()
    const written = writeEntry(JOURNAL_NONE, 'sort', 'strings compare badly', 0, 7)
    saveJournal('a', written, storage)
    saveJournal('b', { status: 'skipped' }, storage)
    expect(loadJournal('a', storage)).toEqual(written)
    expect(loadJournal('b', storage)).toEqual({ status: 'skipped' })
    expect(loadJournal('c', storage)).toEqual(JOURNAL_NONE)
  })

  it('treats corrupted data as "no journal yet"', () => {
    expect(parseJournal('not json')).toEqual(JOURNAL_NONE)
    expect(parseJournal('{"status":"written","where":1}')).toEqual(JOURNAL_NONE)
    expect(parseJournal(null)).toEqual(JOURNAL_NONE)
    expect(parseJournal(serializeJournal({ status: 'skipped' }))).toEqual({
      status: 'skipped',
    })
  })
})
