import { useCallback, useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

const KEY = 'np-theme'

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

function read(): Theme {
  const stored = localStorage.getItem(KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

/** Persisted light/dark/system theme, applied via `data-theme` on <html>. */
export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; cycle: () => void } {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === 'undefined' ? 'system' : read(),
  )

  useEffect(() => {
    apply(theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(KEY, t)
    setThemeState(t)
  }, [])

  const cycle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system'
      localStorage.setItem(KEY, next)
      return next
    })
  }, [])

  return { theme, setTheme, cycle }
}
