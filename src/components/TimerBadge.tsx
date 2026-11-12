import { formatDuration } from '../game/timer.ts'
import styles from './TimerBadge.module.css'

interface TimerBadgeProps {
  elapsedMs: number
  hidden: boolean
  onToggle: () => void
  /** False before the journal step is done, and after the bug is solved. */
  running: boolean
}

/** A calm clock. It is information for the "fast solve" bonus, never a countdown. */
export function TimerBadge({ elapsedMs, hidden, onToggle, running }: TimerBadgeProps) {
  return (
    <div className={styles.timer}>
      {!hidden && (
        <span className={styles.time} data-paused={!running}>
          <span aria-hidden="true">⏱ </span>
          <span className={styles.sr}>Time spent: </span>
          {formatDuration(elapsedMs)}
        </span>
      )}
      <button type="button" className={styles.toggle} onClick={onToggle}>
        {hidden ? 'Show timer' : 'Hide timer'}
      </button>
    </div>
  )
}
