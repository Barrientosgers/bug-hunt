import { useState } from 'react'
import { HINT_COST } from '../game/hints.ts'
import { nudgeMessage, stuckReason, type RunPoint } from '../mentor/stuck.ts'
import { Bubble } from './Bubble.tsx'
import styles from './MentorNudge.module.css'

interface MentorNudgeProps {
  /** Runs for the language on screen. */
  history: RunPoint[]
  elapsedMs: number
  /** When the player last engaged with Priya (dismissed her, or took a hint). */
  engaged: { runIndex: number; ms: number } | null
  solved: boolean
  unlocked: boolean
  nextHintLevel: number | null
  onShowHint: () => void
  onDismiss: () => void
}

/**
 * Priya noticing that the player might be stuck. Render it with `key` set to the current
 * challenge and language: the component remembers the moment it first appeared, so time
 * spent in an earlier visit never triggers an offer right after a refresh.
 */
export function MentorNudge(props: MentorNudgeProps) {
  const [openedAtMs] = useState(props.elapsedMs)

  const reason = stuckReason({
    history: props.history,
    engagedRunIndex: props.engaged?.runIndex ?? 0,
    engagedMs: Math.max(openedAtMs, props.engaged?.ms ?? 0),
    nowMs: props.elapsedMs,
    solved: props.solved,
    unlocked: props.unlocked,
  })

  const message = reason ? nudgeMessage(reason, props.nextHintLevel) : null

  // The live region stays mounted, so screen readers announce the message when it appears.
  return (
    <div aria-live="polite" className={styles.region}>
      {reason && message && (
        <NudgeCard
          text={message.text}
          offersHint={message.offersHint}
          nextHintLevel={props.nextHintLevel}
          onShowHint={props.onShowHint}
          onDismiss={props.onDismiss}
          dismissLabel={reason === 'not-started' ? 'Got it' : "I'm okay, keep going"}
        />
      )}
    </div>
  )
}

interface NudgeCardProps {
  text: string
  offersHint: boolean
  nextHintLevel: number | null
  dismissLabel: string
  onShowHint: () => void
  onDismiss: () => void
}

function NudgeCard({
  text,
  offersHint,
  nextHintLevel,
  dismissLabel,
  onShowHint,
  onDismiss,
}: NudgeCardProps) {
  return (
    <div className={styles.card}>
      <Bubble character="priya">
        <p>{text}</p>
      </Bubble>
      <div className={styles.actions}>
        {offersHint && nextHintLevel !== null && (
          <button type="button" className={styles.primary} onClick={onShowHint}>
            Show hint {nextHintLevel} (−{HINT_COST} XP)
          </button>
        )}
        <button type="button" onClick={onDismiss}>
          {dismissLabel}
        </button>
      </div>
    </div>
  )
}
