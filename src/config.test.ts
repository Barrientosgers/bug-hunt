import { describe, expect, it } from 'vitest'
import { APP_TITLE } from './config'

describe('config', () => {
  it('has the right app title', () => {
    expect(APP_TITLE).toBe('Bug Hunt')
  })
})
