import { hrefs } from '../hooks/route.ts'
import { Bubble } from './Bubble.tsx'
import styles from './IntroBanner.module.css'

/** A short welcome for first-time players. It is a normal element, not a pop-up. */
export function IntroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <section className={styles.banner} aria-labelledby="intro-title">
      <Bubble character="priya">
        <h3 id="intro-title" className={styles.title}>
          Welcome to Snackr! You&apos;re our new engineer.
        </h3>
        <p>Each day a bug ticket lands on your desk. Here is how it works:</p>
        <ol className={styles.steps}>
          <li>Read the ticket and write a guess about where the bug is.</li>
          <li>Fix the code and run the tests. Hints are there if you get stuck.</li>
          <li>Learn the lesson and earn your flag.</li>
        </ol>
        <p>Getting stuck is normal. That is how debugging works.</p>
      </Bubble>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onDismiss}>
          Got it
        </button>
        <a href={hrefs.practice}>See the practice library</a>
      </div>
    </section>
  )
}
