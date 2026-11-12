import challenge from '../content/challenges/001-leaderboard/challenge.json'
import { Bubble } from './components/Bubble.tsx'
import { GameLayout } from './components/GameLayout.tsx'
import { QuestBar } from './components/QuestBar.tsx'
import { Tabs } from './components/Tabs.tsx'
import type { Character } from './content/types.ts'
import { DevRunnerDemo } from './DevRunnerDemo.tsx'
import { ThemeToggle } from './theme/ThemeToggle.tsx'
import { APP_TITLE } from './config'
import styles from './App.module.css'

// Step 1 shell: the ticket text comes from the real challenge file, but nothing else is
// wired up yet. Step 2 loads challenges properly, step 3 adds the editor.
export default function App() {
  const ticket = (
    <>
      <h2 className={styles.ticketTitle}>
        Ticket #{String(challenge.number).padStart(3, '0')}
      </h2>
      <Bubble character={challenge.character as Character}>
        <p>
          <strong>{challenge.ticket.subject}</strong>
        </p>
        <p>{challenge.ticket.body}</p>
      </Bubble>
      <Bubble character="priya">
        <p>{challenge.briefing}</p>
      </Bubble>
    </>
  )

  const editor = (
    <div className={styles.editorPlaceholder}>
      <p>The code editor arrives in step 3.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} disabled>
          ▶ Run tests
        </button>
        <button type="button" disabled>
          💡 Hint (−2 XP)
        </button>
      </div>
    </div>
  )

  const results = (
    <Tabs
      label="Results"
      tabs={[
        { id: 'tests', label: 'Tests', content: <DevRunnerDemo /> },
        {
          id: 'console',
          label: 'Console',
          content: <p className={styles.muted}>Nothing printed yet.</p>,
        },
        {
          id: 'journal',
          label: 'Journal',
          content: (
            <p className={styles.muted}>
              “I think the bug is in ___ because ___” (coming in step 5)
            </p>
          ),
        },
      ]}
    />
  )

  return (
    <div className={styles.app}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className={styles.topbar}>
        <h1 className={styles.logo}>
          <span aria-hidden="true">🐞</span> {APP_TITLE}
        </h1>
        <QuestBar current="debug" />
        <div className={styles.right}>
          <span className={styles.rank}>Rank: Intern</span>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className={styles.main}>
        <GameLayout ticket={ticket} editor={editor} results={results} />
      </main>
    </div>
  )
}
