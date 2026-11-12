import type { RunResult, TestOutcome } from './types.ts'

/**
 * A tiny Vitest/Jest-style test runner: `test()`, `test.bonus()` and `expect()`.
 *
 * SAFETY: this executes untrusted code with `new Function`. It must only ever be
 * called inside a Web Worker (in the browser) or in Node (in the verify script),
 * never on the main page.
 */

class ExpectationError extends Error {
  expected: string
  got: string
  constructor(message: string, got: unknown, expected: unknown) {
    super(message)
    this.got = format(got)
    this.expected = format(expected)
  }
}

export function format(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (typeof value === 'function') return 'function'
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every((key) =>
    deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  )
}

function expect(got: unknown) {
  return {
    toBe(expected: unknown) {
      if (!Object.is(got, expected)) {
        throw new ExpectationError('values are not identical (toBe)', got, expected)
      }
    },
    toEqual(expected: unknown) {
      if (!deepEqual(got, expected)) {
        throw new ExpectationError('values are not equal (toEqual)', got, expected)
      }
    },
    toBeCloseTo(expected: number, digits = 2) {
      if (typeof got !== 'number' || Math.abs(got - expected) >= 10 ** -digits / 2) {
        throw new ExpectationError('numbers are not close (toBeCloseTo)', got, expected)
      }
    },
    toBeUndefined() {
      if (got !== undefined) {
        throw new ExpectationError('value is not undefined', got, undefined)
      }
    },
    toBeTruthy() {
      if (!got) throw new ExpectationError('value is not truthy', got, 'a truthy value')
    },
    toBeFalsy() {
      if (got) throw new ExpectationError('value is not falsy', got, 'a falsy value')
    },
  }
}

const MAX_OUTPUT_LINES = 1000

interface RegisteredTest {
  name: string
  bonus: boolean
  fn: () => unknown
}

function formatLogArg(arg: unknown): string {
  return typeof arg === 'string' ? arg : format(arg)
}

export async function runJsTests(userCode: string, testCode: string): Promise<RunResult> {
  const registered: RegisteredTest[] = []
  const output: string[] = []

  const test = (name: string, fn: () => unknown) => {
    registered.push({ name, bonus: false, fn })
  }
  test.bonus = (name: string, fn: () => unknown) => {
    registered.push({ name, bonus: true, fn })
  }

  // Cap the output so a loop that logs forever cannot eat all the memory before the
  // timeout fires.
  const write = (...args: unknown[]) => {
    if (output.length < MAX_OUTPUT_LINES) output.push(args.map(formatLogArg).join(' '))
  }
  const fakeConsole = { log: write, warn: write, error: write }

  try {
    // User code and test code share one scope, so tests can call the player's functions.
    new Function('test', 'expect', 'console', `${userCode}\n;${testCode}`)(
      test,
      expect,
      fakeConsole,
    )
  } catch (error) {
    return { tests: [], console: output, error: String(error) }
  }

  const tests: TestOutcome[] = []
  for (const { name, bonus, fn } of registered) {
    try {
      await fn()
      tests.push({ name, bonus, passed: true })
    } catch (error) {
      if (error instanceof ExpectationError) {
        tests.push({
          name,
          bonus,
          passed: false,
          expected: error.expected,
          got: error.got,
          message: error.message,
        })
      } else {
        tests.push({ name, bonus, passed: false, message: String(error) })
      }
    }
  }
  return { tests, console: output }
}
