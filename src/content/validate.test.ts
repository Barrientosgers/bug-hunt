import { describe, expect, it } from 'vitest'
import sample from '../../content/challenges/001-leaderboard/challenge.json'
import { validateChallenge } from './validate.ts'

describe('validateChallenge', () => {
  it('accepts the leaderboard challenge', () => {
    expect(validateChallenge(sample)).toEqual([])
  })

  it('rejects non-objects', () => {
    expect(validateChallenge(null)).toEqual(['challenge must be an object'])
  })

  it('reports missing and invalid fields', () => {
    const bad = { ...sample, title: '', difficulty: 'impossible', number: 0 }
    const errors = validateChallenge(bad)
    expect(errors).toContain('title is required')
    expect(errors.some((e) => e.startsWith('difficulty'))).toBe(true)
    expect(errors).toContain('number must be a positive integer')
  })

  it('requires exactly 4 hints per language', () => {
    const bad = structuredClone(sample)
    bad.languages.js.hints = ['only one']
    expect(validateChallenge(bad)).toContain(
      'languages.js.hints must be exactly 4 non-empty strings',
    )
  })

  it('rejects an invalid review-rule regular expression', () => {
    const bad = structuredClone(sample)
    bad.languages.python.reviewRules[0].pattern = '('
    expect(validateChallenge(bad).join()).toMatch(/not a valid regular expression/)
  })

  it('requires the language-specific version to exist', () => {
    const bad = {
      ...sample,
      languageSpecific: 'python',
      languages: { js: sample.languages.js },
    }
    expect(validateChallenge(bad).join()).toMatch(/version is missing/)
  })
})
