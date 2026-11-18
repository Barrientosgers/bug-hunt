import { useMemo } from 'react'
import { dailyChallenge } from '../game/daily.ts'
import { hrefs } from '../hooks/route.ts'
import {
  LANGUAGES,
  LANGUAGE_LABELS,
  SKILL_LABELS,
  type Challenge,
} from '../content/types.ts'
import { loadProgress, findSolve } from '../progress/store.ts'
import { toLocalDay } from '../progress/streak.ts'
import { ThemeToggle } from '../theme/ThemeToggle.tsx'
import { APP_TITLE } from '../config'
import styles from './PracticePage.module.css'

/** Every bug in the library. Solved state is read fresh each time the page opens. */
export function PracticePage({ challenges }: { challenges: Challenge[] }) {
  const today = toLocalDay(new Date())
  const daily = dailyChallenge(challenges, today)
  const data = useMemo(() => loadProgress(), [])

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
        <h2 className={styles.title}>Practice library</h2>
        <p className={styles.muted}>
          Every bug so far. Practice bugs give flags and skill points; today&apos;s daily
          bug also gives bonus XP.
        </p>
        <ul className={styles.list}>
          {challenges.map((challenge) => (
            <li key={challenge.id} className={styles.card}>
              <div className={styles.head}>
                <span className={styles.number}>#{challenge.number}</span>
                <a className={styles.name} href={hrefs.play(challenge.id)}>
                  {challenge.title}
                </a>
                {challenge.id === daily.id && <span className={styles.daily}>Daily</span>}
              </div>
              <p className={styles.meta}>
                {challenge.difficulty} · {SKILL_LABELS[challenge.skill]}
              </p>
              <ul className={styles.langs}>
                {LANGUAGES.filter((language) => challenge.languages[language]).map(
                  (language) => (
                    <li key={language}>
                      {LANGUAGE_LABELS[language]}:{' '}
                      <strong>
                        {findSolve(data, challenge.id, language)
                          ? '✓ Solved'
                          : 'Not solved'}
                      </strong>
                    </li>
                  ),
                )}
              </ul>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
