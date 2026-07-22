import { useEffect } from 'react'
import type Lenis from 'lenis'
import { SMOOTH_SCROLL } from '../lib/flags'

/** The live instance, for programmatic jumps that must not be smoothed. */
export const lenisHolder: { current: Lenis | null } = { current: null }

/** Instant scroll that cooperates with Lenis when it's driving. */
export function jumpTo(y: number) {
  if (lenisHolder.current) {
    // While the page-frame is frozen (overflow: hidden on <html> for the
    // sheet-open scroll lock), <html>.scrollHeight collapses to clientHeight
    // — Lenis's debounced ResizeObserver can cache that shrunk height, so
    // its scroll limit clamps to ~0 right when we need to restore. Force a
    // synchronous remeasure (cheap; Lenis's own resize() isn't debounced)
    // before scrolling so the target isn't clamped against stale bounds.
    lenisHolder.current.resize()
    lenisHolder.current.scrollTo(y, { immediate: true, force: true })
  } else window.scrollTo(0, y)
}

/**
 * Lenis smooth scrolling — behind the SMOOTH_SCROLL flag, desktop pointers
 * only, disabled under reduced motion. Tuned crisp (lerp 0.22), loaded
 * after first paint.
 */
export function useLenis() {
  useEffect(() => {
    if (!SMOOTH_SCROLL) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let alive = true
    import('lenis').then(({ default: LenisCtor }) => {
      if (!alive) return
      // Weight knob: lower lerp = heavier, longer glide (0.22 was crisp).
      lenisHolder.current = new LenisCtor({ autoRaf: true, lerp: 0.1 })
    })
    return () => {
      alive = false
      lenisHolder.current?.destroy()
      lenisHolder.current = null
    }
  }, [])
}
