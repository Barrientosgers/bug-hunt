import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Language } from '../content/types.ts'
import {
  CodeRunner,
  limitConsole,
  MAX_CONSOLE_LINES,
  type WorkerLike,
} from './run-code.ts'
import type { RunResult } from './types.ts'

class FakeWorker implements WorkerLike {
  posted: unknown[] = []
  terminated = false
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  postMessage(message: unknown) {
    this.posted.push(message)
  }
  terminate() {
    this.terminated = true
  }
  emit(data: unknown) {
    this.onmessage?.({ data } as MessageEvent)
  }
}

const okResult: RunResult = {
  tests: [{ name: 'a', bonus: false, passed: true }],
  console: ['hi'],
}

function setup() {
  const workers: FakeWorker[] = []
  const created: Language[] = []
  const runner = new CodeRunner({
    timeoutMs: 1000,
    loadTimeoutMs: 5000,
    createWorker: (language) => {
      const worker = new FakeWorker()
      workers.push(worker)
      created.push(language)
      return worker
    },
  })
  return { runner, workers, created }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('CodeRunner', () => {
  it('sends the code once the worker is ready and resolves with its result', async () => {
    const { runner, workers } = setup()
    const promise = runner.run('js', 'code', 'tests')
    await vi.advanceTimersByTimeAsync(0)
    workers[0].emit({ type: 'ready' })
    expect(workers[0].posted).toEqual([{ code: 'code', tests: 'tests' }])
    workers[0].emit({ type: 'result', result: okResult })
    await expect(promise).resolves.toEqual(okResult)
    expect(workers[0].terminated).toBe(true) // JS workers are never reused
  })

  it('stops code that runs too long and reports a timeout', async () => {
    const { runner, workers } = setup()
    const promise = runner.run('js', 'while(true){}', 'tests')
    await vi.advanceTimersByTimeAsync(0)
    workers[0].emit({ type: 'ready' })
    await vi.advanceTimersByTimeAsync(1000)
    const result = await promise
    expect(result.timedOut).toBe(true)
    expect(result.error).toMatch(/infinite loop/)
    expect(workers[0].terminated).toBe(true)
  })

  it('does not count the runner start-up time against the code timeout', async () => {
    const { runner, workers } = setup()
    const promise = runner.run('python', 'code', 'tests')
    await vi.advanceTimersByTimeAsync(4000) // slow download, still under loadTimeoutMs
    workers[0].emit({ type: 'ready' })
    workers[0].emit({ type: 'result', result: okResult })
    await expect(promise).resolves.toEqual(okResult)
  })

  it('gives up if the runner never starts', async () => {
    const { runner, workers } = setup()
    const promise = runner.run('python', 'code', 'tests')
    await vi.advanceTimersByTimeAsync(5000)
    expect((await promise).error).toMatch(/too long to start/)
    expect(workers[0].terminated).toBe(true)
  })

  it('reuses the Python worker, but replaces it after a timeout', async () => {
    const { runner, workers, created } = setup()

    const first = runner.run('python', 'a', 't')
    await vi.advanceTimersByTimeAsync(0)
    workers[0].emit({ type: 'ready' })
    workers[0].emit({ type: 'result', result: okResult })
    await first

    const second = runner.run('python', 'b', 't')
    await vi.advanceTimersByTimeAsync(0)
    expect(created).toEqual(['python']) // reused: no new worker
    expect(workers[0].posted).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(1000) // never answers
    expect((await second).timedOut).toBe(true)

    const third = runner.run('python', 'c', 't')
    await vi.advanceTimersByTimeAsync(0)
    expect(created).toEqual(['python', 'python']) // fresh worker after the timeout
    workers[1].emit({ type: 'ready' })
    workers[1].emit({ type: 'result', result: okResult })
    await third
  })

  it('turns a worker crash into an error result', async () => {
    const { runner, workers } = setup()
    const promise = runner.run('js', 'code', 'tests')
    await vi.advanceTimersByTimeAsync(0)
    workers[0].onerror?.({ message: 'boom' } as ErrorEvent)
    expect((await promise).error).toMatch(/crashed: boom/)
  })

  it('runs requests one at a time', async () => {
    const { runner, workers } = setup()
    const first = runner.run('js', 'a', 't')
    const second = runner.run('js', 'b', 't')
    await vi.advanceTimersByTimeAsync(0)
    expect(workers).toHaveLength(1) // second waits for the first
    workers[0].emit({ type: 'ready' })
    workers[0].emit({ type: 'result', result: okResult })
    await first
    await vi.advanceTimersByTimeAsync(0)
    expect(workers).toHaveLength(2)
    workers[1].emit({ type: 'ready' })
    workers[1].emit({ type: 'result', result: okResult })
    await second
  })
})

describe('limitConsole', () => {
  it('caps the number of lines and the length of each line', () => {
    const lines = Array.from({ length: MAX_CONSOLE_LINES + 5 }, () => 'x'.repeat(600))
    const limited = limitConsole(lines)
    expect(limited).toHaveLength(MAX_CONSOLE_LINES + 1)
    expect(limited[0].length).toBeLessThan(600)
    expect(limited.at(-1)).toMatch(/5 more lines hidden/)
  })
})
