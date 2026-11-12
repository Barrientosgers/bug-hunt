import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { LANGUAGES } from '../src/content/types.ts'
import { parseChallenge } from '../src/content/validate.ts'
import { buildReview } from '../src/mentor/review.ts'
import type { ResultSummary } from '../src/game/results.ts'

const dir = path.resolve('content/challenges/001-leaderboard')
const challenge = parseChallenge(
  JSON.parse(fs.readFileSync(path.join(dir, 'challenge.json'), 'utf8')),
)
const read = (file: string) => fs.readFileSync(path.join(dir, file), 'utf8')

describe('review of the real leaderboard challenge', () => {
  for (const language of LANGUAGES) {
    const version = challenge.languages[language]!
    const buggy = read(version.buggy)
    const solution = read(version.solution)
    const base = {
      challenge,
      language,
      starterCode: buggy,
      summary: {} as ResultSummary,
      journal: { status: 'skipped' } as const,
      hintsUsed: 0,
      runs: 1,
    }
    const find = (review: ReturnType<typeof buildReview>, id: string) =>
      review.sections.find((section) => section.id === id)!

    it(`${language}: the reference solution earns a strong review`, () => {
      const review = buildReview({ ...base, finalCode: solution })
      expect(find(review, 'root-cause').verdict).toBe('strong')
      expect(find(review, 'minimal-change').verdict).toBe('strong')
      expect(find(review, 'bonus').verdict).toBe('strong')
    })

    it(`${language}: the buggy code is flagged as not fixing the root cause`, () => {
      const review = buildReview({ ...base, finalCode: buggy })
      expect(find(review, 'root-cause').verdict).toBe('note')
      expect(find(review, 'bonus').verdict).toBe('note')
    })
  }
})
