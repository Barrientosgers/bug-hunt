import { describe, expect, it } from 'vitest'
import { RANKS, rankFor } from './ranks.ts'

describe('rankFor', () => {
  it('starts as an Intern', () => {
    expect(rankFor(0).rank.name).toBe('Intern')
    expect(rankFor(0).next?.name).toBe('Junior')
  })

  it('moves up exactly at each threshold', () => {
    expect(rankFor(49).rank.name).toBe('Intern')
    expect(rankFor(50).rank.name).toBe('Junior')
    expect(rankFor(150).rank.name).toBe('Mid-level')
    expect(rankFor(1200).rank.name).toBe('Bug Hunter')
  })

  it('reports progress toward the next rank', () => {
    const info = rankFor(25)
    expect(info.xpIntoRank).toBe(25)
    expect(info.xpSpan).toBe(50)
    expect(info.progress).toBe(0.5)
  })

  it('has no next rank at the top', () => {
    const info = rankFor(99999)
    expect(info.rank.name).toBe(RANKS.at(-1)?.name)
    expect(info.next).toBeNull()
    expect(info.progress).toBe(1)
  })
})
