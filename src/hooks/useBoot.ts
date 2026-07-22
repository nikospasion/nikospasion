import { useEffect } from 'react'
import { loadGsap } from '../lib/loadGsap'

let didBoot = false

/**
 * The boot sequence: on first load the blueprint prints itself — sidebar
 * blocks stagger in, corner marks tick on, the hero dither band wipes in
 * column-by-column, the headline rises. Runs once per real page load; all
 * tweens are `from`-style so the resting CSS is the final state (no GSAP,
 * no problem).
 */
export function useBoot() {
  useEffect(() => {
    if (didBoot) return
    didBoot = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let revert: (() => void) | undefined
    loadGsap().then(({ gsap }) => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from('.sidebar .rail-block', { y: 14, opacity: 0, stagger: 0.07, duration: 0.5 }, 0)
          .from(
            '.sidebar .plate-corner',
            { scale: 0, opacity: 0, stagger: 0.04, duration: 0.3, ease: 'back.out(2.5)' },
            0.3,
          )
          .from('.content-col', { opacity: 0, duration: 0.45 }, 0.05)
          .from(
            '.hero-sig',
            { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'steps(16)' },
            0.25,
          )
          .from(
            ['.hero-eyebrow', '.hero-name', '.hero-tagline'],
            { y: 16, opacity: 0, stagger: 0.09, duration: 0.5 },
            0.55,
          )
      })
      revert = () => ctx.revert()
    })
    return () => revert?.()
  }, [])
}
