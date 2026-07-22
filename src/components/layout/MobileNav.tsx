import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PROFILE } from '../../lib/content'
import type { Theme } from '../../hooks/useTheme'
import { useClock } from '../../hooks/useClock'
import { IconMenu, IconClose } from '../ui/Icons'
import { NAV, SOCIAL } from './nav-items'
import { ThemeControl } from './ThemeControl'

interface MobileNavProps {
  theme: Theme
  setTheme: (t: Theme) => void
  currentPage: string
  onNavigate: (path: string) => void
}

/** Mobile top bar + bottom-sheet drawer (icon-tile nav). */
export function MobileNav({ theme, setTheme, currentPage, onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const clock = useClock(PROFILE.timeZone)

  useEffect(() => {
    document.documentElement.classList.toggle('drawer-open', open)
    return () => document.documentElement.classList.remove('drawer-open')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const go = (path: string) => {
    setOpen(false)
    onNavigate(path)
  }

  return (
    <>
      <header className="mobilebar">
        <a
          className="mobilebar-logo"
          href="/"
          aria-label={PROFILE.name}
          onClick={(e) => {
            e.preventDefault()
            onNavigate('/')
          }}
        >
          <img src="/img/brand/nikos-pasion.png" alt={PROFILE.name} />
        </a>
        <button
          type="button"
          className="mobilebar-toggle"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <IconMenu />
        </button>
      </header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="drawer-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              data-lenis-prevent
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className="drawer-handle" aria-label="Close menu" onClick={() => setOpen(false)}>
                <span />
              </button>

              <p className="rail-label mono">TAGLINE</p>
              <p className="drawer-tagline">{PROFILE.tagline}</p>

              <p className="rail-label mono">NAVIGATION</p>
              <div className="drawer-grid">
                {NAV.map(({ path, label, Icon }) => (
                  <button
                    key={path}
                    type="button"
                    className="drawer-tile"
                    aria-current={
                      (path === '/' ? currentPage === 'home' : path === `/${currentPage}`)
                        ? 'page'
                        : undefined
                    }
                    onClick={() => go(path)}
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <p className="rail-label mono">SOCIAL</p>
              <div className="drawer-social">
                {SOCIAL.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="drawer-social-link"
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="me noopener noreferrer"
                  >
                    <Icon />
                  </a>
                ))}
              </div>

              <div className="drawer-footer">
                <div>
                  <p className="rail-label mono">THEME</p>
                  <ThemeControl theme={theme} setTheme={setTheme} />
                </div>
                <div className="drawer-clock">
                  <p className="rail-label mono">LOCAL</p>
                  <p className="mono">{clock}</p>
                </div>
              </div>

              <button className="drawer-close" aria-label="Close" onClick={() => setOpen(false)}>
                <IconClose />
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
