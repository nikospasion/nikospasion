import { useRef, useState } from 'react'
import { BAG, BAG_CAPTION } from '../../lib/content'
import type { BagItem } from '../../lib/content'
import { SectionHeader } from '../layout/SectionHeader'

const RULER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

interface Tip {
  item: BagItem
  x: number
  y: number
}

/**
 * "In the bag" as a green cutting mat: objects scattered on the board,
 * a ruler down the left edge, and a note that follows the cursor.
 */
export function BagMat() {
  const boardRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  const moveTip = (item: BagItem, clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({ item, x: clientX - rect.left, y: clientY - rect.top })
  }

  return (
    <section className="col section" id="bag" aria-label="In the bag">
      <SectionHeader num="04" label="IN THE BAG" meta="hover the objects" />
      <div className="mat-wrap" ref={boardRef}>
        <div className="mat">
          <div className="mat-ruler" aria-hidden="true">
            {RULER.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <div className="mat-board" aria-hidden="true" />
          {BAG.map((item) => (
            <button
              key={item.name}
              type="button"
              className="mat-item"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.w}%`,
                rotate: `${item.rotate}deg`,
              }}
              aria-label={`${item.name} — ${item.note}`}
              onMouseMove={(e) => moveTip(item, e.clientX, e.clientY)}
              onMouseLeave={() => setTip(null)}
              onFocus={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                moveTip(item, r.left + r.width / 2, r.top)
              }}
              onBlur={() => setTip(null)}
            >
              <img src={item.image} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
          <p className="mat-caption">{BAG_CAPTION}</p>
        </div>

        {tip ? (
          <div className="mat-tip" style={{ left: tip.x, top: tip.y }} role="status">
            <strong>{tip.item.name}</strong>
            <span>{tip.item.note}</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
