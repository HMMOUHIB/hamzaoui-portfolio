import { useEffect, useState } from 'react'
import '../styles/atmosphere.css'

const META = { dark: '#050508', light: '#ececec' }

// Light / dark. The page sets data-theme before first paint (index.html); this flips it, remembers the choice, and
// follows the system setting until the visitor has chosen.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  const apply = (next, save) => {
    const root = document.documentElement
    root.classList.add('theme-fade')
    root.dataset.theme = next
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META[next])
    if (save) { try { localStorage.setItem('theme', next) } catch { /* private mode: the choice just isn't remembered */ } }
    setTheme(next)
    setTimeout(() => root.classList.remove('theme-fade'), 500)
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const follow = (e) => {
      let saved = null
      try { saved = localStorage.getItem('theme') } catch { /* ignore */ }
      if (!saved) apply(e.matches ? 'light' : 'dark', false)
    }
    mq.addEventListener('change', follow)
    return () => mq.removeEventListener('change', follow)
  }, [])

  const dark = theme === 'dark'
  return (
    <button type="button" className="theme" onClick={() => apply(dark ? 'light' : 'dark', true)} aria-pressed={!dark} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <svg className="theme__icon" viewBox="0 0 24 24" aria-hidden="true">
        {dark
          ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
          : <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />}
      </svg>
      invert
    </button>
  )
}
