import { PROJECTS } from '../../lib/content'
import { SectionHeader } from '../layout/SectionHeader'
import { DitherImage } from '../ui/DitherImage'
import { PageLink } from '../ui/PageLink'

interface ProjectListProps {
  onOpen: (path: string, trigger: HTMLElement) => void
  go: (path: string) => void
}

/** Home section — project card grid, linking to the full /projects page. */
export function ProjectList({ onOpen, go }: ProjectListProps) {
  return (
    <section className="section" id="projects" aria-label="Projects">
      <SectionHeader
        num="02"
        label="PROJECTS"
        meta={
          <PageLink className="text-link" to="/projects" go={go}>
            View all
          </PageLink>
        }
      />
      <div className="project-grid">
        {PROJECTS.map((project) => (
          <a
            key={project.id}
            className="project-card reveal"
            href={`/projects/${project.id}`}
            aria-label={`Open ${project.name}`}
            onClick={(event) => {
              event.preventDefault()
              onOpen(`/projects/${project.id}`, event.currentTarget)
            }}
          >
            <span className="corner corner-tl" aria-hidden="true">
              +
            </span>
            <span className="corner corner-br" aria-hidden="true">
              +
            </span>
            <DitherImage className="project-cover" src={project.cover} alt="" />
            <span className="project-meta">
              <span className="project-name">
                {project.name}
                <span className="muted"> — {project.kind}</span>
              </span>
              <span className="project-line muted">{project.oneLiner}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
