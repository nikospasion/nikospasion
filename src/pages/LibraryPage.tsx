import { useMemo, useState } from 'react'
import { LIBRARY } from '../lib/content'
import type { LibraryKind } from '../lib/content'

type Filter = 'all' | LibraryKind

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'book', label: 'Books' },
  { value: 'album', label: 'Music' },
  { value: 'film', label: 'Films' },
]

const KIND_LABEL: Record<LibraryKind, string> = {
  book: 'Book',
  album: 'Album',
  film: 'Film',
}

function stars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

/** /library — every book, album, and film, annotated. Filter + search. */
export function LibraryPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return LIBRARY.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false
      if (!q) return true
      return `${item.title} ${item.creator} ${item.review ?? ''}`.toLowerCase().includes(q)
    })
  }, [filter, query])

  return (
    <section className="page" aria-label="Library">
      <header className="page-head">
        <p className="page-eyebrow mono">// LIBRARY</p>
        <h1 className="page-title">Things I consumed.</h1>
        <p className="page-sub muted">
          The anthology — books, records, and films that stuck.
        </p>
      </header>

      <div className="library-controls">
        <div className="library-filters" role="group" aria-label="Filter by type">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className="library-filter mono"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="library-search mono"
          placeholder="Search the shelves…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the library"
        />
      </div>

      <p className="library-count mono muted" aria-live="polite">
        {items.length} of {LIBRARY.length} entries
      </p>

      <ul className="library-list">
        {items.map((item) => (
          <li key={item.slug} className={`library-row library-row-${item.kind}`}>
            <img className="library-cover" src={item.cover} alt="" loading="lazy" />
            <div className="library-body">
              <div className="library-top">
                <h2 className="library-title">{item.title}</h2>
                {item.rating ? (
                  <span className="library-stars mono" aria-label={`${item.rating} out of 5`}>
                    {stars(item.rating)}
                  </span>
                ) : null}
              </div>
              <p className="library-byline mono muted">
                {KIND_LABEL[item.kind]} · {item.creator} · {item.year}
              </p>
              {item.review ? <p className="library-review muted">{item.review}</p> : null}
            </div>
          </li>
        ))}
      </ul>

      {items.length === 0 ? (
        <p className="library-empty muted">
          Nothing on that shelf. Try another word — or another shelf.
        </p>
      ) : null}
    </section>
  )
}
