import { WRITING } from '../../lib/writing'
import { SectionHeader } from '../layout/SectionHeader'
import { DitherImage } from '../ui/DitherImage'
import { PageLink } from '../ui/PageLink'

interface WritingListProps {
  onOpen: (path: string, trigger: HTMLElement) => void
  go: (path: string) => void
}

/** Home section — recent writing, linking to the full /writing page. */
export function WritingList({ onOpen, go }: WritingListProps) {
  return (
    <section className="section" id="writing" aria-label="Writing">
      <SectionHeader
        num="01"
        label="WRITING"
        meta={
          <PageLink className="text-link" to="/writing" go={go}>
            View all
          </PageLink>
        }
      />
      <ul className="row-list">
        {WRITING.slice(0, 4).map((entry) => (
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
              <span className="row-date mono">{entry.date}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
