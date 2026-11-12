import { loadPyodide, version } from 'pyodide'
import runnerSource from './py_test_runner.py?raw'
import type { RunResult } from './types.ts'

// Runs inside a Web Worker. Pyodide (CPython compiled to WebAssembly) is downloaded from
// the jsDelivr CDN, pinned to the exact version installed from npm.
const ctx = self as unknown as {
  postMessage(message: unknown): void
  onmessage: ((event: MessageEvent<{ code: string; tests: string }>) => void) | null
}

async function start() {
  const pyodide = await loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${version}/full/`,
  })

  // Load our shared runner as a module, then expose one function that returns JSON.
  pyodide.globals.set('_runner_source', runnerSource)
  pyodide.runPython(`
import json, types
_mod = types.ModuleType("py_test_runner")
exec(compile(_runner_source, "py_test_runner.py", "exec"), _mod.__dict__)

def _bughunt_run(code, tests):
    return json.dumps(_mod.run_tests(code, tests))
`)
  const run = pyodide.globals.get('_bughunt_run')

  ctx.onmessage = (event) => {
    const json = run(event.data.code, event.data.tests) as string
    ctx.postMessage({ type: 'result', result: JSON.parse(json) as RunResult })
  }
  ctx.postMessage({ type: 'ready' })
}

start().catch((error) => {
  const result: RunResult = {
    tests: [],
    console: [],
    error: `Could not start Python: ${String(error)}. Check your internet connection and try again.`,
  }
  ctx.postMessage({ type: 'result', result })
})
