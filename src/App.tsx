import { useState } from 'react'
import { Bubble } from './components/Bubble.tsx'
import { CodeEditor } from './components/CodeEditor.tsx'
import { CodeReview } from './components/CodeReview.tsx'
import { ConsoleOutput } from './components/ConsoleOutput.tsx'
import { DebugJournal } from './components/DebugJournal.tsx'
import { HintLadder } from './components/HintLadder.tsx'
import { GameLayout } from './components/GameLayout.tsx'
import { LanguageSelect } from './components/LanguageSelect.tsx'
import { MentorNudge } from './components/MentorNudge.tsx'
import { QuestBar } from './components/QuestBar.tsx'
import { Tabs } from './components/Tabs.tsx'
import { TestResults } from './components/TestResults.tsx'
import { TimerBadge } from './components/TimerBadge.tsx'
import { listChallenges } from './content/loader.ts'
import {
  LANGUAGE_LABELS,
  LANGUAGES,
  type Challenge,
  type Language,
} from './content/types.ts'
import { pickLanguage, readSavedLanguage, saveLanguage } from './game/language.ts'
import { HINT_COST, HINT_COUNT, needsConfirmation } from './game/hints.ts'
import { headline, summarize } from './game/results.ts'
import { useChallengeFiles } from './game/useChallenge.ts'
import { buildReview } from './mentor/review.ts'
import { useCode } from './game/useCode.ts'
import { useHints } from './game/useHints.ts'
import { useJournal } from './game/useJournal.ts'
import { useRunTests } from './game/useRunTests.ts'
import { generateFlag } from './progress/flag.ts'
import { findSolve } from './progress/store.ts'
import { summarizeProgress } from './progress/summary.ts'
import { toLocalDay } from './progress/streak.ts'
import { useProgress } from './progress/useProgress.ts'
import { useTimer, useTimerHidden } from './game/useTimer.ts'
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
// Skills that at least one challenge exists for (badges for other skills say "coming soon").
const AVAILABLE_SKILLS = loaded.challenge
  ? [...new Set(listChallenges().map((challenge) => challenge.skill))]
  : []

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
  return <Game key={loaded.challenge.id} challenge={loaded.challenge} />
}

