/* ---------------------------------------------------------------------------
   Writing entries live as markdown files in src/content/writing/*.md —
   frontmatter (title, date, optional thumbnail) + body. This module is the
   pure parsing layer, shared by the Vite app (src/lib/writing.ts) and the
   Bun placeholder script (scripts/gen-placeholders.ts), so it must stay
   free of Vite- or Node-specific APIs.
--------------------------------------------------------------------------- */

export interface WritingEntry {
  slug: string
  thumbnail: string
  /** Full year on the first entry of each year (index grouping), else null. */
  year: string | null
  title: string
  date: string // YY/MM/DD
  /** Body blocks: `## ` = section heading, ``` = mono <pre> figure. */
  body: string[]
}

interface ParsedMarkdown {
  frontmatter: Record<string, string>
  blocks: string[]
}

/**
 * Tiny markdown-to-blocks parser for the shapes the site renders:
 * `---` frontmatter, `## ` headings, ``` fenced mono figures, and blank-line
 * separated paragraphs (soft-wrapped lines join with a space).
 */
export function parseWritingMarkdown(raw: string): ParsedMarkdown {
  let src = raw.replace(/\r\n/g, '\n')
  const frontmatter: Record<string, string> = {}

  if (src.startsWith('---\n')) {
    const end = src.indexOf('\n---', 4)
    if (end !== -1) {
      for (const line of src.slice(4, end).split('\n')) {
        const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
        if (match) frontmatter[match[1]] = match[2].replace(/^["']|["']$/g, '')
      }
      src = src.slice(end + 4)
    }
  }

  const blocks: string[] = []
  let paragraph: string[] = []
  let fence: string[] | null = null

  const flush = () => {
    if (paragraph.length) {
      blocks.push(paragraph.join(' '))
      paragraph = []
    }
  }

  for (const line of src.split('\n')) {
    if (fence) {
      if (line.trim().startsWith('```')) {
        blocks.push('```' + fence.join('\n'))
        fence = null
      } else {
        fence.push(line)
      }
      continue
    }
    if (line.trim().startsWith('```')) {
      flush()
      fence = []
      continue
    }
    if (line.startsWith('## ')) {
      flush()
      blocks.push(line.trim())
      continue
    }
    if (line.trim() === '') {
      flush()
      continue
    }
    paragraph.push(line.trim())
  }
  flush()
  if (fence) blocks.push('```' + fence.join('\n'))

  return { frontmatter, blocks }
}

/**
 * Build the sorted WRITING list from raw markdown sources. Sorts newest
 * first and stamps `year` only on the first entry of each year, which is
 * what the index page's grouping expects.
 */
export function assembleWriting(sources: { slug: string; raw: string }[]): WritingEntry[] {
  const parsed = sources
    .map(({ slug, raw }) => {
      const { frontmatter, blocks } = parseWritingMarkdown(raw)
      const iso = frontmatter.date ?? '1970-01-01' // YYYY-MM-DD
      return {
        slug,
        title: frontmatter.title ?? slug,
        thumbnail: frontmatter.thumbnail ?? `/img/writing/${slug}.svg`,
        fullYear: iso.slice(0, 4),
        date: `${iso.slice(2, 4)}/${iso.slice(5, 7)}/${iso.slice(8, 10)}`,
        body: blocks,
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return parsed.map((entry, i) => ({
    slug: entry.slug,
    thumbnail: entry.thumbnail,
    title: entry.title,
    date: entry.date,
    body: entry.body,
    year: i === 0 || parsed[i - 1].fullYear !== entry.fullYear ? entry.fullYear : null,
  }))
}

/** First sentence of an essay — used as the excerpt on index rows. */
export function excerptOf(entry: WritingEntry): string {
  const first = entry.body.find((b) => !b.startsWith('## ') && !b.startsWith('```')) ?? ''
  const cut = first.indexOf('. ')
  return cut > 40 ? first.slice(0, cut + 1) : first
}
