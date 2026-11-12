import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import styles from './Tabs.module.css'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  /** Accessible name for the tab list, e.g. "Results". */
  label: string
  tabs: TabItem[]
  className?: string
  /** Optional: control which tab is open from outside (e.g. jump to "Tests" after a run). */
  selectedId?: string
  onSelect?: (id: string) => void
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern): arrow keys move between tabs, Home/End jump
 * to the first/last, and only the active tab is in the Tab order. Inactive panels stay
 * mounted but hidden, so things like the code editor keep their state.
 */
export function Tabs({ label, tabs, className, selectedId, onSelect }: TabsProps) {
  const uid = useId()
  const [ownActiveId, setOwnActiveId] = useState(tabs[0].id)
  const activeId = selectedId ?? ownActiveId
  function setActiveId(id: string) {
    setOwnActiveId(id)
    onSelect?.(id)
  }
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(event: KeyboardEvent) {
    const index = tabs.findIndex((tab) => tab.id === activeId)
    const last = tabs.length - 1
    let next: number
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return
    event.preventDefault()
    setActiveId(tabs[next].id)
    buttons.current[next]?.focus()
  }

  return (
    <div className={`${styles.tabs} ${className ?? ''}`}>
      <div
        role="tablist"
        aria-label={label}
        className={styles.list}
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${tab.id}`}
            aria-selected={tab.id === activeId}
            aria-controls={`${uid}-panel-${tab.id}`}
            tabIndex={tab.id === activeId ? 0 : -1}
            className={styles.tab}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${uid}-panel-${tab.id}`}
          aria-labelledby={`${uid}-tab-${tab.id}`}
          hidden={tab.id !== activeId}
          tabIndex={0}
          className={styles.panel}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
