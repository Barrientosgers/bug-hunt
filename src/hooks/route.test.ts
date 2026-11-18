import { describe, expect, it } from 'vitest'
import { hrefFor, parseRoute } from './route.ts'

describe('parseRoute', () => {
  it('finds the progress page', () => {
    expect(parseRoute('#/progress')).toBe('progress')
    expect(parseRoute('#progress')).toBe('progress')
    expect(parseRoute('#/progress/')).toBe('progress')
  })

  it('falls back to the game', () => {
    for (const hash of ['', '#', '#/', '#/nope', '#/progressive']) {
      expect(parseRoute(hash)).toBe('game')
    }
  })

  it('round-trips', () => {
    expect(parseRoute(hrefFor('progress'))).toBe('progress')
    expect(parseRoute(hrefFor('game'))).toBe('game')
  })
})
