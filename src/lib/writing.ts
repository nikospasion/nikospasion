/* Vite-side loader: every .md in src/content/writing becomes a WritingEntry.
   Drop a new file in that folder and it appears on the index, sorted by its
   frontmatter date. (The Bun scripts read the same files via fs — keep any
   parsing logic in markdown.ts, which both sides share.) */

import { assembleWriting } from './markdown'
import type { WritingEntry } from './markdown'

const modules = import.meta.glob('../content/writing/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const WRITING: WritingEntry[] = assembleWriting(
  Object.entries(modules).map(([path, raw]) => ({
    slug: path.split('/').pop()!.replace(/\.md$/, ''),
    raw,
  })),
)
