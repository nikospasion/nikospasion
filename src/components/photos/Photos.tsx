import { PHOTOS } from '../../lib/content'
import { SectionHeader } from '../layout/SectionHeader'
import { DitherImage } from '../ui/DitherImage'
import { PageLink } from '../ui/PageLink'

interface PhotosSectionProps {
  onOpen: (path: string, trigger: HTMLElement) => void
  go: (path: string) => void
}

/** Home section — a taste of the photo log, linking to /photos. */
export function PhotosSection({ onOpen, go }: PhotosSectionProps) {
  return (
    <section className="section" id="photos" aria-label="Photos">
      <SectionHeader
        num="05"
        label="PHOTOS"
        meta={
          <PageLink className="text-link" to="/photos" go={go}>
            View all
          </PageLink>
        }
      />
      <ul className="photo-grid">
        {PHOTOS.slice(0, 6).map((photo) => (
          <li key={photo.slug} className="photo">
            <a
              className="reveal photo-link"
              href={`/photos/${photo.slug}`}
              onClick={(event) => {
                event.preventDefault()
                onOpen(`/photos/${photo.slug}`, event.currentTarget)
              }}
            >
              <DitherImage className="photo-img" src={photo.src} alt={photo.caption} />
              <p className="photo-caption mono muted">{photo.caption}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
