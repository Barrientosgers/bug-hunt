import { useId, useState, type FormEvent } from 'react'
import { validateJournal, type JournalState } from '../game/journal.ts'
import styles from './DebugJournal.module.css'

interface DebugJournalProps {
  state: JournalState
  onSave: (where: string, because: string) => void
  onSkip: () => void
}

/** "I think the bug is in ___ because ___": a hypothesis before touching the code. */
export function DebugJournal({ state, onSave, onSkip }: DebugJournalProps) {
  const uid = useId()
  const entry = state.status === 'written' ? state.entry : null
  const [where, setWhere] = useState(entry?.where ?? '')
  const [because, setBecause] = useState(entry?.because ?? '')
  const [editing, setEditing] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const errors = validateJournal(where, because)
  const showForm = state.status !== 'written' || editing

  function submit(event: FormEvent) {
    event.preventDefault()
    setAttempted(true)
    if (errors.where || errors.because) return
    onSave(where, because)
    setEditing(false)
    setAttempted(false)
  }

  function cancelEdit() {
    setWhere(entry?.where ?? '')
    setBecause(entry?.because ?? '')
    setEditing(false)
    setAttempted(false)
  }

  return (
    <section className={styles.journal} aria-labelledby={`${uid}-title`}>
      <h3 id={`${uid}-title`} className={styles.title}>
        <span aria-hidden="true">🧠 </span>Debug journal
      </h3>

      {!showForm && entry ? (
        <>
          <p className={styles.sentence}>
            I think the bug is in <strong>{entry.where}</strong> because{' '}
            <strong>{entry.because}</strong>.
          </p>
          <button type="button" onClick={() => setEditing(true)}>
            Edit hypothesis
          </button>
        </>
      ) : (
        <form onSubmit={submit} noValidate>
          {state.status === 'none' && (
            <p className={styles.help}>
              Before you touch the code, make a guess. Being wrong is fine: this is how
              detectives work. Writing it down earns +2 XP.
            </p>
          )}
          {state.status === 'skipped' && (
            <p className={styles.help}>
              You skipped the journal. Writing a hypothesis still helps you think, but the
              +2 XP is only for one written before your first test run.
            </p>
          )}
          <label htmlFor={`${uid}-where`} className={styles.label}>
            I think the bug is in…
          </label>
          <input
            id={`${uid}-where`}
            className={styles.input}
            value={where}
            onChange={(event) => setWhere(event.target.value)}
            placeholder="e.g. the function that sorts the list"
            aria-invalid={attempted && Boolean(errors.where)}
            aria-describedby={
              attempted && errors.where ? `${uid}-where-error` : undefined
            }
          />
          {attempted && errors.where && (
            <p id={`${uid}-where-error`} className={styles.error}>
              {errors.where}
            </p>
          )}
          <label htmlFor={`${uid}-because`} className={styles.label}>
            …because
          </label>
          <textarea
            id={`${uid}-because`}
            className={styles.input}
            rows={3}
            value={because}
            onChange={(event) => setBecause(event.target.value)}
            placeholder="e.g. the order looks wrong when scores have different lengths"
            aria-invalid={attempted && Boolean(errors.because)}
            aria-describedby={
              attempted && errors.because ? `${uid}-because-error` : undefined
            }
          />
          {attempted && errors.because && (
            <p id={`${uid}-because-error`} className={styles.error}>
              {errors.because}
            </p>
          )}
          <div className={styles.actions}>
            <button type="submit" className={styles.primary}>
              Save hypothesis
            </button>
            {state.status === 'none' && (
              <button type="button" onClick={onSkip}>
                Skip, I&apos;ll dive in
              </button>
            )}
            {editing && (
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
