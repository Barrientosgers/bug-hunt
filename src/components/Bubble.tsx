import type { ReactNode } from 'react'
import type { Character } from '../content/types.ts'
import styles from './Bubble.module.css'

const PEOPLE: Record<Character, { name: string; role: string }> = {
  priya: { name: 'Priya', role: 'Tech Lead' },
  maya: { name: 'Maya', role: 'Product Manager' },
  leo: { name: 'Leo', role: 'Customer Support' },
}

/** A chat-style message from one of the Snackr team. */
export function Bubble({
  character,
  children,
}: {
  character: Character
  children: ReactNode
}) {
  const person = PEOPLE[character]
  return (
    <article className={styles.bubble} aria-label={`Message from ${person.name}`}>
      <div className={styles.avatar} data-character={character} aria-hidden="true">
        {person.name[0]}
      </div>
      <div className={styles.body}>
        <p className={styles.who}>
          <strong>{person.name}</strong> <span>· {person.role}</span>
        </p>
        <div className={styles.text}>{children}</div>
      </div>
    </article>
  )
}
