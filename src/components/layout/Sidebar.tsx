import { PROFILE } from '../../lib/content'
import type { Theme } from '../../hooks/useTheme'
import { useClock } from '../../hooks/useClock'
import { NAV, SOCIAL } from './nav-items'
import { ThemeControl } from './ThemeControl'
import { Corners } from '../ui/Corners'

interface SidebarProps {
  theme: Theme
  setTheme: (t: Theme) => void
  currentPage: string
  onNavigate: (path: string) => void
}

function Label({ children }: { children: string }) {
  return <p className="rail-label mono">{children}</p>
}

function isActive(path: string, page: string): boolean {
  return path === '/' ? page === 'home' : path === `/${page}`
}

/** Fixed desktop sidebar — blocks: logo, page nav, social, settings. */
export function Sidebar({ theme, setTheme, currentPage, onNavigate }: SidebarProps) {
  const clock = useClock(PROFILE.timeZone)

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="rail-block">
        <Label>01_LOGO</Label>
        <div className="rail-frame">
          <Corners />
          <a
            className="rail-logo"
            href="/"
            aria-label={PROFILE.name}
            onClick={(e) => {
              e.preventDefault()
              onNavigate('/')
            }}
          >
            <img className="rail-logo-img" src="/img/brand/nikos-pasion.png" alt={PROFILE.name} />
          </a>
        </div>
      </div>

      <nav className="rail-block" aria-label="Pages">
        <Label>02_NAVIGATION</Label>
        <ul className="rail-nav">
          {NAV.map(({ path, label, Icon }) => (
            <li key={path}>
              <a
                href={path}
                className="rail-item"
                aria-current={isActive(path, currentPage) ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(path)
                }}
              >
                <Icon className="rail-item-icon" />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="rail-block">
        <Label>03_SOCIAL</Label>
        <div className="rail-social">
          {SOCIAL.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              className="rail-social-link"
              aria-label={label}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="me noopener noreferrer"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

      <div className="rail-block rail-block-fill">
        <Label>04_SETTINGS</Label>
        <ThemeControl theme={theme} setTheme={setTheme} />
        <p className="rail-meta mono">EN · {PROFILE.location}</p>
        <p className="rail-clock mono" aria-live="off">
          {clock}
        </p>
      </div>
    </aside>
  )
}
