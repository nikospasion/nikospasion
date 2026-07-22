import { useEffect, useRef } from 'react'
import type { Project } from '../../lib/content'
import { Sheet } from '../sheet/Sheet'
import { DitherImage } from '../ui/DitherImage'
import { loadGsap } from '../../lib/loadGsap'

interface ProjectSheetProps {
  project: Project
  onClose: () => void
}

export function ProjectSheet({ project, onClose }: ProjectSheetProps) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  // Flickable gallery strip — same Draggable + inertia feel as the records crate.
  useEffect(() => {
    if (!project.images || project.images.length < 2) return
    let alive = true
    let cleanup: (() => void) | undefined
    loadGsap().then(({ Draggable }) => {
      if (!alive || !galleryRef.current || !rowRef.current) return
      const [drag] = Draggable.create(rowRef.current, {
        type: 'x',
        bounds: galleryRef.current,
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
  }, [project])

  return (
    <Sheet titleId={`sheet-title-${project.id}`} crumb={project.name} onClose={onClose}>
      <span className="sheet-banner reveal">
        <DitherImage className="sheet-cover" src={project.cover} alt="" />
      </span>

      <h2 className="sheet-title" id={`sheet-title-${project.id}`}>
        {project.name}
        <span className="muted"> — {project.kind}</span>
      </h2>
      <p className="sheet-oneliner">{project.oneLiner}</p>

      {project.body.map((paragraph, i) => (
        <p className="sheet-paragraph" key={i}>
          {paragraph}
        </p>
      ))}

      {project.images?.length ? (
        <div className="sheet-gallery" ref={galleryRef}>
          <div className="sheet-gallery-row" ref={rowRef}>
            {project.images.map((src) => (
              <span className="sheet-gallery-item reveal" key={src}>
                <DitherImage className="sheet-gallery-img" src={src} alt="" />
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <dl className="sheet-manifest">
        <div>
          <dt className="mono muted">Role</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt className="mono muted">Stack</dt>
          <dd>{project.stack}</dd>
        </div>
        <div>
          <dt className="mono muted">Year</dt>
          <dd>{project.year}</dd>
        </div>
        <div>
          <dt className="mono muted">Status</dt>
          <dd>{project.status}</dd>
        </div>
      </dl>
    </Sheet>
  )
}
