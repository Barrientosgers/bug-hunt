import { useMemo } from 'react'
import type { Skill } from '../content/types.ts'
import { hrefs } from '../hooks/route.ts'
import { loadProgress } from '../progress/store.ts'
import { toLocalDay } from '../progress/streak.ts'
import { summarizeProgress } from '../progress/summary.ts'
import { ThemeToggle } from '../theme/ThemeToggle.tsx'
import { APP_TITLE } from '../config'
import { BadgeGallery } from './BadgeGallery.tsx'
import { Heatmap } from './Heatmap.tsx'
import { SkillMap } from './SkillMap.tsx'
import styles from './ProgressPage.module.css'

/** Everything here is worked out from the saved solves; the page stores nothing itself. */
export function ProgressPage({ availableSkills }: { availableSkills: Skill[] }) {
  const today = toLocalDay(new Date())
  // Read fresh each time the page opens, so a bug solved a moment ago is included.
  const summary = useMemo(
    () => summarizeProgress(loadProgress(), today, availableSkills),
    [today, availableSkills],
  )
  const { rank } = summary

  return (
    <div className={styles.page}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className={styles.topbar}>
        <h1 className={styles.logo}>
          <span aria-hidden="true">🐞</span> {APP_TITLE}
        </h1>
        <div className={styles.right}>
          <a className={styles.link} href={hrefs.daily}>
            ← Back to the game
          </a>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className={styles.main}>
        <h2 className={styles.title}>Your progress</h2>

        {summary.solvedCount === 0 && (
          <p className={styles.empty}>
            Nothing here yet, and that is fine. Solve your first bug and this page fills
            up. <a href={hrefs.daily}>Go to today&apos;s bug</a>.
          </p>
        )}

        <section className={styles.panel} aria-labelledby="rank-heading">
          <h3 id="rank-heading">Rank</h3>
          <p className={styles.rank}>
            {rank.rank.name} · {summary.totalXp} XP
          </p>
          <progress
            className={styles.bar}
            value={rank.progress}
            max={1}
            aria-label="Progress to next rank"
          />
          <p className={styles.muted}>
            {rank.next
              ? `${rank.xpSpan - rank.xpIntoRank} XP to ${rank.next.name}`
              : 'You reached the top rank.'}
          </p>
          <dl className={styles.stats}>
            <div>
              <dt>Bugs solved</dt>
              <dd>{summary.solvedCount}</dd>
            </div>
            <div>
              <dt>Current streak</dt>
              <dd>{summary.currentStreak} days</dd>
            </div>
            <div>
              <dt>Best streak</dt>
              <dd>{summary.bestStreak} days</dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="heatmap-heading">
          <h3 id="heatmap-heading">Solved days</h3>
          <Heatmap solvesPerDay={summary.solvesPerDay} today={today} />
        </section>

        <section className={styles.panel} aria-labelledby="skills-heading">
          <h3 id="skills-heading">Skill map</h3>
          <SkillMap skillPoints={summary.skillPoints} availableSkills={availableSkills} />
        </section>

        <section className={styles.panel} aria-labelledby="badges-heading">
          <h3 id="badges-heading">Badges</h3>
          <BadgeGallery badges={summary.badges} />
        </section>
      </main>
    </div>
  )
}
