/** Result of running one test. Same shape for every language. */
export interface TestOutcome {
  name: string
  /** Bonus tests check extra findings; they never block "solved". */
  bonus: boolean
  passed: boolean
  /** Printable forms of the values, so the UI can show "expected vs. got". */
  expected?: string
  got?: string
  message?: string
}

export interface RunResult {
  tests: TestOutcome[]
  /** Everything the player's code printed (console.log / print). */
  console: string[]
  /** Set when the code could not run at all (e.g. a syntax error). */
  error?: string
}
