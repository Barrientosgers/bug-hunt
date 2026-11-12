import styles from './ThemeToggle.module.css'
import { useTheme } from './useTheme.ts'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button type="button" className={styles.toggle} onClick={toggleTheme}>
      <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
      <span className={styles.label}>{`Switch to ${next} theme`}</span>
    </button>
  )
}
