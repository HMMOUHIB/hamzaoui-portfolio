import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import './styles/pulse.css' // last, so the pulse overrides component styles
import { ScrollTrigger } from './animations/gsap'

// The 3-second opener plays on every load unless motion is reduced; the hero waits for it (components/MotionIntro).
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.dataset.intro = 'playing'

// Always start at the top — the awakening is the first frame.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// Web fonts change text metrics — re-measure every trigger once they land.
document.fonts?.ready.then(() => ScrollTrigger.refresh())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
