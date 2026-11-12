import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RunResult } from '../src/runners/types.ts'

const RUNNER = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/runners/py_test_runner.py',
)

/** Runs the shared Python test runner in a subprocess (-I = isolated mode). */
export function runPythonTests(code: string, tests: string): RunResult {
  const child = spawnSync('python3', ['-I', RUNNER], {
    input: JSON.stringify({ code, tests }),
    encoding: 'utf8',
    timeout: 10_000,
  })
  if (child.error) throw new Error(`Could not run python3: ${child.error.message}`)
  if (child.status !== 0) throw new Error(`Python runner crashed:\n${child.stderr}`)
  return JSON.parse(child.stdout) as RunResult
}
