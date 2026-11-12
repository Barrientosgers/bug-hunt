import { useCallback, useState } from 'react'
import { readStoredTheme, resolveTheme, saveTheme, type Theme } from './theme.ts'

function currentTheme(): Theme {
  // index.html sets data-theme before the first paint; fall back to resolving it here.
  const fromPage = document.documentElement.dataset.theme
  if (fromPage === 'dark' || fromPage === 'light') return fromPage
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  return resolveTheme(readStoredTheme(), systemPrefersLight)
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    saveTheme(next)
    setTheme(next)
  }, [theme])

  return { theme, toggleTheme }
}
