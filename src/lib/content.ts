/* ---------------------------------------------------------------------------
   All site copy + image slots. Everything is sample content — swap freely.
   Placeholder images live in /public/img (see scripts/gen-placeholders.ts).
--------------------------------------------------------------------------- */

export const PROFILE = {
  name: 'Nikos Pasion',
  role: 'Engineer & Designer',
  tagline: "your favorite engineer's favorite engineer",
  location: 'Manila, Philippines',
  timeZone: 'Asia/Manila',
  utcOffset: 'UTC+8',
  coordinates: ['14.5995° N', '120.9842° E'],
}

/** Hero tagline word — click it to cycle. Keep entries short; the Typer
 * reveal reads best on single words. */
export const TAGLINE_WORDS = ['fun', 'clean', 'natural', 'thoughtful', 'easy', 'amazing']

/**
 * Intro statements revealed word-by-word on scroll.
 * `*word*` marks an accent word.
 */
export const INTRO: string[] = [
  'Creating is something that is innate to me.',
  'I care deeply about {img:scribble} *craft and quality* and I like to make people feel something through my work.',
  "I'm a co-founder and CTO at {img:descent}[Descent](https://descent.dev), an AI consultancy and engineering hub I started with ~two friends~. We build agentic systems for companies, and co-found new ones of our own.",
  'Before this, I spent the last few years building products in {img:gotyme} *FinTech*, mostly steering AI products, engineering, leadership, and direction.',
]

/** Inline chips available to INTRO via `{img:name}` tokens. */
export const INTRO_IMAGES: Record<
  string,
  { src: string; kind: 'chip' | 'scribble'; label?: string }
> = {
  descent: { src: '/img/inline/descent.png', kind: 'chip', label: 'Descent' },
  gotyme: { src: '/img/inline/gotyme.jpg', kind: 'chip', label: 'GoTyme Bank' },
  scribble: { src: '/img/inline/scribble.gif', kind: 'scribble' },
}

/** The "Descent" ticket banner between the intro and the writing index. */
export const DESCENT = {
  wordmark: 'DESCENT',
  year: '2026',
  serial: '000724',
  admit: 'ADMIT 1',
  subtitle: 'Your ticket to the deep end.',
  seat: 'SEAT 01 · STUDIO',
  blurb:
    'Every model learns by descending until the gradient flattens. So do we — take the problem nobody has solved, decompose it into primitives, come back with it converged.',
  url: '#',
}

export const ABOUT = {
  portrait: '/img/brand/portrait.png',
  paragraphs: [
    "genuinely idk what to write here yet. brb"
  ],
  facts: [
    { label: 'Now', value: 'Co-founder & CTO, Descent' },
    { label: 'Before', value: 'GoTyme Bank' },
    { label: 'Based', value: 'Manila, PH (UTC+8)' },
    { label: 'Elsewhere', value: 'X · GitHub · LinkedIn' },
  ],
}

/* ------------------------------ Experience ------------------------------- */

export interface ExperienceRole {
  title: string
  years: string
}

export interface ExperienceItem {
  company: string
  url?: string
  roles: ExperienceRole[]
}

/** About-page experience index — roles only, newest first. */
export const EXPERIENCE: ExperienceItem[] = [
  {
    company: 'Descent',
    url: 'https://descent.dev',
    roles: [{ title: 'Co-founder & CTO', years: '2026—now' }],
  },
  {
    company: 'GoTyme Bank',
    roles: [
      { title: 'Senior AI Engineer', years: '2026—now' },
      { title: 'AI Engineer', years: '2025—2026' },
      { title: 'Generative AI Intern', years: '2024—2025' },
    ],
  },
  {
    company: 'iACADEMY Compile',
    roles: [
      { title: 'Vice President, External Affairs', years: '2024—2025' },
      { title: 'President', years: '2023—2024' },
      { title: 'Member', years: '2022—2023' },
    ],
  },
]

export interface Project {
  id: string
  cover: string
  name: string
  kind: string
  year: string
  oneLiner: string
  role: string
  stack: string
  status: string
  body: string[]
  /** Extra photos shown in the project sheet after the body. */
  images?: string[]
}

