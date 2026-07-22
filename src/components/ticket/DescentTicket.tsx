import { useEffect, useRef, useState } from 'react'
import { Dithering } from '@paper-design/shaders-react'
import { useReducedMotion } from 'motion/react'
import { DESCENT } from '../../lib/content'
import { Corners } from '../ui/Corners'
import { PixelWordmark } from './PixelWordmark'

/**
 * The ticket's living background: a slow dither VORTEX (paper.design
 * `Dithering`, shape "swirl") — a literal descent, centered in the left art
 * zone. One WebGL instance; the rAF fully stops (`speed: 0`) whenever the
 * ticket is offscreen, and never mounts at all under reduced motion (the CSS
 * fallback background shows instead).
 */
function TicketVortex() {
  const reduced = useReducedMotion()
  const hostRef = useRef<HTMLSpanElement>(null)
  const [mounted, setMounted] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = hostRef.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setMounted(true) // mount once, then only pause
      },
      { rootMargin: '150px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <span className="ticket-vortex" ref={hostRef} aria-hidden="true">
      {!reduced && mounted ? (
        <Dithering
          shape="swirl"
          type="4x4"
          size={2}
          colorBack="#232323"
          colorFront="#f2e3cf"
          speed={inView ? 0.35 : 0}
          scale={1.35}
          offsetX={-0.55}
          minPixelRatio={1}
          maxPixelCount={280_000}
          style={{ width: '100%', height: '100%' }}
        />
      ) : null}
    </span>
  )
}

/**
 * Banner between the intro and the writing index: a full-bleed panel holding
 * the Descent ticket. Always dark/cream regardless of site theme, like the
 * cutting-mat board — a fixed, physical artifact.
 */
export function DescentTicket() {
  return (
    <div className="ticket-banner">
      <div className="ticket-frame plate">
        <Corners />
        <a className="ticket" href={DESCENT.url} aria-label={`${DESCENT.wordmark} — ${DESCENT.subtitle}`}>
          <TicketVortex />
          <span className="ticket-scrim" aria-hidden="true" />

          <span className="ticket-art" aria-hidden="true" />

          <span className="ticket-body">
            <span className="ticket-copy">{DESCENT.blurb}</span>

            <span className="ticket-mid">
              <span className="ticket-admit mono">{DESCENT.admit}</span>
              <span className="ticket-subtitle">{DESCENT.subtitle}</span>
            </span>

            <span className="ticket-foot">
              <span className="ticket-foot-main">
                <span className="ticket-seat mono">{DESCENT.seat}</span>
                <PixelWordmark className="ticket-wordmark" text={DESCENT.wordmark} />
              </span>
              <span className="ticket-year mono">{DESCENT.year}</span>
            </span>
          </span>

          <span className="ticket-perf" aria-hidden="true">
            <span className="ticket-notch ticket-notch-top" />
            <span className="ticket-notch ticket-notch-bottom" />
          </span>

          <span className="ticket-stub">
            <span className="ticket-stub-serial mono">{DESCENT.serial}</span>
            <span className="ticket-stub-barcode" aria-hidden="true" />
            <span className="ticket-stub-seat mono">{DESCENT.seat}</span>
            <span className="ticket-stub-year mono">{DESCENT.year}</span>
          </span>
        </a>
      </div>
    </div>
  )
}
