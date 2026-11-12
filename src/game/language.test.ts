import { describe, expect, it } from 'vitest'
import { pickLanguage } from './language.ts'

describe('pickLanguage', () => {
  it('uses the saved language when the challenge offers it', () => {
    expect(pickLanguage('python', ['js', 'python'])).toBe('python')
  })

  it('falls back to the first available language', () => {
    expect(pickLanguage(null, ['js', 'python'])).toBe('js')
    expect(pickLanguage('java', ['js', 'python'])).toBe('js')
    expect(pickLanguage('python', ['js'])).toBe('js')
  })
})
