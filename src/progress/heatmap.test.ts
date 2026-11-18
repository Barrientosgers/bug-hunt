import { describe, expect, it } from 'vitest'
import { buildHeatmap, describeHeatmap, levelFor } from './heatmap.ts'

// 2026-11-18 is a Wednesday.
const TODAY = '2026-11-18'

describe('buildHeatmap', () => {
  it('has the requested number of weeks of 7 days, Monday first', () => {
    const grid = buildHeatmap({}, TODAY, 12)
    expect(grid).toHaveLength(12)
    expect(grid.every((week) => week.length === 7)).toBe(true)
    expect(grid[11][0].day).toBe('2026-11-16')
    expect(grid[0][0].day).toBe('2026-08-31')
  })

  it('marks days after today as future, with no count', () => {
    const last = buildHeatmap({ '2026-11-19': 5 }, TODAY)[11]
    expect(last[2].day).toBe(TODAY)
    expect(last[2].future).toBe(false)
    expect(last[3].future).toBe(true)
    expect(last[3].count).toBe(0)
  })

  it('counts solves and shades by count', () => {
    const grid = buildHeatmap({ [TODAY]: 2, '2026-11-17': 9 }, TODAY)
    expect(grid[11][2]).toMatchObject({ count: 2, level: 2 })
    expect(grid[11][1]).toMatchObject({ count: 9, level: 3 })
    expect(grid[11][0]).toMatchObject({ count: 0, level: 0 })
  })

  it('works when today is a Sunday and a Monday', () => {
    expect(buildHeatmap({}, '2026-11-22')[11][6].day).toBe('2026-11-22')
    expect(buildHeatmap({}, '2026-11-16')[11][0].day).toBe('2026-11-16')
  })

  it('crosses a year boundary', () => {
    const grid = buildHeatmap({}, '2027-01-05', 4)
    expect(grid[0][0].day).toBe('2026-12-14')
    expect(grid.flat().some((cell) => cell.day === '2027-01-01')).toBe(true)
  })
})

describe('levelFor', () => {
  it('caps at 3', () => {
    expect([0, 1, 2, 3, 4, 10].map(levelFor)).toEqual([0, 1, 2, 3, 3, 3])
  })
})

describe('describeHeatmap', () => {
  it('summarizes in words and ignores future days', () => {
    const grid = buildHeatmap({ [TODAY]: 2, '2026-11-17': 1 }, TODAY)
    expect(describeHeatmap(grid)).toBe('3 bugs solved on 2 days in the last 12 weeks.')
    expect(describeHeatmap(buildHeatmap({}, TODAY))).toBe(
      '0 bugs solved on 0 days in the last 12 weeks.',
    )
  })
})
