import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { readStoredTheme, resolveTheme, saveTheme, type Theme } from './theme.ts'
import { ThemeContext } from './themeContext.ts'

function currentTheme(): Theme {
  // index.html sets data-theme before the first paint; fall back to resolving it here.
  const fromPage = document.documentElement.dataset.theme
  if (fromPage === 'dark' || fromPage === 'light') return fromPage
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  return resolveTheme(readStoredTheme(), systemPrefersLight)
}

/** One shared theme for the whole app, so the page and the code editor always agree. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    saveTheme(next)
    setTheme(next)
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