export const PROJECTS: Project[] = [
  {
    id: 'nexus-plus',
    cover: '/img/projects/nexus-card.png',
    name: 'NEXUS+',
    kind: 'IoT · Android',
    year: '2024',
    oneLiner: 'Tap a card, get counted — NFC event attendance with gamified points.',
    role: 'Developer — hardware, Android, cloud',
    stack: 'Kotlin · Arduino · ESP8266 · RC522 · Firebase',
    status: 'Arduino Day PH 2024',
    body: [
      'An IoT device and Android application: an NFC card system for seamless event attendance tracking that rewards students with points. Members of an organization check into events with a simple card tap and automatically earn points through a gamified rewards system.',
      'The Android app is native Kotlin on MVVM architecture, with real-time NFC communication and dynamic UI updates. On the hardware side, an RC522 RFID reader and an ESP8266 handle card detection and data transmission, with Arduino microcontrollers programmed for reliable reads. Firebase — Firestore, Authentication, Cloud Functions — keeps the cards, the app, and the database talking to each other in real time.',
      'Presented and demonstrated at Arduino Day PH 2024.',
    ],
    images: ['/img/projects/nexus.jpg'],
  },
  {
    id: 'go-cart',
    cover: '/img/projects/gocart.png',
    name: 'GO CART',
    kind: 'Thesis · AI + IoT',
    year: '2025',
    oneLiner: 'An AI-powered shopping cart with self-checkout.',
    role: 'Lead — development and project',
    stack: 'YOLOv8 · FastAPI · React Native · Next.js · Supabase',
    status: 'Ongoing thesis',
    body: [
      'An ongoing thesis project: an AI-powered shopping cart system built to make grocery shopping in the Philippines faster and more personal. Computer vision enables a seamless self-checkout experience — real-time item recognition, automated checkout, and personalized product recommendations, bridging physical and digital retail.',
      'The vision stack is a YOLOv8 object detection model running at 80–100 FPS with ByteTrack multi-object tracking and Supervision utilities. The dataset — 3,000+ labeled instances, augmented to 8,000+ through Roboflow pipelines (flip, rotate, blur, grayscale) — was annotated and versioned in Roboflow. Inference runs on an RTX 4060 and deploys to a tablet mounted on the cart.',
      'Around it: a React Native app for shoppers, a Next.js admin dashboard with real-time synchronization, and a FastAPI backend with WebSocket connections over PostgreSQL via Supabase. Checkout supports multiple payment methods through PayMongo and QR PH integration (sandbox).',
    ],
    images: ['/img/projects/gocart-demo.jpg'],
  },
  {
    id: 'adventures-of-muni',
    cover: '/img/projects/muni.png',
    name: 'The Adventures of Muni',
    kind: 'Interactive storybook',
    year: '2025',
    oneLiner: 'An interactive storyboard narrative — a storybook you can play.',
    role: 'Developer',
    stack: 'Web · animation · audio',
    status: 'Best Website · Best Overall Thesis',
    body: [
      'An interactive online storybook for children, told as a website: a realistic page-flipping effect, branching story paths, mini-games, animations, and full audio integration — playable in English or Tagalog.',
      'It won Best Website and Best Overall Thesis at the Perlas Awards, the first MMA awards night by HaloHalo.',
    ],
    images: [
      '/img/projects/muni-ipad.jpg',
      '/img/projects/muni-defense.jpg',
      '/img/projects/muni-awards.jpg',
      '/img/projects/muni-team.jpg',
      '/img/projects/muni-poster.jpg',
    ],
  },
  {
    id: 'ontyme',
    cover: '/img/projects/ontyme.png',
    name: 'OnTyme',
    kind: 'AI',
    year: '2025',
    oneLiner: 'A KYC AI agent',
    role: 'AI engineering',
    stack: 'Agentic AI · human-in-the-loop evals',
    status: 'Internal — GoTyme Bank',
    body: [
      'A KYC AI agent. It preprocesses submitted documents, runs forensic checks, extracts and validates data, then auto-resolves clean cases and routes flagged ones to human review.',
      'Compliance analysts evaluate the flagged cases in a companion Evals app — approving or correcting the agent’s verdicts, flagging which checks were right or wrong — and that feedback trains the model, so the agent gets better at every review.',
    ],
  },
  {
    id: 'lamai',
    cover: '/img/projects/lamai.svg',
    name: 'LamAI',
    kind: 'Creative · generative agents',
    year: '2025 —',
    oneLiner: 'A generative-agent murder mystery set at a Filipino wake.',
    role: 'Creator — story, agents, everything',
    stack: 'Generative agents · AI Town (Convex · Pixi)',
    status: 'In development',
    body: [
      'LamAI Case 01 — “The Lamay.” A generative-agent simulation of a Filipino wake. The deceased was murdered; one of the attendees did it. Each character is an autonomous AI agent with its own memory, goals, and relationship to the deceased — and only the killer knows the truth. The agents drink kape, eat pancit, gossip, pray the rosary, recall stories, and contradict each other in Taglish. A detective agent can join and interrogate the suspects, trying to triangulate the truth from conflicting accounts.',
      'The lamay is one of the most culturally distinctive Filipino settings imaginable — a multi-day gathering with built-in tension, tsismis, and stylized characters — and almost nobody is doing generative agents in Filipino cultural contexts. The murder framing turns a familiar setting into something darkly compelling and universally legible. And it is fully authored, not emergent: I own the story entirely.',
      'Under it sits a three-axis experiment: can a killer agent sustain a cover story under questioning; can a detective agent catch the lie; and — the axis I care most about — can a witness agent who knows the truth, but has no self-interest, keep someone else’s secret at personal cost.',
    ],
  },
]

/* Writing entries live as markdown in src/content/writing/*.md — the app
   loads them through src/lib/writing.ts (Vite glob). The type + excerpt
   helper re-export from the shared parser so existing imports keep working. */
export type { WritingEntry } from './markdown'
export { excerptOf } from './markdown'

