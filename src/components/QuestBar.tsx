import styles from './QuestBar.module.css'

const QUEST_STEPS = [
  { id: 'briefing', label: 'Briefing' },
  { id: 'journal', label: 'Journal' },
  { id: 'debug', label: 'Debug' },
  { id: 'review', label: 'Review' },
  { id: 'reward', label: 'Reward' },
] as const

export type QuestStepId = (typeof QUEST_STEPS)[number]['id']

/** Shows where the player is in the bug hunt. State is never shown by color alone. */
export function QuestBar({ current }: { current: QuestStepId }) {
  const currentIndex = QUEST_STEPS.findIndex((step) => step.id === current)

  return (
    <nav aria-label="Quest progress">
      <ol className={styles.bar}>
        {QUEST_STEPS.map((step, index) => {
          const state =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
          return (
            <li
              key={step.id}
              className={styles.step}
              data-state={state}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className={styles.dot} aria-hidden="true">
                {state === 'done' ? '✓' : index + 1}
              </span>
              <span className={styles.label}>{step.label}</span>
              {state === 'done' && <span className={styles.sr}>(done)</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