function Game({ challenge }: { challenge: Challenge }) {
  const available = LANGUAGES.filter((language) => challenge.languages[language])
  const [language, setLanguage] = useState<Language>(() =>
    pickLanguage(readSavedLanguage(), available),
  )
  const version = challenge.languages[language]
  const state = useChallengeFiles(challenge, language)
  const starter = state.status === 'ready' ? state.files.code : undefined
  const { code, setCode, reset, isEdited } = useCode(challenge.id, language, starter)
  const tests = state.status === 'ready' ? state.files.tests : undefined

  const runKey = `${challenge.id}:${language}`
  const { running, lastRun, history, runs, run } = useRunTests()
  const journal = useJournal(challenge.id, runs)
  const hints = useHints(challenge.id, language)
  const [hintNotice, setHintNotice] = useState(false)
  // When the player last engaged with Priya (took a hint or dismissed her offer).
  const [engagedAt, setEngagedAt] = useState<{
    key: string
    runIndex: number
    ms: number
  } | null>(null)
  const [resultsTab, setResultsTab] = useState('tests')
  // Only show results that belong to the language the player is looking at.
  const current = lastRun?.key === runKey ? lastRun : null
  const summary = current ? summarize(current.result) : null
  const stale = current !== null && current.ranCode !== code
  const progress = useProgress()
  const storedSolve = findSolve(progress.data, challenge.id, language)
  const progressSummary = summarizeProgress(
    progress.data,
    toLocalDay(new Date()),
    AVAILABLE_SKILLS,
  )
  // Solved earlier (saved) or just now.
  const solved = Boolean(storedSolve) || summary?.status === 'solved'
  const timer = useTimer(challenge.id, language, journal.unlocked, solved)
  const timerVisibility = useTimerHidden()
  const keyHistory = history.filter((entry) => entry.key === runKey)
  const engaged = engagedAt?.key === runKey ? engagedAt : null
  // Built from the saved solve, so the review is still there after a refresh.
  const review =
    storedSolve && starter !== undefined
      ? buildReview({
          challenge,
          language,
          starterCode: starter,
          finalCode: storedSolve.finalCode,
          journal: journal.state,
          hintsUsed: storedSolve.hintsUsed,
          runs: storedSolve.runs,
        })
      : null
  const questStep = solved ? 'review' : journal.unlocked ? 'debug' : 'journal'

  function markEngaged() {
    setEngagedAt({ key: runKey, runIndex: keyHistory.length, ms: timer.elapsedMs })
  }

  function revealHint() {
    const level = hints.nextLevel
    if (level === null) return
    if (
      needsConfirmation(level) &&
      !window.confirm(
        'The last hint nearly gives away the answer. Want to try one more thing first?\n\nOK = show it anyway. Cancel = keep trying.',
      )
    ) {
      return
    }
    hints.reveal()
    markEngaged()
    setResultsTab('hints')
    setHintNotice(true)
  }

  function runTests() {
    if (!journal.unlocked || code === undefined || tests === undefined) return
    setResultsTab('tests')
    setHintNotice(false)
    void run(runKey, language, code, tests, timer.elapsedMs).then((outcome) => {
      if (!outcome) return
      if (outcome.solved) {
        setResultsTab('review')
        progress.recordSolve({
          challengeId: challenge.id,
          number: challenge.number,
          language,
          difficulty: challenge.difficulty,
          skill: challenge.skill,
          solvedAt: Date.now(),
          day: toLocalDay(new Date()),
          runs: outcome.runNumber,
          hintsUsed: hints.used,
          elapsedMs: timer.elapsedMs,
          journalBeforeFirstRun:
            journal.state.status === 'written' && journal.state.entry.beforeFirstRun,
          bonusFound: outcome.bonusFound,
          flag: generateFlag(challenge.number, language),
          finalCode: code,
          isDaily: false,
        })
      }
      if (outcome.bonusFound) progress.recordBonus(challenge.id, language, code)
    })
  }

  function resetCode() {
    if (
      window.confirm(
        'Reset your code back to the starter code? Your changes will be lost.',
      )
    ) {
      reset()
    }
  }

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
      <DebugJournal state={journal.state} onSave={journal.save} onSkip={journal.skip} />
    </>
  )

  const editor = (
    <div className={styles.editor}>
      <div className={styles.editorHeader}>
        <span className={styles.fileName}>{version?.fileName}</span>
        <TimerBadge
          elapsedMs={timer.elapsedMs}
          hidden={timerVisibility.hidden}
          onToggle={timerVisibility.toggle}
          running={timer.running}
        />
        <LanguageSelect
          languages={available}
          value={language}
          onChange={changeLanguage}
        />
      </div>
      {!journal.unlocked && (
        <p role="status" className={styles.lockBanner}>
          <span>
            <span aria-hidden="true">✍️ </span>Write your hypothesis in the Debug journal
            first (it is in the Ticket panel) for +2 XP, or skip it.
          </span>
          <button type="button" onClick={journal.skip}>
            Skip the journal
          </button>
        </p>
      )}
      <div className={styles.codeArea}>
        {state.status === 'loading' && <p className={styles.muted}>Loading the code…</p>}
        {state.status === 'error' && (
          <p role="alert" className={styles.error}>
            Could not load the code. {state.message}
          </p>
        )}
        {state.status === 'ready' && code !== undefined && (
          <CodeEditor
            path={`${challenge.id}/${version?.fileName}`}
            language={language}
            value={code}
            onChange={setCode}
            onRun={runTests}
            readOnly={!journal.unlocked}
          />
        )}
      </div>
      <MentorNudge
        key={runKey}
        history={keyHistory}
        elapsedMs={timer.elapsedMs}
        engaged={engaged}
        solved={solved}
        unlocked={journal.unlocked}
        nextHintLevel={hints.nextLevel}
        onShowHint={revealHint}
        onDismiss={markEngaged}
      />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={runTests}
          disabled={
            !journal.unlocked || running || code === undefined || tests === undefined
          }
        >
          {running ? 'Running…' : '▶ Run tests'}
        </button>
        <button type="button" onClick={revealHint} disabled={hints.nextLevel === null}>
          {hints.nextLevel === null
            ? '💡 All hints used'
            : `💡 Hint ${hints.nextLevel} of ${HINT_COUNT} (−${HINT_COST} XP)`}
        </button>
        <button type="button" onClick={resetCode} disabled={!isEdited}>
          ↺ Reset code
        </button>
      </div>
      <p role="status" className={styles.runStatus}>
        {running
          ? 'Running your code…'
          : hintNotice
            ? `Hint ${hints.used} is ready: open Results › Hints.`
            : summary
              ? `Last run: ${headline(summary)}${stale ? ' (before your latest edit)' : ''}`
              : ''}
      </p>
      <p className={styles.keyboardHelp}>
        Tip: Ctrl+Enter (Cmd+Enter on a Mac) runs the tests. Keyboard users: press Ctrl+M
        (Ctrl+Shift+M on a Mac) to let the Tab key move focus out of the editor.
      </p>
    </div>
  )

  // The Review tab only exists once the bug is solved; fall back to Tests if it goes away.
  const openTab = resultsTab === 'review' && !review ? 'tests' : resultsTab
  const results = (
    <Tabs
      label="Results"
      selectedId={openTab}
      onSelect={setResultsTab}
      tabs={[
        {
          id: 'tests',
          label: 'Tests',
          content: <TestResults summary={summary} running={running} stale={stale} />,
        },
        {
          id: 'hints',
          label: hints.used > 0 ? `Hints (${hints.used})` : 'Hints',
          content: <HintLadder hints={version?.hints ?? []} used={hints.used} />,
        },
        ...(review
          ? [
              {
                id: 'review',
                label: 'Review',
                content: <CodeReview review={review} />,
              },
            ]
          : []),
        {
          id: 'console',
          label: 'Console',
          content: <ConsoleOutput lines={current ? current.result.console : null} />,
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
        <QuestBar current={questStep} />
        <div className={styles.right}>
          <span className={styles.rank}>
            {progressSummary.rank.rank.name} · {progressSummary.totalXp} XP
          </span>
          {progressSummary.currentStreak > 0 && (
            <span className={styles.rank}>
              <span aria-hidden="true">🔥 </span>
              {progressSummary.currentStreak}-day streak
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className={styles.main}>
        <GameLayout ticket={ticket} editor={editor} results={results} />
      </main>
    </div>
  )
}
