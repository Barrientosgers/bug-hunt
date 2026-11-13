import { describe, expect, it } from 'vitest'
import {
  SITE_URL,
  buildShareText,
  trailEmoji,
  trailFrom,
  type ShareInput,
} from './share.ts'

describe('trailFrom', () => {
  it('marks no-progress runs red, progress yellow and the solving run green', () => {
    expect(trailFrom([1, 1, 3], 3)).toBe('yrg')
    expect(trailFrom([0, 1, 1, 2, 4], 4)).toBe('ryryg')
  })

  it('does not count a worse run as progress', () => {
    expect(trailFrom([2, 1, 2, 3], 3)).toBe('yrrg')
  })

  it('is just green when solved on the first run', () => {
    expect(trailFrom([4], 4)).toBe('g')
  })
})

describe('trailEmoji', () => {
  it('turns letters into colored squares', () => {
    expect(trailEmoji('ryg')).toBe('🟥🟨🟩')
  })
})

describe('buildShareText', () => {
  const input: ShareInput = {
    number: 1,
    language: 'js',
    trail: 'ryg',
    runs: 3,
    elapsedMs: 252_000,
    hintsUsed: 0,
    journal: true,
    bonus: true,
    streak: 3,
    rankName: 'Junior',
  }

  it('summarizes the hunt', () => {
    expect(buildShareText(input)).toBe(
      [
        'Bug Hunt #001 🐞 JavaScript',
        '🟥🟨🟩  3 runs',
        '⏱ 04:12 · 💡 0 hints · 📓 journal · ⭐ bonus',
        '🔥 3-day streak · Junior',
        SITE_URL,
      ].join('\n'),
    )
  })

  it('only mentions what the player actually did', () => {
    const text = buildShareText({
      ...input,
      journal: false,
      bonus: false,
      hintsUsed: 1,
      streak: 1,
    })
    expect(text).toContain('⏱ 04:12 · 💡 1 hint')
    expect(text).not.toMatch(/journal|bonus|streak/)
  })

  it('works for solves saved without a trail', () => {
    expect(buildShareText({ ...input, trail: undefined, runs: 1 })).toContain('🟩  1 run')
  })

  it('contains no spoilers: nothing from the code, the title or the hints', () => {
    const text = buildShareText(input)
    expect(text).not.toMatch(/sort|string|Number|leaderboard|compar/i)
  })
})
