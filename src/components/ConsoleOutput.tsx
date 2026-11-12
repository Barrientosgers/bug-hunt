import styles from './ConsoleOutput.module.css'

/** What the player's code printed with console.log (JavaScript) or print (Python). */
export function ConsoleOutput({ lines }: { lines: string[] | null }) {
  if (lines === null) {
    return <p className={styles.muted}>Run your code to see what it prints here.</p>
  }
  if (lines.length === 0) {
    return (
      <p className={styles.muted}>
        Nothing was printed. Printing a value (<code>console.log</code> in JavaScript,{' '}
        <code>print</code> in Python) is one of the best ways to see what your code is
        really doing.
      </p>
    )
  }
  return (
    <pre className={styles.output} aria-label="Printed output">
      {lines.join('\n')}
    </pre>
  )
}
