import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { MONACO_VERSION } from '../src/editorConfig.ts'

describe('editor config', () => {
  it('loads the same Monaco version from the CDN as the installed package', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    expect(pkg.dependencies['monaco-editor']).toBe(MONACO_VERSION)
  })
})
