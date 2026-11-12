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

  it('requires a fileName for each language', () => {
    const bad = structuredClone(sample)
    bad.languages.js.fileName = ''
    expect(validateChallenge(bad)).toContain('languages.js.fileName is required')
  })

  it('accepts valid evidence and rejects malformed evidence', () => {
    const good = {
      ...sample,
      evidence: [{ type: 'log', title: 'Server log', content: 'GET /leaderboard 200' }],
    }
    expect(validateChallenge(good)).toEqual([])
    const bad = { ...sample, evidence: [{ type: 'video', title: '', content: '' }] }
    expect(validateChallenge(bad)).toContain(
      'evidence[0] needs a valid type, title and content',
    )
  })

  it('rejects an unknown kind', () => {
    expect(validateChallenge({ ...sample, kind: 'quiz' })[0]).toMatch(
      /^kind must be one of/,
    )
  })

  it('requires a hypothesis with keywords and feedback', () => {
    const bad = structuredClone(sample)
    bad.hypothesis.where = []
    bad.hypothesis.miss = ''
    const errors = validateChallenge(bad)
    expect(errors).toContain('hypothesis.where must be a non-empty list of keywords')
    expect(errors).toContain('hypothesis.miss is required')
  })

  it('requires minimalChange.maxLines for each language', () => {
    const bad = structuredClone(sample)
    bad.languages.js.minimalChange.maxLines = 0
    expect(validateChallenge(bad)).toContain(
      'languages.js.minimalChange.maxLines must be a positive integer',
    )
  })
})
