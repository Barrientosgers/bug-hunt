import type { ReactNode } from 'react'
import { Tabs } from './Tabs.tsx'
import { useMediaQuery } from './useMediaQuery.ts'
import styles from './GameLayout.module.css'

interface GameLayoutProps {
  ticket: ReactNode
  editor: ReactNode
  results: ReactNode
}

/**
 * Desktop: ticket on the left, editor above results on the right.
 * Mobile: one pane at a time, switched with tabs.
 */
export function GameLayout({ ticket, editor, results }: GameLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 860px)')

  if (isMobile) {
    return (
      <Tabs
        label="Game panes"
        className={styles.mobile}
        tabs={[
          { id: 'ticket', label: 'Ticket', content: ticket },
          { id: 'code', label: 'Code', content: editor },
          { id: 'results', label: 'Results', content: results },
        ]}
      />
    )
  }

  return (
    <div className={styles.desktop}>
      <section className={`${styles.pane} ${styles.ticket}`} aria-label="Ticket">
        {ticket}
      </section>
      <section className={`${styles.pane} ${styles.editor}`} aria-label="Code editor">
        {editor}
      </section>
      <section className={`${styles.pane} ${styles.results}`} aria-label="Results">
        {results}
      </section>
    </div>
  )
}
