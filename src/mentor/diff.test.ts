import { describe, expect, it } from 'vitest'
import { diffStats } from './diff.ts'

describe('diffStats', () => {
  it('finds no changes in identical code, ignoring indentation and blank lines', () => {
    expect(diffStats('a\n  b\n\nc', 'a\nb\nc\n').changed).toBe(0)
  })

  it('counts a replaced line once', () => {
    expect(diffStats('a\nb\nc', 'a\nB\nc')).toEqual({ added: 1, removed: 1, changed: 1 })
  })

  it('counts added and removed lines', () => {
    expect(diffStats('a\nb', 'a\nb\nc\nd')).toEqual({ added: 2, removed: 0, changed: 2 })
    expect(diffStats('a\nb\nc', 'a')).toEqual({ added: 0, removed: 2, changed: 2 })
  })

  it('treats a full rewrite as a big change', () => {
    expect(diffStats('a\nb\nc', 'x\ny\nz\nw').changed).toBe(4)
  })
})
