import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/instrument-sans'
import '@fontsource/fragment-mono'
import '@fontsource/gochi-hand'
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'

import './styles/tokens.css'
import './styles/global.css'
import './components/layout.css'
import './components/ui/typer.css'
import './components/ui/badge-trail.css'
import './components/dither.css'
import './components/lists.css'
import './components/pages.css'
import './components/intro/intro.css'
import './components/projects/projects.css'
import './components/shelf/shelf.css'
import './components/photos/photos.css'
import './components/bag/mat.css'
import './components/ticket/ticket.css'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
