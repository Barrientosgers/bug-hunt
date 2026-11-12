import { runJsTests } from './js-test-runner.ts'

// Runs inside a Web Worker: no access to the page, DOM or localStorage.
const ctx = self as unknown as {
  postMessage(message: unknown): void
  onmessage: ((event: MessageEvent<{ code: string; tests: string }>) => void) | null
}

ctx.onmessage = async (event) => {
  const result = await runJsTests(event.data.code, event.data.tests)
  ctx.postMessage({ type: 'result', result })
}

ctx.postMessage({ type: 'ready' })
