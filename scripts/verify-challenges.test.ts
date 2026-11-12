import { describe, expect, it } from 'vitest'
import type { RunResult } from '../src/runners/types.ts'
import { runPythonTests } from './run-python.ts'
import { checkReview, checkVersion, verifyAll } from './verify-challenges.ts'

const pass = (name: string, bonus = false) => ({ name, bonus, passed: true })
const fail = (name: string, bonus = false) => ({
  name,
  bonus,
  passed: false,
  message: 'x',
})
const result = (tests: RunResult['tests']): RunResult => ({ tests, console: [] })

describe('checkVersion (the mutation check rules)', () => {
  it('accepts a sound challenge', () => {
    const solution = result([pass('a'), pass('b', true)])
    const buggy = result([fail('a'), pass('b', true)])
    expect(checkVersion(solution, buggy)).toEqual([])
  })

  it('rejects a solution that fails a test (even a bonus one)', () => {
    const solution = result([pass('a'), fail('b', true)])
    const buggy = result([fail('a')])
    expect(checkVersion(solution, buggy)).toHaveLength(1)
  })

  it('rejects buggy code that only fails bonus tests', () => {
    const solution = result([pass('a'), pass('b', true)])
    const buggy = result([pass('a'), fail('b', true)])
    expect(checkVersion(solution, buggy)[0]).toMatch(/bug is not detected/)
  })

  it('rejects code that could not run', () => {
    const broken: RunResult = { tests: [], console: [], error: 'SyntaxError' }
    expect(checkVersion(broken, broken).length).toBeGreaterThanOrEqual(2)
  })
})

describe('checkReview (the mentor content check)', () => {
  const version = {
    minimalChange: { maxLines: 2 },
    reviewRules: [
      {
        id: 'fix',
        kind: 'root-cause',
        pattern: 'Number\\(',
        matches: true,
        feedback: 'x',
      },
      {
        id: 'still-broken',
        kind: 'symptom',
        pattern: 'Number\\(',
        matches: false,
        feedback: 'x',
      },
    ],
  } as const
  const buggy = 'sort(a < b)\nreturn x'
  const solution = 'sort(Number(a) < Number(b))\nreturn x'

  it('accepts rules that fire on the right code', () => {
    expect(
      checkReview({ ...version, reviewRules: [...version.reviewRules] }, solution, buggy),
    ).toEqual([])
  })

  it('catches a rule that fires on the wrong code', () => {
    const rules = [{ ...version.reviewRules[0], pattern: 'sort' }, version.reviewRules[1]]
    const problems = checkReview({ ...version, reviewRules: rules }, solution, buggy)
    expect(problems.join()).toMatch(/"fix" should not fire on the buggy code/)
  })

  it('catches a solution that changes more lines than declared', () => {
    const big = 'a\nb\nc\nd'
    const problems = checkReview(
      { ...version, reviewRules: [...version.reviewRules] },
      big,
      'x',
    )
    expect(problems.join()).toMatch(/maxLines/)
  })

  it('requires both a root-cause and a symptom rule', () => {
    const problems = checkReview({ ...version, reviewRules: [] }, solution, buggy)
    expect(problems.join()).toMatch(/"root-cause"/)
    expect(problems.join()).toMatch(/"symptom"/)
  })
})

describe('python runner', () => {
  it('reports expected vs. got for a failing assert, and captures print output', () => {
    const run = runPythonTests(
      'def double(x):\n    print("called")\n    return x + 1\n',
      'def test_double():\n    assert double(2) == 4\n\ndef test_bonus_ok():\n    assert True\n',
    )
    expect(run.console).toEqual(['called'])
    expect(run.tests[0]).toMatchObject({ passed: false, got: '3', expected: '4' })
    expect(run.tests[1]).toMatchObject({ bonus: true, passed: true })
  })

  it('reports a syntax error instead of crashing', () => {
    const run = runPythonTests('def broken(:\n', 'def test_x():\n    assert True\n')
    expect(run.error).toMatch(/SyntaxError/)
  })
})

describe('real challenges', () => {
  it('every challenge in content/challenges passes the mutation check', async () => {
    const reports = await verifyAll()
    expect(reports.length).toBeGreaterThan(0)
    for (const report of reports) expect(report.problems, report.id).toEqual([])
  })
})
