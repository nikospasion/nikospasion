import { useMemo } from 'react'
import type { WritingEntry } from '../../lib/content'
import { Sheet } from '../sheet/Sheet'
import { WritingToc } from './WritingToc'
import type { TocSection } from './WritingToc'

interface WritingSheetProps {
  entry: WritingEntry
  onClose: () => void
}

/**
 * Body block conventions (see WritingEntry): `## ` starts a section heading
 * (and a TOC entry), ``` starts a mono <pre> figure, anything else is a
 * paragraph. Every block gets an id so the TOC rail can track and jump.
 */
export function WritingSheet({ entry, onClose }: WritingSheetProps) {
  const sections = useMemo<TocSection[]>(
    () =>
      entry.body.flatMap((block, index) =>
        block.startsWith('## ') ? [{ index, label: block.slice(3) }] : [],
      ),
    [entry],
  )

  return (
    <Sheet titleId={`sheet-title-${entry.slug}`} crumb="Writing" onClose={onClose}>
      {sections.length > 0 ? (
        <WritingToc
          title={entry.title}
          sections={sections}
          idPrefix={`${entry.slug}-sec`}
          onClose={onClose}
        />
      ) : null}

      <p className="mono muted sheet-date">{entry.date}</p>
      <h2 className="sheet-title essay-title" id={`sheet-title-${entry.slug}`}>
        {entry.title}
      </h2>

      {entry.body.map((block, i) => {
        const id = `${entry.slug}-sec-${i}`
        if (block.startsWith('## ')) {
          return (
            <h3 className="essay-heading" id={id} key={i}>
              {block.slice(3)}
            </h3>
          )
        }
        if (block.startsWith('```')) {
          return (
            <pre className="essay-figure mono" id={id} key={i}>
              {block.slice(3)}
            </pre>
          )
        }
        return (
          <p className="sheet-paragraph essay-paragraph" id={id} key={i}>
            {block}
          </p>
        )
      })}
    </Sheet>
  )
}
