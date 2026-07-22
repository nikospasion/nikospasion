import { PHOTOS } from '../lib/content'
import { DitherImage } from '../components/ui/DitherImage'

interface PhotosPageProps {
  onOpen: (path: string, trigger: HTMLElement) => void
}

/** /photos — masonry photo log. Click opens the sheet. */
export function PhotosPage({ onOpen }: PhotosPageProps) {
  return (
    <section className="page" aria-label="Photos">
      <header className="page-head">
        <p className="page-eyebrow mono">// PHOTOS</p>
        <h1 className="page-title">Things I saw.</h1>

      </header>

      <div className="photo-masonry">
        {PHOTOS.map((photo) => (
          <a
            key={photo.slug}
            className="photo-cell reveal"
            href={`/photos/${photo.slug}`}
            onClick={(event) => {
              event.preventDefault()
              onOpen(`/photos/${photo.slug}`, event.currentTarget)
            }}
          >
            <DitherImage
              className={photo.tall ? 'photo-cell-img photo-cell-tall' : 'photo-cell-img'}
              src={photo.src}
              alt={photo.caption}
             
            />
            <span className="photo-caption mono muted">{photo.caption}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
