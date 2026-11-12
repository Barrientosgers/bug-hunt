import { useState } from 'react'
import { Bubble } from './components/Bubble.tsx'
import { GameLayout } from './components/GameLayout.tsx'
import { LanguageSelect } from './components/LanguageSelect.tsx'
import { QuestBar } from './components/QuestBar.tsx'
import { Tabs } from './components/Tabs.tsx'
import { listChallenges } from './content/loader.ts'
import {
  LANGUAGE_LABELS,
  LANGUAGES,
  type Challenge,
  type Language,
} from './content/types.ts'
import { DevRunnerDemo } from './DevRunnerDemo.tsx'
import { pickLanguage, readSavedLanguage, saveLanguage } from './game/language.ts'
import { useChallengeFiles } from './game/useChallenge.ts'
import { ThemeToggle } from './theme/ThemeToggle.tsx'
import { APP_TITLE } from './config'
import styles from './App.module.css'

// For now the game always shows the first challenge. Phase 6 adds the daily bug and the
// practice library.
function firstChallenge(): { challenge?: Challenge; error?: string } {
  try {
    return { challenge: listChallenges()[0] }
  } catch (error) {
    return { error: String(error) }
  }
}

const loaded = firstChallenge()

export default function App() {
  if (!loaded.challenge) {
    return (
      <main className={styles.fatal}>
        <h1>{APP_TITLE}</h1>
        <p>We could not load today&apos;s bug.</p>
        <pre>{loaded.error ?? 'No challenges found.'}</pre>
      </main>
    )
  }
  return <Game challenge={loaded.challenge} />
}

function Game({ challenge }: { challenge: Challenge }) {
  const available = LANGUAGES.filter((language) => challenge.languages[language])
  const [language, setLanguage] = useState<Language>(() =>
    pickLanguage(readSavedLanguage(), available),
  )
  const version = challenge.languages[language]
  const state = useChallengeFiles(challenge, language)

  function changeLanguage(next: Language) {
    setLanguage(next)
    saveLanguage(next)
  }

  const ticket = (
    <>
      <h2 className={styles.ticketTitle}>
        Ticket #{String(challenge.number).padStart(3, '0')}
        {challenge.languageSpecific && (
          <span className={styles.badge}>
            {LANGUAGE_LABELS[challenge.languageSpecific]} bug
          </span>
        )}
      </h2>
      <Bubble character={challenge.character}>
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
    <div className={styles.editor}>
      <div className={styles.editorHeader}>
        <span className={styles.fileName}>{version?.fileName}</span>
        <LanguageSelect
          languages={available}
          value={language}
          onChange={changeLanguage}
        />
      </div>
      <div className={styles.codeArea}>
        {state.status === 'loading' && <p className={styles.muted}>Loading the code…</p>}
        {state.status === 'error' && (
          <p role="alert" className={styles.error}>
            Could not load the code. {state.message}
          </p>
        )}
        {state.status === 'ready' && (
          <pre aria-label="Starter code (read-only until the editor arrives in step 3c)">
            <code>{state.files.code}</code>
          </pre>
        )}
      </div>
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
        {
          id: 'tests',
          label: 'Tests',
          content: (
            <DevRunnerDemo
              language={language}
              code={state.status === 'ready' ? state.files.code : undefined}
              tests={state.status === 'ready' ? state.files.tests : undefined}
            />
          ),
        },
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
