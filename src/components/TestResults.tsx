import type { TestOutcome } from '../runners/types.ts'
import { displayTestName, headline, type ResultSummary } from '../game/results.ts'
import styles from './TestResults.module.css'

interface TestResultsProps {
  /** null until the player runs the tests. */
  summary: ResultSummary | null
  running: boolean
  /** True when the code was edited after this result was produced. */
  stale: boolean
}

function TestItem({ test, star }: { test: TestOutcome; star?: boolean }) {
  const label = test.passed ? 'Passed' : 'Failed'
  return (
    <li className={styles.item} data-passed={test.passed}>
      <p className={styles.itemTitle}>
        <span className={styles.status}>
          <span aria-hidden="true">{test.passed ? '✓' : '✗'}</span> {label}
        </span>
        <span>
          {star && <span aria-hidden="true">★ </span>}
          {displayTestName(test.name)}
        </span>
      </p>
      {!test.passed && (
        <div className={styles.detail}>
          {test.expected !== undefined && test.got !== undefined ? (
            <dl className={styles.compare}>
              <dt>Expected</dt>
              <dd>
                <code>{test.expected}</code>
              </dd>
              <dt>Got</dt>
              <dd>
                <code>{test.got}</code>
              </dd>
            </dl>
          ) : (
            test.message && <p className={styles.message}>{test.message}</p>
          )}
        </div>
      )}
    </li>
  )
}

export function TestResults({ summary, running, stale }: TestResultsProps) {
  if (running) return <p className={styles.muted}>Running your code…</p>

  if (!summary) {
    return (
      <p className={styles.muted}>
        Press <strong>Run tests</strong> to see results here. Tip: the failing tests
        describe exactly what the code should do, so read them closely.
      </p>
    )
  }

  return (
    <div>
      {stale && (
        <p className={styles.stale}>
          You changed your code since this run. Run the tests again to see new results.
        </p>
      )}
      <h3 className={styles.headline} data-status={summary.status}>
        {summary.status === 'solved' && <span aria-hidden="true">🎉 </span>}
        {headline(summary)}
      </h3>

      {(summary.status === 'error' || summary.status === 'timeout') && (
        <div className={styles.callout}>
          <p className={styles.message}>{summary.message}</p>
          <p>
            This is a normal part of debugging. Read the message carefully: it usually
            points to the line or the idea to look at.
          </p>
        </div>
      )}

      {summary.status === 'solved' && (
        <p className={styles.success}>
          All required tests pass. Nice work! Open the Review tab to see what Priya thinks
          of your fix.
        </p>
      )}

      {summary.required.length > 0 && (
        <ul className={styles.list} aria-label="Required tests">
          {summary.required.map((test) => (
            <TestItem key={test.name} test={test} />
          ))}
        </ul>
      )}

      {summary.status !== 'error' && summary.status !== 'timeout' && (
        <section className={styles.bonus} aria-label="Bonus tests">
          {!summary.bonusUnlocked ? (
            <p className={styles.muted}>
              <span aria-hidden="true">★ </span>Bonus tests unlock when all required tests
              pass.
            </p>
          ) : (
            <>
              <h4 className={styles.bonusTitle}>
                Bonus: {summary.passedBonus} of {summary.bonus.length} found
              </h4>
              {summary.passedBonus < summary.bonus.length && (
                <p className={styles.muted}>
                  There is one more thing hiding in this code. A bonus test is still
                  failing.
                </p>
              )}
              <ul className={styles.list} aria-label="Bonus tests">
                {summary.bonus.map((test) => (
                  <TestItem key={test.name} test={test} star />
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  )
}
