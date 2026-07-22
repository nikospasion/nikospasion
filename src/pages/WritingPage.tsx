import { useEffect, useMemo } from 'react'
import { WRITING } from '../lib/writing'
import type { WritingEntry } from '../lib/content'
import { DitherImage } from '../components/ui/DitherImage'
import { loadGsap } from '../lib/loadGsap'

interface WritingPageProps {
  onOpen: (path: string, trigger: HTMLElement) => void
}

interface YearGroup {
  year: string
  entries: WritingEntry[]
}

function groupByYear(entries: WritingEntry[]): YearGroup[] {
  const groups: YearGroup[] = []
  for (const entry of entries) {
    if (entry.year) groups.push({ year: entry.year, entries: [] })
    groups[groups.length - 1]?.entries.push(entry)
  }
  return groups
}

/** /writing — compact year-grouped index, cali-blog style. */
export function WritingPage({ onOpen }: WritingPageProps) {
  const groups = useMemo(() => groupByYear(WRITING), [])

  // Ghost year numerals drift against the scroll (ScrollTrigger scrub).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let alive = true
    let cleanup: (() => void) | undefined
    loadGsap().then(({ gsap }) => {
      if (!alive) return
      const ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>('.wgroup').forEach((group) => {
          const ghost = group.querySelector('.wgroup-ghost')
          if (!ghost) return
          gsap.fromTo(
            ghost,
            { y: 60 },
            {
              y: -60,
              ease: 'none',
              scrollTrigger: { trigger: group, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        })
      })
      cleanup = () => ctx.revert()
    })
    return () => {
      alive = false
      cleanup?.()
    }
  }, [])

  return (
    <section className="page" aria-label="Writing">
      <p className="page-eyebrow mono">{'//'} WRITING</p>

      {groups.map((group) => (
        <section className="wgroup" key={group.year} aria-label={group.year}>
          <div className="wgroup-head">
            <h2 className="wgroup-year">{group.year}</h2>
            <span className="wgroup-ghost" aria-hidden="true">
              {group.year.slice(2)}
            </span>
          </div>
          <ul className="row-list">
            {group.entries.map((entry) => (
              <li key={entry.slug}>
                <a
                  className="row reveal writing-row"
                  href={`/writing/${entry.slug}`}
                  onClick={(event) => {
                    event.preventDefault()
                    onOpen(`/writing/${entry.slug}`, event.currentTarget)
                  }}
                >
                  <DitherImage className="row-thumb" src={entry.thumbnail} alt="" />
                  <span className="row-title">{entry.title}</span>
                  <span className="leader" />
                  <span className="row-date mono">{entry.date.slice(3)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}
