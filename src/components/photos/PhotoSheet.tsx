import type { Photo } from '../../lib/content'
import { Sheet } from '../sheet/Sheet'

interface PhotoSheetProps {
  photo: Photo
  onClose: () => void
}

/** A photo, opened big in the sheet. */
export function PhotoSheet({ photo, onClose }: PhotoSheetProps) {
  return (
    <Sheet titleId={`sheet-title-${photo.slug}`} crumb="Photos" onClose={onClose}>
      <figure className="photo-view">
        <img className="photo-view-img" src={photo.src} alt={photo.caption} />
        <figcaption className="photo-view-caption">
          <h2 className="sheet-title" id={`sheet-title-${photo.slug}`}>
            {photo.caption}
          </h2>
          {photo.meta ? <p className="mono muted">{photo.meta}</p> : null}
        </figcaption>
      </figure>
    </Sheet>
  )
}
