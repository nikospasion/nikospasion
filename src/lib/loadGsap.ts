import type { gsap as GsapType } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'
import type { Draggable as DraggableType } from 'gsap/Draggable'

export interface GsapBundle {
  gsap: typeof GsapType
  ScrollTrigger: typeof ScrollTriggerType
  Draggable: typeof DraggableType
}

let bundle: Promise<GsapBundle> | null = null

/**
 * GSAP loads after first paint, once, shared by every consumer — keeps it
 * out of the initial bundle (per the perf budget).
 */
export function loadGsap(): Promise<GsapBundle> {
  if (!bundle) {
    bundle = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/Draggable'),
      import('gsap/InertiaPlugin'),
    ]).then(([g, st, dr, inertia]) => {
      g.gsap.registerPlugin(st.ScrollTrigger, dr.Draggable, inertia.InertiaPlugin)
      return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger, Draggable: dr.Draggable }
    })
  }
  return bundle
}
