import type { Theme } from '../../hooks/useTheme'

interface ThemeControlProps {
  theme: Theme
  setTheme: (t: Theme) => void
}

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/** Segmented light / dark / system control. */
export function ThemeControl({ theme, setTheme }: ThemeControlProps) {
  return (
    <div className="theme-control" role="group" aria-label="Theme">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="theme-opt"
          aria-pressed={theme === opt.value}
          onClick={() => setTheme(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
