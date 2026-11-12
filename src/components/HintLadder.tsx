import { HINT_COST, HINT_COUNT, hintTitle } from '../game/hints.ts'
import { Bubble } from './Bubble.tsx'
import styles from './HintLadder.module.css'

interface HintLadderProps {
  /** The hint texts for the current language, level 1 first. */
  hints: string[]
  /** How many have been revealed. */
  used: number
}

/** Priya's hints, one at a time. Each one teaches a debugging method. */
export function HintLadder({ hints, used }: HintLadderProps) {
  return (
    <div>
      {used === 0 && (
        <p className={styles.muted}>
          No hints yet, and that is fine. Hints come in {HINT_COUNT} steps: first a
          debugging method, and only at the end the full explanation. Each costs{' '}
          {HINT_COST} XP, but solving the bug still counts. Use the <strong>Hint</strong>{' '}
          button whenever you want help.
        </p>
      )}
      <div aria-live="polite">
        {hints.slice(0, used).map((text, index) => (
          <Bubble key={index} character="priya">
            <p>
              <strong>
                Hint {index + 1} of {HINT_COUNT} · {hintTitle(index + 1)}
              </strong>
            </p>
            <p>{text}</p>
          </Bubble>
        ))}
      </div>
    </div>
  )
}
