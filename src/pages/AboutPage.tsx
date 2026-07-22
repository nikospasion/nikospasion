import { ABOUT, EXPERIENCE, PROFILE } from '../lib/content'
import { BadgeTrailCard } from '../components/ui/BadgeTrailCard'
import { SectionHeader } from '../components/layout/SectionHeader'
import { IconArrow } from '../components/ui/Icons'

/** /about — who this person is. */
export function AboutPage() {
  return (
    <section className="page" aria-label="About">
      <BadgeTrailCard />

      <header className="page-head">
        <p className="page-eyebrow mono">// ABOUT</p>
        <h1 className="page-title">{PROFILE.name}.</h1>
        <p className="page-sub muted">{PROFILE.tagline}</p>
      </header>

      <div className="about-grid">
        <div className="about-copy">
          {ABOUT.paragraphs.map((paragraph, i) => (
            <p className="about-paragraph" key={i}>
              {paragraph}
            </p>
          ))}
        </div>
        <aside className="about-side">
          <img className="about-portrait" src={ABOUT.portrait} alt={`Portrait of ${PROFILE.name}`} />
          <dl className="about-facts">
            {ABOUT.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="mono muted">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <section className="section about-experience" aria-label="Experience">
        <SectionHeader num="01" label="EXPERIENCE" />
        <ul className="xp-list">
          {EXPERIENCE.map((item) => (
            <li className="xp-item" key={item.company}>
              {item.roles.map((role, i) => (
                <div className="xp-row" key={role.title}>
                  <span className="xp-left">
                    {i === 0 ? (
                      item.url ? (
                        <a className="xp-company" href={item.url} target="_blank" rel="noreferrer">
                          {item.company}
                          <IconArrow className="xp-arrow" />
                        </a>
                      ) : (
                        <span className="xp-company">{item.company}</span>
                      )
                    ) : null}
                    <span className="xp-role muted">{role.title}</span>
                  </span>
                  <span className="xp-years muted">{role.years}</span>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
