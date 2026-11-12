import { describe, expect, it } from 'vitest'
import type { Challenge } from '../content/types.ts'
import type { JournalState } from '../game/journal.ts'
import type { ResultSummary } from '../game/results.ts'
import { buildReview, matchHypothesis, type ReviewInput } from './review.ts'

const challenge = {
  id: 'x',
  bonusTests: 'bonus text',
  lesson: 'the lesson',
  howToPrevent: 'prevent text',
  whereItShowsUpAtWork: 'work text',
  hypothesis: {
    where: ['sort'],
    why: ['string'],
    good: 'good feedback',
    partial: 'partial feedback',
    miss: 'miss feedback',
    skipped: 'skipped feedback',
  },
  languages: {
    js: {
      minimalChange: { maxLines: 2 },
      reviewRules: [
        {
          id: 'fix',
          kind: 'root-cause',
          pattern: 'Number\\(',
          matches: true,
          feedback: 'root ok',
        },
        {
          id: 'sym',
          kind: 'symptom',
          pattern: 'Number\\(',
          matches: false,
          feedback: 'symptom!',
        },
        {
          id: 'copy',
          kind: 'bonus',
          pattern: 'slice',
          matches: true,
          feedback: 'bonus found',
        },
        {
          id: 'tip',
          kind: 'tip',
          pattern: 'slice',
          matches: false,
          feedback: 'bonus tip',
        },
      ],
    },
  },
} as unknown as Challenge

const summary = {} as ResultSummary
const written = (
  beforeFirstRun: boolean,
  where = 'the sort',
  because = 'strings',
): JournalState => ({
  status: 'written',
  entry: { where, because, savedAt: 1, beforeFirstRun },
})

function input(overrides: Partial<ReviewInput> = {}): ReviewInput {
  return {
    challenge,
    language: 'js',
    starterCode: 'sort(a)\nreturn a',
    finalCode: 'sort(Number(a).slice())\nreturn a',
    summary,
    journal: written(true),
    hintsUsed: 0,
    runs: 2,
    ...overrides,
  }
}

const section = (review: ReturnType<typeof buildReview>, id: string) =>
  review.sections.find((s) => s.id === id)!

describe('matchHypothesis', () => {
  const keywords = { where: ['sort'], why: ['string'] }
  it('is good when both where and why are mentioned', () => {
    expect(
      matchHypothesis({ where: 'The SORT', because: 'it uses strings' }, keywords),
    ).toBe('good')
  })
  it('is partial when only one is mentioned', () => {
    expect(matchHypothesis({ where: 'the sort', because: 'no idea' }, keywords)).toBe(
      'partial',
    )
  })
  it('is a miss when neither is mentioned', () => {
    expect(matchHypothesis({ where: 'render', because: 'css' }, keywords)).toBe('miss')
  })
})

describe('buildReview', () => {
  it('praises a root-cause, minimal, bonus-finding fix', () => {
    const review = buildReview(input())
    expect(section(review, 'root-cause')).toMatchObject({
      verdict: 'strong',
      paragraphs: ['root ok'],
    })
    expect(section(review, 'minimal-change').verdict).toBe('strong')
    expect(section(review, 'bonus')).toMatchObject({
      verdict: 'strong',
      paragraphs: ['bonus found'],
    })
    expect(review.lesson).toBe('the lesson')
  })

  it('points at the symptom when the root cause was not fixed', () => {
    const review = buildReview(input({ finalCode: 'hack(a)\nreturn a' }))
    expect(section(review, 'root-cause')).toMatchObject({
      verdict: 'note',
      paragraphs: ['symptom!'],
    })
  })

  it('gives a tip when the bonus was not found', () => {
    const review = buildReview(input({ finalCode: 'sort(Number(a))\nreturn a' }))
    expect(section(review, 'bonus')).toMatchObject({
      verdict: 'note',
      paragraphs: ['bonus tip'],
    })
  })

  it('suggests a smaller change after a big rewrite, without blaming', () => {
    const review = buildReview(input({ finalCode: 'a\nb\nc\nd\nNumber(' }))
    const minimal = section(review, 'minimal-change')
    expect(minimal.verdict).toBe('note')
    expect(minimal.paragraphs[0]).toMatch(/smallest change/)
  })

  it('gives hypothesis feedback for good, partial, miss and skipped', () => {
    const text = (journal: JournalState) =>
      section(buildReview(input({ journal })), 'hypothesis').paragraphs.at(-1)
    expect(text(written(true, 'the sort', 'strings'))).toBe('good feedback')
    expect(text(written(true, 'the sort', 'dunno'))).toBe('partial feedback')
    expect(text(written(true, 'render', 'css'))).toBe('miss feedback')
    expect(text({ status: 'skipped' })).toBe('skipped feedback')
    expect(text({ status: 'none' })).toBe('skipped feedback')
  })

  it('praises process: journal first, no hints, few runs', () => {
    const notes = section(buildReview(input()), 'process').paragraphs.join(' ')
    expect(notes).toMatch(/before running anything/)
    expect(notes).toMatch(/without any hints/)
    expect(notes).toMatch(/2 runs/)
  })

  it('treats hints and many runs as normal, never as failure', () => {
    const notes = section(
      buildReview(input({ hintsUsed: 3, runs: 7 })),
      'process',
    ).paragraphs.join(' ')
    expect(notes).toMatch(/3 hints/)
    expect(notes).toMatch(/not a weakness/)
    expect(notes).toMatch(/7 runs, and that is normal/)
  })

  it('includes prevention advice and where it shows up at work', () => {
    const review = buildReview(input())
    expect(section(review, 'prevent').paragraphs).toEqual(['prevent text'])
    expect(section(review, 'work').paragraphs).toEqual(['work text'])
  })
})
