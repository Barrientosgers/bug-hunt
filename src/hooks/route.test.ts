import { describe, expect, it } from 'vitest'
import { hrefs, parseRoute } from './route.ts'

describe('parseRoute', () => {
  it('finds the progress and practice pages', () => {
    expect(parseRoute('#/progress')).toEqual({ page: 'progress' })
    expect(parseRoute('#progress')).toEqual({ page: 'progress' })
    expect(parseRoute('#/progress/')).toEqual({ page: 'progress' })
    expect(parseRoute('#/practice')).toEqual({ page: 'practice' })
  })

  it('finds a challenge to play', () => {
    expect(parseRoute('#/play/001-leaderboard')).toEqual({
      page: 'play',
      id: '001-leaderboard',
    })
  })

  it('falls back to the daily bug', () => {
    for (const hash of ['', '#', '#/', '#/nope', '#/progressive', '#/play', '#/play/']) {
      expect(parseRoute(hash)).toEqual({ page: 'daily' })
    }
    expect(parseRoute('#/play/%E0%A4%A')).toEqual({ page: 'daily' })
  })

  it('round-trips', () => {
    expect(parseRoute(hrefs.progress)).toEqual({ page: 'progress' })
    expect(parseRoute(hrefs.practice)).toEqual({ page: 'practice' })
    expect(parseRoute(hrefs.daily)).toEqual({ page: 'daily' })
    expect(parseRoute(hrefs.play('a b'))).toEqual({ page: 'play', id: 'a b' })
  })
})
