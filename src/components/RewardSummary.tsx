import { useId, useState } from 'react'
import { LANGUAGE_LABELS, SKILL_LABELS } from '../content/types.ts'
import type { BadgeProgress } from '../progress/badges.ts'
import type { RankInfo } from '../progress/ranks.ts'
import type { Solve } from '../progress/types.ts'
import type { XpBreakdown } from '../progress/xp.ts'
import { copyText } from './copy.ts'
import styles from './RewardSummary.module.css'

interface RewardSummaryProps {
  solve: Solve
  breakdown: XpBreakdown
  /** Where the player stands now. */
  rank: RankInfo
  /** Set only right after solving: the rank the player just reached. */
  rankUp?: string | null
  skillGain: number
  skillTotal: number
  /** Set only right after solving: badges this solve earned. */
  newBadges?: BadgeProgress[]
  streak: number
  shareText: string
}

const signed = (xp: number) => (xp < 0 ? `−${Math.abs(xp)}` : `+${xp}`)

/** Copies text and tells the player what happened. Falls back to showing it to copy by hand. */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copy() {
    setState((await copyText(text)) ? 'copied' : 'failed')
  }

  return (
    <>
      <button type="button" onClick={() => void copy()}>
        {label}
      </button>
      <span role="status" className={styles.copyStatus}>
        {state === 'copied' && 'Copied!'}
        {state === 'failed' &&
          'Could not copy automatically. Select the text and press Ctrl+C.'}
      </span>
    </>
  )
}

/** Everything the player earned for one solve. Used by the reward dialog and the Reward tab. */
export function RewardSummary(props: RewardSummaryProps) {
  const { solve, breakdown, rank, rankUp, newBadges = [] } = props
  // The summary can be on screen twice (dialog and tab), so ids must be unique per copy.
  const uid = useId()

  return (
    <div className={styles.summary}>
      <section aria-labelledby={`${uid}-flag`}>
        <h3 id={`${uid}-flag`} className={styles.heading}>
          Your flag
        </h3>
        <p className={styles.flagRow}>
          <code className={styles.flag}>{solve.flag}</code>
          <CopyButton text={solve.flag} label="Copy flag" />
        </p>
        <p className={styles.note}>
          This flag marks your personal progress. It is made in your browser, so it is not
          tamper-proof.
        </p>
      </section>

      <section aria-labelledby={`${uid}-xp`}>
        <h3 id={`${uid}-xp`} className={styles.heading}>
          XP earned
        </h3>
        <table className={styles.xpTable}>
          <tbody>
            {breakdown.lines.map((line) => (
              <tr key={line.id}>
                <th scope="row">{line.label}</th>
                <td data-negative={line.xp < 0}>{signed(line.xp)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td>{signed(breakdown.total)} XP</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section aria-labelledby={`${uid}-rank`}>
        <h3 id={`${uid}-rank`} className={styles.heading}>
          Rank
        </h3>
        {rankUp && (
          <p className={styles.rankUp}>
            <span aria-hidden="true">🎖 </span>Rank up! You are now a {rankUp}.
          </p>
        )}
        <p className={styles.rankName}>{rank.rank.name}</p>
        {rank.next ? (
          <>
            <progress
              className={styles.bar}
              value={rank.xpIntoRank}
              max={rank.xpSpan}
              aria-label={`Progress to ${rank.next.name}`}
            />
            <p className={styles.note}>
              {rank.xpIntoRank} of {rank.xpSpan} XP toward {rank.next.name}
            </p>
          </>
        ) : (
          <p className={styles.note}>You have reached the top rank.</p>
        )}
      </section>

      <section aria-labelledby={`${uid}-skills`}>
        <h3 id={`${uid}-skills`} className={styles.heading}>
          Skill points
        </h3>
        <p className={styles.line}>
          +{props.skillGain} {SKILL_LABELS[solve.skill]} (
          {LANGUAGE_LABELS[solve.language]}), now {props.skillTotal} in total
        </p>
        {props.streak > 0 && (
          <p className={styles.line}>
            <span aria-hidden="true">🔥 </span>
            {props.streak}-day streak
          </p>
        )}
      </section>

      {newBadges.length > 0 && (
        <section aria-labelledby={`${uid}-badges`}>
          <h3 id={`${uid}-badges`} className={styles.heading}>
            New {newBadges.length === 1 ? 'badge' : 'badges'}
          </h3>
          <ul className={styles.badges}>
            {newBadges.map((badge) => (
              <li key={badge.id}>
                <strong>
                  <span aria-hidden="true">🏅 </span>
                  {badge.name}
                </strong>
                <span className={styles.note}> {badge.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby={`${uid}-share`}>
        <h3 id={`${uid}-share`} className={styles.heading}>
          Share your result
        </h3>
        <pre className={styles.share} aria-label="Result to share">
          {props.shareText}
        </pre>
        <p>
          <CopyButton text={props.shareText} label="Copy result" />
        </p>
        <p className={styles.note}>
          No spoilers: it shows how the hunt went, never the code or the answer.
        </p>
      </section>
    </div>
  )
}
