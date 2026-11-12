import { useState } from 'react'
import type { Language } from './content/types.ts'
import { getCodeRunner } from './runners/run-code.ts'
import type { RunResult } from './runners/types.ts'

// TEMPORARY: lets us try the runners with the loaded challenge. Step 4 replaces this
// with the real "Run tests" button and results panel.
const LOOPS: Record<Language, { code: string; tests: string }> = {
  js: { code: 'while (true) {}', tests: "test('x', () => {})" },
  python: {
    code: 'while True:\n    pass\n',
    tests: 'def test_x():\n    assert True\n',
  },
}

interface DevRunnerDemoProps {
  language: Language
  code?: string
  tests?: string
}

export function DevRunnerDemo({ language, code, tests }: DevRunnerDemoProps) {
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)

  async function run(source: string, testSource: string) {
    setRunning(true)
    setResult(await getCodeRunner().run(language, source, testSource))
    setRunning(false)
  }

  const ready = code !== undefined && tests !== undefined

  return (
    <div>
      <p>Temporary runner demo (replaced by the real Run tests button in step 4).</p>
      <p>
        <button
          disabled={running || !ready}
          onClick={() => void run(code ?? '', tests ?? '')}
        >
          Run my code
        </button>{' '}
        <button
          disabled={running}
          onClick={() => void run(LOOPS[language].code, LOOPS[language].tests)}
        >
          Infinite loop test
        </button>
      </p>
      {running && <p>Running…</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
