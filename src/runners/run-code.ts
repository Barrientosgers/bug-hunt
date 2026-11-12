import type { Language } from '../content/types.ts'
import type { RunResult } from './types.ts'

/** The small part of the Worker API we use, so tests can pass a fake. */
export interface WorkerLike {
  postMessage(message: unknown): void
  terminate(): void
  onmessage: ((event: MessageEvent) => void) | null
  onerror: ((event: ErrorEvent) => void) | null
}

export type WorkerFactory = (language: Language) => WorkerLike

export interface CodeRunnerOptions {
  createWorker: WorkerFactory
  /** How long the player's code may run once the runner is ready. */
  timeoutMs?: number
  /** How long we wait for the runner itself to start (Pyodide downloads ~10 MB). */
  loadTimeoutMs?: number
}

export const MAX_CONSOLE_LINES = 200
export const MAX_LINE_LENGTH = 500

export function limitConsole(lines: string[]): string[] {
  const kept = lines
    .slice(0, MAX_CONSOLE_LINES)
    .map((line) =>
      line.length > MAX_LINE_LENGTH ? `${line.slice(0, MAX_LINE_LENGTH)}…` : line,
    )
  if (lines.length > MAX_CONSOLE_LINES) {
    kept.push(`… ${lines.length - MAX_CONSOLE_LINES} more lines hidden`)
  }
  return kept
}

function failure(error: string, timedOut = false): RunResult {
  return { tests: [], console: [], error, ...(timedOut ? { timedOut } : {}) }
}

/**
 * Runs player code in a Web Worker with a timeout.
 *
 * A worker cannot be interrupted from the inside, so if the code does not answer in time
 * we call `worker.terminate()`. That stops even an infinite loop and the page stays alive.
 * JavaScript gets a fresh worker per run (cheap). Python keeps its worker between runs,
 * because starting Pyodide is slow, and only starts a new one after a timeout or crash.
 */
export class CodeRunner {
  private createWorker: WorkerFactory
  private timeoutMs: number
  private loadTimeoutMs: number
  private reusable = new Map<Language, WorkerLike>()
  private queue: Promise<unknown> = Promise.resolve()

  constructor(options: CodeRunnerOptions) {
    this.createWorker = options.createWorker
    this.timeoutMs = options.timeoutMs ?? 5000
    this.loadTimeoutMs = options.loadTimeoutMs ?? 60_000
  }

  /** Runs one at a time, so two clicks can never share a worker. */
  run(language: Language, code: string, tests: string): Promise<RunResult> {
    const next = this.queue.then(() => this.runNow(language, code, tests))
    this.queue = next.catch(() => undefined)
    return next
  }

  dispose(): void {
    for (const worker of this.reusable.values()) worker.terminate()
    this.reusable.clear()
  }

  private runNow(language: Language, code: string, tests: string): Promise<RunResult> {
    const keepAlive = language === 'python'
    let worker = keepAlive ? this.reusable.get(language) : undefined
    const isNew = !worker
    if (!worker) {
      worker = this.createWorker(language)
      if (keepAlive) this.reusable.set(language, worker)
    }
    const activeWorker = worker

    return new Promise<RunResult>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | undefined
      let settled = false

      const finish = (result: RunResult, discardWorker: boolean) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        activeWorker.onmessage = null
        activeWorker.onerror = null
        if (discardWorker || !keepAlive) {
          activeWorker.terminate()
          this.reusable.delete(language)
        }
        resolve({ ...result, console: limitConsole(result.console) })
      }

      const sendCode = () => {
        activeWorker.postMessage({ code, tests })
        timer = setTimeout(() => {
          const seconds = this.timeoutMs / 1000
          finish(
            failure(
              `Your code ran for more than ${seconds} seconds, so we stopped it. ` +
                'Is there an infinite loop?',
              true,
            ),
            true,
          )
        }, this.timeoutMs)
      }

      activeWorker.onerror = (event) => {
        finish(
          failure(`The code runner crashed: ${event.message ?? 'unknown error'}`),
          true,
        )
      }
      activeWorker.onmessage = (event) => {
        const data = event.data as { type?: string; result?: RunResult }
        if (data.type === 'ready') {
          clearTimeout(timer)
          sendCode()
        } else if (data.type === 'result' && data.result) {
          // A startup failure arrives as a result too; drop that worker so we retry fresh.
          finish(
            data.result,
            data.result.tests.length === 0 && Boolean(data.result.error),
          )
        }
      }

      if (isNew) {
        timer = setTimeout(
          () =>
            finish(failure('The code runner took too long to start. Try again.'), true),
          this.loadTimeoutMs,
        )
      } else {
        sendCode()
      }
    })
  }
}

/** Creates the real Web Workers. Vite bundles each worker file separately. */
export function createBrowserWorker(language: Language): WorkerLike {
  return language === 'js'
    ? new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' })
    : new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' })
}

let shared: CodeRunner | undefined

/** The app-wide runner. Created lazily so tests and SSR never touch `Worker`. */
export function getCodeRunner(): CodeRunner {
  shared ??= new CodeRunner({ createWorker: createBrowserWorker })
  return shared
}
