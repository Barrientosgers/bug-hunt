import { describe, expect, it } from 'vitest'
import { runJsTests } from './js-test-runner.ts'

describe('runJsTests', () => {
  it('runs passing and failing tests and reports expected vs. got', async () => {
    const run = await runJsTests(
      'function add(a, b) { return a - b }',
      "test('adds', () => expect(add(2, 3)).toBe(5)); test.bonus('zero', () => expect(add(0, 0)).toBe(0))",
    )
    expect(run.tests[0]).toMatchObject({ passed: false, got: '-1', expected: '5' })
    expect(run.tests[1]).toMatchObject({ bonus: true, passed: true })
  })

  it('captures console output', async () => {
    const run = await runJsTests("console.log('hi', 1, [2])", "test('t', () => {})")
    expect(run.console).toEqual(['hi 1 [2]'])
  })

  it('returns an error instead of throwing on a syntax error', async () => {
    const run = await runJsTests('function (', "test('t', () => {})")
    expect(run.error).toMatch(/SyntaxError/)
    expect(run.tests).toEqual([])
  })

  it('treats a thrown error inside a test as a failure', async () => {
    const run = await runJsTests('', "test('boom', () => { null.x })")
    expect(run.tests[0].passed).toBe(false)
    expect(run.tests[0].message).toMatch(/TypeError/)
  })

  it('compares arrays and objects with toEqual', async () => {
    const run = await runJsTests(
      '',
      "test('eq', () => expect({a:[1,2]}).toEqual({a:[1,2]}))",
    )
    expect(run.tests[0].passed).toBe(true)
  })
})