/* ------------------------------ Library --------------------------------- */

export type LibraryKind = 'book' | 'album' | 'film'

export interface LibraryItem {
  kind: LibraryKind
  slug: string
  title: string
  creator: string // author / artist / director
  year: string
  rating?: 1 | 2 | 3 | 4 | 5
  review?: string
  cover: string
  spineColor?: string // books only — for the home shelf
  spineInk?: string
  url: string
}

export const LIBRARY: LibraryItem[] = [
  /* Books */
  { kind: 'book', slug: 'looking-for-alaska', title: 'Looking for Alaska', creator: 'John Green', year: '2005', cover: '/img/books/looking-for-alaska.jpg', spineColor: '#1b1b1b', spineInk: '#fff', url: '#' },
  { kind: 'book', slug: 'thinking-in-systems', title: 'Thinking in Systems', creator: 'Donella Meadows', year: '2008', cover: '/img/books/thinking-in-systems.jpg', spineColor: '#5a6b4d', spineInk: '#fff', url: '#' },
  { kind: 'book', slug: 'a-little-life', title: 'A Little Life', creator: 'Hanya Yanagihara', year: '2015', cover: '/img/books/a-little-life.jpg', spineColor: '#e7e3da', spineInk: '#1a1a1a', url: '#' },
  { kind: 'book', slug: 'on-earth-were-briefly-gorgeous', title: 'On Earth We\u2019re Briefly Gorgeous', creator: 'Ocean Vuong', year: '2019', cover: '/img/books/on-earth.jpg', spineColor: '#26506e', spineInk: '#fff', url: '#' },
  { kind: 'book', slug: 'the-anthropocene-reviewed', title: 'The Anthropocene Reviewed', creator: 'John Green', year: '2021', cover: '/img/books/anthropocene.jpg', spineColor: '#f2c94c', spineInk: '#1a1a1a', url: '#' },
  { kind: 'book', slug: 'the-creative-act', title: 'The Creative Act: A Way of Being', creator: 'Rick Rubin', year: '2023', cover: '/img/books/creative-act.jpg', spineColor: '#d9d6ce', spineInk: '#1a1a1a', url: '#' },

  /* Films */
  { kind: 'film', slug: 'the-haunting-of-hill-house', title: 'The Haunting of Hill House', creator: 'Mike Flanagan', year: '2018', cover: '/img/films/hill-house.svg', url: '#' },
  { kind: 'film', slug: 'everything-everywhere-all-at-once', title: 'Everything Everywhere All at Once', creator: 'Daniels', year: '2022', cover: '/img/films/eeaao.svg', url: '#' },
  { kind: 'film', slug: 'gone-girl', title: 'Gone Girl', creator: 'David Fincher', year: '2014', cover: '/img/films/gone-girl.svg', url: '#' },
  { kind: 'film', slug: 'the-odyssey', title: 'The Odyssey', creator: 'Christopher Nolan', year: '2026', cover: '/img/films/the-odyssey.svg', url: '#' },
]

export const BOOKS = LIBRARY.filter((i) => i.kind === 'book')
export const MUSIC = LIBRARY.filter((i) => i.kind === 'album')
export const FACED_ALBUM = 0
export const FACED_BOOK = 2

/* ------------------------------ Bag (mat board) -------------------------- */

export interface BagItem {
  name: string
  note: string
  image: string
  /** position + tilt on the cutting mat, in percent of the board */
  x: number
  y: number
  w: number
  rotate: number
}

export const BAG: BagItem[] = [
  { name: 'MacBook Pro M5 16″', note: 'powerhouse. runs llms locally', image: '/img/bag/macbook-pro.png', x: 6, y: 8, w: 30, rotate: -2 },
  { name: 'Fujifilm X-M5', note: 'the camera behind the photos below', image: '/img/bag/xm5.png', x: 66, y: 10, w: 24, rotate: -4 },
]

export const BAG_CAPTION = 'carried daily.'

/* ------------------------------ Photos ----------------------------------- */

export interface Photo {
  slug: string
  caption: string
  src: string
  /** aspect ratio height/width, for the masonry layout */
  tall: boolean
  /** Camera + exposure line shown in the photo sheet. */
  meta?: string
}

export const PHOTOS: Photo[] = [
  {
    slug: 'giu-xe',
    caption: 'Giữ xe',
    src: '/img/photos/giu-xe.jpeg',
    tall: true,
    meta: 'Fujifilm X-M5 · 42mm · ƒ4.5 · 1/800 · ISO 200',
  },
  {
    slug: 'basket-rider',
    caption: 'Morning rounds',
    src: '/img/photos/basket-rider.jpeg',
    tall: true,
    meta: 'Fujifilm X-M5 · 32mm · ƒ6.4 · 1/500 · ISO 1250',
  },
]

export const CONTACT = {
  email: 'nikos@descent.dev',
  x: 'https://x.com/nikos_pasion',
  instagram: 'https://www.instagram.com/nikospasion/',
  github: 'https://github.com/nikospasion',
  linkedin: 'https://www.linkedin.com/in/nikos-pasion-6943792a7/',
}
