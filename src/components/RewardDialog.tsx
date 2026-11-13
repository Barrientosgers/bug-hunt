import { useEffect, useRef, type ReactNode } from 'react'
import styles from './RewardDialog.module.css'

interface RewardDialogProps {
  open: boolean
  onClose: () => void
  onSeeReview: () => void
  children: ReactNode
}

/**
 * The celebration after solving a bug. It uses the browser's built-in <dialog>, which traps
 * keyboard focus inside, closes with Esc, and returns focus to where the player was.
 */
export function RewardDialog({
  open,
  onClose,
  onSeeReview,
  children,
}: RewardDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="reward-title"
      onClose={onClose}
      // A click on the dark backdrop (outside the content) also closes it.
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close()
      }}
    >
      <div className={styles.content}>
        <h2 id="reward-title" className={styles.title}>
          <span aria-hidden="true">🎉 </span>Bug captured!
        </h2>
        {children}
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onSeeReview}>
            See Priya&apos;s review
          </button>
          <button type="button" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  )
}
