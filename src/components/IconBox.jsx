import { useEffect, useRef } from 'react'
import { iconFor } from '../data/icons'
import '../styles/iconbox.css'

// One shared observer pops every box in the first time it scrolls into view.
let observer = null
function observe(el) {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); observer.unobserve(e.target) }
      })
    }, { rootMargin: '0px 0px -8% 0px' })
  }
  observer.observe(el)
  return () => observer.unobserve(el)
}

/**
 * A coloured, animated icon tile. Brand-tinted fill and border, a light
 * sweep that passes across it every few seconds, a gentle float, and a
 * lift + glow on hover. `i` staggers the entrance and the sweep.
 */
export default function IconBox({ name, size = 'md', i = 0, className = '' }) {
  const ref = useRef(null)
  const hit = iconFor(name)
  useEffect(() => (ref.current ? observe(ref.current) : undefined), [])
  if (!hit) return null
  const { Icon, color } = hit
  return (
    <span
      ref={ref}
      className={`ibox ibox--${size} ${className}`}
      style={{ '--c': color, '--i': i }}
      aria-hidden="true"
    >
      <span className="ibox__glyph"><Icon /></span>
    </span>
  )
}
