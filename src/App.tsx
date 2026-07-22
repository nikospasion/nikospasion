import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { PHOTOS, PROJECTS } from './lib/content'
import { WRITING } from './lib/writing'
import { useTheme } from './hooks/useTheme'
import { useBoot } from './hooks/useBoot'
import { useLenis, jumpTo } from './hooks/useLenis'
import { Background } from './components/layout/Background'
import { Sidebar } from './components/layout/Sidebar'
import { MobileNav } from './components/layout/MobileNav'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { WritingPage } from './pages/WritingPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { LibraryPage } from './pages/LibraryPage'
import { PhotosPage } from './pages/PhotosPage'
import { WritingSheet } from './components/writing/WritingSheet'
import { ProjectSheet } from './components/projects/ProjectSheet'
import { PhotoSheet } from './components/photos/PhotoSheet'
import { SiteFooter } from './components/SiteFooter'

const SHEET_EASE = [0.22, 1, 0.36, 1] as const

type Page = 'home' | 'about' | 'writing' | 'projects' | 'library' | 'photos'
type SheetRoute = { kind: 'writing'; slug: string } | { kind: 'project'; id: string } | { kind: 'photo'; slug: string }

interface ParsedRoute {
  page: Page
  sheet?: SheetRoute
}

/**
 * Parses a URL into a page + optional sheet. Note: `page` here is only a
 * *fallback* for direct loads/back-forward — the live background page is
 * tracked separately in state and must NOT be re-derived from every sheet
 * URL (see the `page` state below and its comment).
 */
function parseRoute(pathname: string): ParsedRoute {
  const essay = pathname.match(/^\/writing\/([\w-]+)\/?$/)
  if (essay) return { page: 'writing', sheet: { kind: 'writing', slug: essay[1] } }
  const project = pathname.match(/^\/projects\/([\w-]+)\/?$/)
  if (project) return { page: 'projects', sheet: { kind: 'project', id: project[1] } }
  const photo = pathname.match(/^\/photos\/([\w-]+)\/?$/)
  if (photo) return { page: 'photos', sheet: { kind: 'photo', slug: photo[1] } }
  if (/^\/about\/?$/.test(pathname)) return { page: 'about' }
  if (/^\/writing\/?$/.test(pathname)) return { page: 'writing' }
  if (/^\/projects\/?$/.test(pathname)) return { page: 'projects' }
  if (/^\/library\/?$/.test(pathname)) return { page: 'library' }
  if (/^\/photos\/?$/.test(pathname)) return { page: 'photos' }
  return { page: 'home' }
}

const PAGE_TITLES: Record<Page, string> = {
  home: 'Nikos Pasion — design engineer',
  about: 'About — Nikos Pasion',
  writing: 'Writing — Nikos Pasion',
  projects: 'Projects — Nikos Pasion',
  library: 'Library — Nikos Pasion',
  photos: 'Photos — Nikos Pasion',
}

