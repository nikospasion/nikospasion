import { useEffect, useRef, useState } from 'react'
import { MUSIC, FACED_ALBUM } from '../../lib/content'
import { SectionHeader } from '../layout/SectionHeader'
import { PageLink } from '../ui/PageLink'
import { loadGsap } from '../../lib/loadGsap'

interface RecordsProps {
  go: (path: string) => void
}

/** On rotation — a flickable crate of covers (GSAP Draggable + inertia). */
export function Records({ go }: RecordsProps) {
  const shelfRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const [faced, setFaced] = useState(FACED_ALBUM)
  const current = MUSIC[faced]

  useEffect(() => {
    let alive = true
    let cleanup: (() => void) | undefined
    loadGsap().then(({ Draggable }) => {
      if (!alive || !rowRef.current || !shelfRef.current) return
      const [drag] = Draggable.create(rowRef.current, {
        type: 'x',
        bounds: shelfRef.current,
        inertia: true,
        edgeResistance: 0.82,
        cursor: 'grab',
        activeCursor: 'grabbing',
      })
      cleanup = () => drag.kill()
    })
    return () => {
      alive = false
      cleanup?.()
    }
  }, [])

  return (
    <section className="section" id="music" aria-label="On rotation">
      <SectionHeader
        num="03"
        label="ON ROTATION"
        meta={
          <PageLink className="text-link" to="/library" go={go}>
            The library
          </PageLink>
        }
      />
      <div className="shelf shelf-records" ref={shelfRef}>
        <div className="shelf-row" ref={rowRef}>
          {MUSIC.map((album, i) => (
            <button
              key={album.slug}
              type="button"
              className={i === faced ? 'disc disc-faced' : 'disc'}
              aria-label={`${album.title} — ${album.creator}`}
              onMouseEnter={() => setFaced(i)}
              onFocus={() => setFaced(i)}
              onClick={() => go('/library')}
            >
              <img src={album.cover} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
        <div className="shelf-board" aria-hidden="true" />
      </div>
      <p className="shelf-caption muted">
        {current.title} — {current.creator}
      </p>
    </section>
  )
}
