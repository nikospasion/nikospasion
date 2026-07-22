import { useState } from 'react'
import { motion } from 'motion/react'
import { BOOKS, FACED_BOOK } from '../../lib/content'
import { SectionHeader } from '../layout/SectionHeader'
import { PageLink } from '../ui/PageLink'

const SPINE_W = 44
const COVER_W = 170

interface BooksProps {
  go: (path: string) => void
}

/** Books I love — click a spine and it opens (width spring) to reveal the cover. */
export function Books({ go }: BooksProps) {
  const [faced, setFaced] = useState(FACED_BOOK)
  const current = BOOKS[faced]

  return (
    <section className="section" id="books" aria-label="Books I love">
      <SectionHeader
        num="03"
        label="BOOKS I LOVE"
        meta={
          <PageLink className="text-link" to="/library" go={go}>
            The library
          </PageLink>
        }
      />
      <div className="shelf shelf-books">
        <div className="shelf-row">
          {BOOKS.map((book, i) => {
            const open = i === faced
            return (
              <motion.button
                key={book.slug}
                type="button"
                className="book"
                style={
                  {
                    '--spine': book.spineColor ?? '#444',
                    '--spine-ink': book.spineInk ?? '#fff',
                  } as React.CSSProperties
                }
                aria-label={book.title}
                aria-pressed={open}
                onClick={() => setFaced(i)}
                animate={{ width: open ? COVER_W : SPINE_W }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              >
                <motion.span
                  className="book-spine"
                  animate={{ opacity: open ? 0 : 1 }}
                  transition={{ duration: 0.18 }}
                >
                  <span className="book-title">{book.title}</span>
                  <span className="book-author">
                    {book.creator
                      .split(' ')
                      .map((w) => w[0])
                      .join('')}
                  </span>
                </motion.span>
                <motion.img
                  className="book-cover"
                  src={book.cover}
                  alt=""
                  loading="lazy"
                  animate={{ opacity: open ? 1 : 0 }}
                  transition={{ duration: 0.25, delay: open ? 0.08 : 0 }}
                />
              </motion.button>
            )
          })}
        </div>
        <div className="shelf-board" aria-hidden="true" />
      </div>
      <p className="shelf-caption muted">
        {current.title} — {current.creator}
      </p>
    </section>
  )
}
