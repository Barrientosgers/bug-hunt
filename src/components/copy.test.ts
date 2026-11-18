import { describe, expect, it, vi } from 'vitest'
import { copyText } from './copy.ts'

describe('copyText', () => {
  it('copies and returns true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    await expect(copyText('hi', { writeText })).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('hi')
  })

  it('returns false when the browser blocks it', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    await expect(copyText('hi', { writeText })).resolves.toBe(false)
  })

  it('returns false when there is no clipboard at all', async () => {
    await expect(copyText('hi')).resolves.toBe(false)
  })
})
