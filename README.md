# Nikos Pasion — portfolio

A single-page portfolio with a modern-Greek "Odyssey" identity: **a voyage in five
rhapsodies**. Built with Vite, React, TypeScript, and [motion](https://motion.dev).

> **Note:** run everything with **bun** — the Node install on this machine currently
> segfaults (see `bun install`, `bun run dev`). Scripts are already wired to bun.

## Run

```sh
bun install
bun run dev       # http://localhost:5173
bun run build     # typecheck + production build to dist/
```

## The idea

The Odyssey was oral poetry — revealed line by line. The site's signature interaction
(the bio that lights up word-by-word as you scroll, karaoke-style) is that idea made
literal. Sections are lettered like the Odyssey's books:

| § | Section | What it is |
|---|---------|------------|
| Α΄ | The Invocation | Scroll-recited bio, opening with Homer's first line |
| Β΄ | Selected Voyages | Work — cards expand into case studies (shared-element animation) |
| Γ΄ | Ports of Call | Experience table; hover shows each port's real coordinates |
| Δ΄ | The Ship's Log | Writing, set on the wine-dark sea under Argo Navis |
| Ε΄ | Ithaca | Contact — every voyage ends at home |

Other details: the Greek-key **meander** across the top edge draws itself as scroll
progress; palette is Aegean daylight (cool Cycladic white, wine-dark ink, ultramarine,
Mycenaean bronze, rosy-fingered dawn); type is **GFS Didot** + **Instrument Sans** +
**Fragment Mono**. Everything visual is SVG — no raster images.

## Content is sample content

All copy lives in [src/lib/content.ts](src/lib/content.ts) — projects, employers,
writing, email, and socials are invented placeholders. Swap them for real details
there. The design spec is in
[docs/superpowers/specs/2026-07-20-odyssey-portfolio-design.md](docs/superpowers/specs/2026-07-20-odyssey-portfolio-design.md).

## Accessibility

Reduced motion is respected everywhere (karaoke text renders fully lit, overlays fade,
no smooth scroll). The case-study overlay is a real dialog: focus moves in, Tab is
trapped, Escape closes, focus restores. Semantic landmarks + skip link included.