export default function App() {
  const { theme, setTheme } = useTheme()
  useBoot()
  useLenis()

  const initial = parseRoute(window.location.pathname)
  // `page` is the background content — it changes ONLY on real page
  // navigation (sidebar/footer/back-forward-to-a-page), never just because a
  // sheet URL happens to match a content type. This is what keeps Home
  // showing while a writing sheet (opened from Home) is open, and stops the
  // remount/"refresh" when that sheet closes.
  const [page, setPage] = useState<Page>(initial.page)
  const [sheetRoute, setSheetRoute] = useState<SheetRoute | undefined>(initial.sheet)
  const [frozen, setFrozen] = useState(() => Boolean(initial.sheet))
  const [originY, setOriginY] = useState(0)
  const triggerRef = useRef<HTMLElement | null>(null)
  const returnTo = useRef<string | null>(null)
  const wasFrozen = useRef(frozen)
  const prevPage = useRef(page)

  const essay = sheetRoute?.kind === 'writing' ? WRITING.find((w) => w.slug === sheetRoute.slug) : undefined
  const project = sheetRoute?.kind === 'project' ? PROJECTS.find((p) => p.id === sheetRoute.id) : undefined
  const photo = sheetRoute?.kind === 'photo' ? PHOTOS.find((p) => p.slug === sheetRoute.slug) : undefined
  const sheetOpen = Boolean(essay || project || photo)

  /** Sidebar / drawer / footer page navigation — the only place `page` changes. */
  const goPage = (path: string) => {
    window.history.pushState({}, '', path)
    const parsed = parseRoute(path)
    setPage(parsed.page)
    setSheetRoute(parsed.sheet)
    returnTo.current = null
  }

  /** Open a detail sheet over whatever page is currently showing. */
  const openSheet = (path: string, trigger: HTMLElement) => {
    triggerRef.current = trigger
    returnTo.current = window.location.pathname
    setOriginY(window.scrollY)
    setFrozen(true)
    window.history.pushState({}, '', path)
    setSheetRoute(parseRoute(path).sheet)
    // `page` is deliberately left untouched.
  }

  const closeSheet = () => {
    const target = returnTo.current ?? `/${page === 'home' ? '' : page}`
    window.history.pushState({}, '', target)
    setSheetRoute(undefined)
    // `page` is deliberately left untouched — same background, no remount.
    returnTo.current = null
    triggerRef.current?.focus({ preventScroll: true })
    triggerRef.current = null
  }

  useEffect(() => {
    const onPop = () => {
      const next = parseRoute(window.location.pathname)
      if (next.sheet) {
        // Back/forward into a permalink: keep whatever page is already
        // mounted as the backdrop (only fall back to the URL's page if nothing
        // is mounted yet, which can't happen post-mount, so just keep page).
        setFrozen(true)
        setSheetRoute(next.sheet)
      } else {
        setPage(next.page)
        setSheetRoute(undefined)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Freeze/thaw + scroll restore in one pre-paint tick (no flash on close).
  useLayoutEffect(() => {
    if (frozen) {
      document.documentElement.style.overflow = 'hidden'
      wasFrozen.current = true
      return
    }
    document.documentElement.style.overflow = ''
    if (wasFrozen.current) {
      jumpTo(originY)
      wasFrozen.current = false
    }
  }, [frozen, originY])

  // New page → top of page (unless we're restoring from a sheet).
  useLayoutEffect(() => {
    if (prevPage.current !== page) {
      prevPage.current = page
      if (!frozen && !wasFrozen.current) jumpTo(0)
    }
  }, [page, frozen])

  useEffect(() => {
    const detail = essay?.title ?? project?.name ?? photo?.caption
    document.title = detail ? `${detail} — Nikos Pasion` : PAGE_TITLES[page]
  }, [page, essay, project, photo])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link mono" href="#main">
        Skip to content
      </a>

      <Background />
      <Sidebar theme={theme} setTheme={setTheme} currentPage={page} onNavigate={goPage} />
      <MobileNav theme={theme} setTheme={setTheme} currentPage={page} onNavigate={goPage} />

      <motion.div
        className={frozen ? 'page-frame page-frame-frozen' : 'page-frame'}
        animate={
          sheetOpen ? { scale: 0.94, y: 10, borderRadius: 18 } : { scale: 1, y: 0, borderRadius: 0 }
        }
        transition={{ duration: 0.55, ease: SHEET_EASE }}
      >
        <div style={frozen ? { transform: `translateY(-${originY}px)` } : undefined}>
          <div className="content">
            <div className="content-col">
              <div className="content-inner">
                <main id="main">
                  <motion.div
                    key={page}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: SHEET_EASE }}
                  >
                    {page === 'home' ? <HomePage onOpen={openSheet} go={goPage} /> : null}
                    {page === 'about' ? <AboutPage /> : null}
                    {page === 'writing' ? <WritingPage onOpen={openSheet} /> : null}
                    {page === 'projects' ? <ProjectsPage onOpen={openSheet} /> : null}
                    {page === 'library' ? <LibraryPage /> : null}
                    {page === 'photos' ? <PhotosPage onOpen={openSheet} /> : null}
                  </motion.div>
                </main>
                <SiteFooter onNavigate={goPage} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence onExitComplete={() => setFrozen(false)}>
        {project ? <ProjectSheet key={project.id} project={project} onClose={closeSheet} /> : null}
        {essay ? <WritingSheet key={essay.slug} entry={essay} onClose={closeSheet} /> : null}
        {photo ? <PhotoSheet key={photo.slug} photo={photo} onClose={closeSheet} /> : null}
      </AnimatePresence>
    </MotionConfig>
  )
}
