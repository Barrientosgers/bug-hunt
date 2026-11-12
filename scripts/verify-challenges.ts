import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LANGUAGES, type Language, type LanguageVersion } from '../src/content/types.ts'
import { parseChallenge } from '../src/content/validate.ts'
import { diffStats } from '../src/mentor/diff.ts'
import { ruleFires } from '../src/mentor/rules.ts'
import { runJsTests } from '../src/runners/js-test-runner.ts'
import type { RunResult } from '../src/runners/types.ts'
import { runPythonTests } from './run-python.ts'

const CHALLENGES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../content/challenges',
)

/**
 * The "mutation check" rules for one language version:
 *  1. The reference solution runs cleanly and passes EVERY test (required + bonus).
 *  2. The buggy version runs, and fails at least one REQUIRED test.
 * Returns a list of problems; empty means the challenge is sound.
 */
export function checkVersion(solution: RunResult, buggy: RunResult): string[] {
  const problems: string[] = []

  if (solution.error) problems.push(`solution did not run: ${solution.error}`)
  else if (solution.tests.length === 0) problems.push('solution ran zero tests')
  for (const test of solution.tests) {
    if (!test.passed) problems.push(`solution fails "${test.name}": ${test.message}`)
  }

  if (buggy.error) problems.push(`buggy code did not run: ${buggy.error}`)
  else if (!buggy.tests.some((test) => !test.bonus && !test.passed)) {
    problems.push('buggy code passes every required test, so the bug is not detected')
  }
  return problems
}

/**
 * Checks the mentor's content against the real code, so a broken review can never ship:
 *  - on the reference solution, "root-cause" and "bonus" rules fire and the others do not;
 *  - on the buggy code, it is the other way around;
 *  - the solution's change fits within the declared `minimalChange.maxLines`.
 */
export function checkReview(
  version: Pick<LanguageVersion, 'reviewRules' | 'minimalChange'>,
  solutionCode: string,
  buggyCode: string,
): string[] {
  const problems: string[] = []
  const goodKinds = ['root-cause', 'bonus']

  for (const kind of ['root-cause', 'symptom']) {
    if (!version.reviewRules.some((rule) => rule.kind === kind)) {
      problems.push(`needs at least one "${kind}" review rule`)
    }
  }
  for (const rule of version.reviewRules) {
    const isGood = goodKinds.includes(rule.kind)
    if (ruleFires(rule, solutionCode) !== isGood) {
      problems.push(
        `review rule "${rule.id}" should ${isGood ? '' : 'not '}fire on the reference solution`,
      )
    }
    if (ruleFires(rule, buggyCode) === isGood) {
      problems.push(
        `review rule "${rule.id}" should ${isGood ? 'not ' : ''}fire on the buggy code`,
      )
    }
  }

  const changed = diffStats(buggyCode, solutionCode).changed
  if (changed < 1) problems.push('the solution is identical to the buggy code')
  else if (changed > version.minimalChange.maxLines) {
    problems.push(
      `the solution changes ${changed} lines but minimalChange.maxLines is ${version.minimalChange.maxLines}`,
    )
  }
  return problems
}

async function run(language: Language, code: string, tests: string): Promise<RunResult> {
  return language === 'js' ? runJsTests(code, tests) : runPythonTests(code, tests)
}

export interface ChallengeReport {
  id: string
  problems: string[]
  /** One line per language, for the console. */
  summary: string[]
}

export async function verifyChallenge(dir: string): Promise<ChallengeReport> {
  const id = path.basename(dir)
  const report: ChallengeReport = { id, problems: [], summary: [] }

  let challenge
  try {
    challenge = parseChallenge(
      JSON.parse(fs.readFileSync(path.join(dir, 'challenge.json'), 'utf8')),
    )
  } catch (error) {
    report.problems.push(String(error instanceof Error ? error.message : error))
    return report
  }
  if (challenge.id !== id)
    report.problems.push(`id "${challenge.id}" must match folder "${id}"`)

  for (const language of LANGUAGES) {
    const version = challenge.languages[language]
    if (!version) continue
    const read = (file: string) => fs.readFileSync(path.join(dir, file), 'utf8')
    const tests = read(version.tests)
    const solutionCode = read(version.solution)
    const buggyCode = read(version.buggy)
    const solution = await run(language, solutionCode, tests)
    const buggy = await run(language, buggyCode, tests)

    const problems = [
      ...checkVersion(solution, buggy),
      ...checkReview(version, solutionCode, buggyCode),
    ]
    const failedRequired = buggy.tests.filter((t) => !t.bonus && !t.passed).length
    const failedBonus = buggy.tests.filter((t) => t.bonus && !t.passed).length
    report.summary.push(
      `${language}: solution ${solution.tests.filter((t) => t.passed).length}/${solution.tests.length} pass; ` +
        `buggy fails ${failedRequired} required + ${failedBonus} bonus`,
    )
    report.problems.push(...problems.map((p) => `[${language}] ${p}`))
  }
  return report
}

export async function verifyAll(root = CHALLENGES_DIR): Promise<ChallengeReport[]> {
  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .sort()
  const reports: ChallengeReport[] = []
  for (const dir of dirs) reports.push(await verifyChallenge(dir))
  return reports
}

async function main(): Promise<void> {
  const reports = await verifyAll()
  let failed = false
  for (const report of reports) {
    const ok = report.problems.length === 0
    console.log(`${ok ? 'PASS' : 'FAIL'} ${report.id}`)
    report.summary.forEach((line) => console.log(`   ${line}`))
    report.problems.forEach((problem) => console.log(`   ! ${problem}`))
    if (!ok) failed = true
  }
  if (reports.length === 0) {
    console.log('No challenges found.')
    failed = true
  }
  console.log(
    failed ? '\nVerification FAILED' : `\nAll ${reports.length} challenge(s) verified`,
  )
  process.exit(failed ? 1 : 0)
}

// Run only when executed directly (npm run verify), not when imported by tests.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main()
}
