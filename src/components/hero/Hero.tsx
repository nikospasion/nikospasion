import { PROFILE, TAGLINE_WORDS } from '../../lib/content'
import { DitherCanvas } from './DitherCanvas'
import { TaglineCycler } from '../ui/TaglineCycler'

/**
 * Top of the content column: the living dither band + name.
 * The canvas is the site's single WebGL surface, mounted eagerly at load.
 */
export function Hero() {
  return (
    <section className="col hero" id="top" aria-label="Nikos Pasion">
      <div className="hero-sig">
        <DitherCanvas className="hero-canvas" />
      </div>
      <p className="hero-eyebrow mono">00 · PROFILE</p>
      <h1 className="hero-name">{PROFILE.name}</h1>
      <p className="hero-tagline">
        <span className="hero-tagline-lead">software should feel</span>{' '}
        <TaglineCycler words={TAGLINE_WORDS} />.
      </p>
    </section>
  )
}
