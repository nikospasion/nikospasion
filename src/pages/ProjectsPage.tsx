import { PROJECTS } from '../lib/content'
import { DitherImage } from '../components/ui/DitherImage'

interface ProjectsPageProps {
  onOpen: (path: string, trigger: HTMLElement) => void
}

/** /projects — a blueprint index sheet: numbered hairline rows, not cards. */
export function ProjectsPage({ onOpen }: ProjectsPageProps) {
  return (
    <section className="page" aria-label="Projects">
      <p className="page-eyebrow mono">{'//'} PROJECTS</p>

      <div className="proj-index">
        {PROJECTS.map((project, i) => (
          <a
            key={project.id}
            className="proj-row reveal"
            href={`/projects/${project.id}`}
            aria-label={`Open ${project.name}`}
            onClick={(event) => {
              event.preventDefault()
              onOpen(`/projects/${project.id}`, event.currentTarget)
            }}
          >
            <span className="proj-num mono" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="proj-thumb-wrap">
              <span className="corner corner-tl" aria-hidden="true">
                +
              </span>
              <span className="corner corner-br" aria-hidden="true">
                +
              </span>
              <DitherImage className="proj-thumb" src={project.cover} alt="" />
            </span>
            <span className="proj-body">
              <span className="proj-top">
                <h2 className="proj-name">{project.name}</h2>
                <span className="mono muted">{project.year}</span>
              </span>
              <span className="proj-kind mono">{project.kind}</span>
              <p className="proj-line muted">{project.oneLiner}</p>
              <span className="proj-spec mono muted">
                {project.status} · {project.stack}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
