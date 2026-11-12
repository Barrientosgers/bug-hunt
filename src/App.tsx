import { useState } from 'react'
import buggyJs from '../content/challenges/001-leaderboard/js/buggy.js?raw'
import solutionJs from '../content/challenges/001-leaderboard/js/solution.js?raw'
import testsJs from '../content/challenges/001-leaderboard/js/tests.js?raw'
import buggyPy from '../content/challenges/001-leaderboard/python/buggy.py?raw'
import solutionPy from '../content/challenges/001-leaderboard/python/solution.py?raw'
import testsPy from '../content/challenges/001-leaderboard/python/tests.py?raw'
import type { Language } from './content/types.ts'
import { getCodeRunner } from './runners/run-code.ts'
import type { RunResult } from './runners/types.ts'
import { APP_TITLE } from './config'

// TEMPORARY Phase 2 demo: lets us try both runners in a real browser.
// Phase 3 replaces this with the real game screen.
const DEMOS: { label: string; language: Language; code: string; tests: string }[] = [
  { label: 'JS: buggy code', language: 'js', code: buggyJs, tests: testsJs },
  { label: 'JS: solution', language: 'js', code: solutionJs, tests: testsJs },
  {
    label: 'JS: infinite loop',
    language: 'js',
    code: 'while (true) {}',
    tests: "test('x', () => {})",
  },
  { label: 'Python: buggy code', language: 'python', code: buggyPy, tests: testsPy },
  { label: 'Python: solution', language: 'python', code: solutionPy, tests: testsPy },
  {
    label: 'Python: infinite loop',
    language: 'python',
    code: 'while True:\n    pass\n',
    tests: 'def test_x():\n    assert True\n',
  },
]

export default function App() {
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)

  async function run(demo: (typeof DEMOS)[number]) {
    setRunning(true)
    setResult(await getCodeRunner().run(demo.language, demo.code, demo.tests))
    setRunning(false)
  }

  return (
    <main>
      <h1>{APP_TITLE}</h1>
      <p>A daily debugging game for junior developers. Coming soon.</p>
      <h2>Runner demo (temporary)</h2>
      <p>
        {DEMOS.map((demo) => (
          <button key={demo.label} disabled={running} onClick={() => void run(demo)}>
            {demo.label}
          </button>
        ))}
      </p>
      {running && <p>Running…</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </main>
  )
}
