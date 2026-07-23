/* Generates public/sitemap.xml from the live content model — every static
   page plus every writing entry, project, and photo permalink. Run:
   `bun run scripts/gen-sitemap.ts` (also wired into `bun run build`). */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROJECTS, PHOTOS } from '../src/lib/content.ts'
import { assembleWriting } from '../src/lib/markdown.ts'

const SITE = 'https://www.nikospasion.com'

const WRITING_DIR = join(import.meta.dir, '..', 'src', 'content', 'writing')
const WRITING = assembleWriting(
  readdirSync(WRITING_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace(/\.md$/, ''), raw: readFileSync(join(WRITING_DIR, f), 'utf8') })),
)

interface Entry {
  path: string
  priority: string
  changefreq: string
}

const entries: Entry[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/writing', priority: '0.8', changefreq: 'weekly' },
  { path: '/projects', priority: '0.8', changefreq: 'monthly' },
  { path: '/library', priority: '0.6', changefreq: 'monthly' },
  { path: '/photos', priority: '0.6', changefreq: 'monthly' },
  ...WRITING.map((w): Entry => ({ path: `/writing/${w.slug}`, priority: '0.7', changefreq: 'yearly' })),
  ...PROJECTS.map((p): Entry => ({ path: `/projects/${p.id}`, priority: '0.7', changefreq: 'yearly' })),
  ...PHOTOS.map((p): Entry => ({ path: `/photos/${p.slug}`, priority: '0.4', changefreq: 'yearly' })),
]

const body = entries
  .map(
    (e) => `  <url>
    <loc>${SITE}${e.path}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(join(import.meta.dir, '..', 'public', 'sitemap.xml'), xml)
console.log(`wrote sitemap.xml with ${entries.length} urls`)
