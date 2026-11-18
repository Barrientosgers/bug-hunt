import type { BadgeProgress } from '../progress/badges.ts'
import styles from './BadgeGallery.module.css'

/** Every badge, with progress. State is always written out, never shown by color alone. */
export function BadgeGallery({ badges }: { badges: BadgeProgress[] }) {
  return (
    <ul className={styles.grid}>
      {badges.map((badge) => {
        const shown = Math.min(badge.current, badge.target)
        const state = badge.earned ? 'earned' : badge.comingSoon ? 'soon' : 'locked'
        return (
          <li key={badge.id} className={styles.badge} data-state={state}>
            <h3 className={styles.name}>
              <span aria-hidden="true">{badge.earned ? '🏅' : '🔒'} </span>
              {badge.name}
            </h3>
            <p className={styles.description}>{badge.description}</p>
            {badge.comingSoon ? (
              <p className={styles.status}>Coming soon</p>
            ) : (
              <>
                <progress
                  className={styles.progress}
                  value={shown}
                  max={badge.target}
                  aria-label={`${badge.name} progress`}
                />
                <p className={styles.status}>
                  {badge.earned ? 'Earned' : `${shown} / ${badge.target}`}
                </p>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
