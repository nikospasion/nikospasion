import { Fragment, useEffect, useRef, useState } from 'react'

export interface TocSection {
  index: number
  label: string
}

interface WritingTocProps {
  title: string
  /** Heading blocks (subset of the body blocks). */
  sections: TocSection[]
  /** Body blocks render with id `${idPrefix}-${index}`. */
  idPrefix: string
  onClose: () => void
}

/** The "reading line" — a section is active once it passes this viewport fraction. */
const READ_LINE = 0.35
/** Fixed tick marks between landmarks (rhythm, not per-paragraph). */
const TICKS_BETWEEN = 3

type Active = 'title' | number

/**
 * Article minimap in the sheet's left gutter: a read-progress ring, a
 * back-to-Writing link, the title + section headings as landmarks
 * with tick rhythm between them (active one stretched), and a back-to-top
 * that only appears once you've scrolled. Tracks the sheet's own scroller.
 * Hidden by CSS where the sheet has no gutter for it.
 */
export function WritingToc({ title, sections, idPrefix, onClose }: WritingTocProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const [active, setActive] = useState<Active>('title')
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const scroller = rootRef.current?.closest<HTMLElement>('.project-sheet')
    if (!scroller) return

    let raf = 0
    const measure = () => {
      raf = 0
      const max = scroller.scrollHeight - scroller.clientHeight
      const progress = max > 0 ? Math.min(1, scroller.scrollTop / max) : 0
      ringRef.current?.style.setProperty('stroke-dasharray', `${progress} 1`)
      setShowTop(scroller.scrollTop > scroller.clientHeight * 0.4)

      const line = scroller.scrollTop + scroller.clientHeight * READ_LINE
      let current: Active = 'title'
      for (const section of sections) {
        const el = document.getElementById(`${idPrefix}-${section.index}`)
        if (el && el.offsetTop <= line) current = section.index
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }

    measure()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [sections, idPrefix])

  const jump = (index: Active) => {
    const scroller = rootRef.current?.closest<HTMLElement>('.project-sheet')
    if (!scroller) return
    if (index === 'title') {
      scroller.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(`${idPrefix}-${index}`)
    if (el) {
      scroller.scrollTo({
        top: el.offsetTop - scroller.clientHeight * (READ_LINE - 0.15),
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="essay-toc" ref={rootRef}>
      <nav className="essay-toc-inner" aria-label="Article map">
        <svg className="toc-ring" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <circle className="toc-ring-track" cx="10" cy="10" r="8" />
          <circle
            className="toc-ring-fill"
            cx="10"
            cy="10"
            r="8"
            pathLength={1}
            strokeDasharray="0 1"
            ref={ringRef}
          />
        </svg>

        <button type="button" className="toc-utility toc-back" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m1.25,5.25h7c1.381,0,2.5,1.119,2.5,2.5h0c0,1.381-1.119,2.5-2.5,2.5h-1.25" />
              <polyline points="4.25 8.5 1 5.25 4.25 2" />
            </g>
          </svg>
          <span>Writing</span>
        </button>

        <div className="toc-nodes">
          <div className="toc-node" data-kind="landmark">
            <button
              type="button"
              className="toc-link"
              data-variant="title"
              aria-current={active === 'title' ? 'location' : undefined}
              onClick={() => jump('title')}
            >
              <span className="toc-tick" aria-hidden="true" />
              <span className="toc-label">{title}</span>
            </button>
          </div>

          {sections.map((section) => (
            <Fragment key={section.index}>
              {Array.from({ length: TICKS_BETWEEN }, (_, t) => (
                <div className="toc-node" data-kind="tick" key={t}>
                  <span className="toc-tick" aria-hidden="true" />
                </div>
              ))}
              <div className="toc-node" data-kind="landmark">
                <button
                  type="button"
                  className="toc-link"
                  aria-current={active === section.index ? 'location' : undefined}
                  onClick={() => jump(section.index)}
                >
                  <span className="toc-tick" aria-hidden="true" />
                  <span className="toc-label">{section.label}</span>
                </button>
              </div>
            </Fragment>
          ))}
        </div>

        <button
          type="button"
          className="toc-utility toc-top"
          data-visible={showTop}
          tabIndex={showTop ? 0 : -1}
          onClick={() => jump('title')}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.25 6C11.25 3.1005 8.89949 0.75 6 0.75C3.1005 0.75 0.75 3.10051 0.75 6" />
              <path d="M6 11.25L6 3.75" />
              <path d="M3.75 6L6 3.75L8.25 6" />
            </g>
          </svg>
          <span>Top</span>
        </button>
      </nav>
    </div>
  )
}
