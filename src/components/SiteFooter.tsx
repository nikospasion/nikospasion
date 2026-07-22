import { CONTACT, PROFILE } from '../lib/content'
import { useClock } from '../hooks/useClock'
import { NAV } from './layout/nav-items'
import { IconArrow, IconClock, IconGlobe } from './ui/Icons'

const CONTACT_LINKS = [
  { label: 'X/Twitter', href: CONTACT.x, external: true },
  { label: 'Instagram', href: CONTACT.instagram, external: true },
  { label: 'GitHub', href: CONTACT.github, external: true },
  { label: 'LinkedIn', href: CONTACT.linkedin, external: true },
  { label: 'Email', href: `mailto:${CONTACT.email}`, external: false },
]

interface SiteFooterProps {
  onNavigate: (path: string) => void
}

/** Footer: © + local time + coordinates, contact, index. Manila. */
export function SiteFooter({ onNavigate }: SiteFooterProps) {
  const time = useClock(PROFILE.timeZone, false)

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-id">
          <p className="footer-copyright">© 2026 {PROFILE.name}</p>
          <div className="footer-meta">
            <span className="footer-meta-row">
              <IconClock className="footer-meta-icon" />
              <span className="mono">
                {PROFILE.utcOffset}
                <br />
                {time}
              </span>
            </span>
            <span className="footer-meta-row">
              <IconGlobe className="footer-meta-icon" />
              <span className="mono">
                {PROFILE.coordinates[0]}
                <br />
                {PROFILE.coordinates[1]}
              </span>
            </span>
          </div>
        </div>

        <nav aria-label="Contact">
          <p className="footer-label mono">CONTACT</p>
          <ul className="footer-list">
            {CONTACT_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  className="text-link"
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel="me noopener noreferrer"
                >
                  {link.label}
                  {link.external ? <IconArrow className="footer-arrow" /> : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Index">
          <p className="footer-label mono">INDEX</p>
          <ul className="footer-list">
            {NAV.map((item) => (
              <li key={item.path}>
                <a
                  className="text-link"
                  href={item.path}
                  onClick={(event) => {
                    event.preventDefault()
                    onNavigate(item.path)
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
