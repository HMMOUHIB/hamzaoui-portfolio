// Shared pieces of the paper-zine look (after src/ref/mainref.mp4): the ✸ ✦ ♣ dingbats, polaroids,
// the design-tool selection box and the torn black band edges. Styles in styles/zine.css.
import '../styles/zine.css'

const BURST = Array.from({ length: 16 }, (_, i) => {
  const a = (Math.PI / 8) * i - Math.PI / 2
  const r = i % 2 ? 4.4 : 12
  return `${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`
}).join(' ')

/** ✸ ✦ ♣ drawn as SVG, so they never fall back to an emoji font. */
export function Dingbats({ className = '' }) {
  return (
    <span className={`dingbats ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24"><polygon points={BURST} /></svg>
      <svg viewBox="0 0 24 24"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" /></svg>
      <svg viewBox="0 0 24 24"><circle cx="12" cy="6.4" r="5.2" /><circle cx="6.2" cy="13.4" r="5.2" /><circle cx="17.8" cy="13.4" r="5.2" /><path d="M12 11 L15.2 23.5 H8.8 Z" /></svg>
    </span>
  )
}

/** A white-bordered print, tilted. `tape` adds a strip of masking tape across the top. */
export function Polaroid({ children, caption, tilt = -3, tape = false, className = '' }) {
  return (
    <figure className={`polaroid ${tape ? 'polaroid--tape' : ''} ${className}`} style={{ '--tilt': `${tilt}deg` }}>
      <div className="polaroid__photo">{children}</div>
      {caption && <figcaption className="polaroid__cap">{caption}</figcaption>}
    </figure>
  )
}

/** A design-tool transform box: hairline frame with eight square handles. */
export function SelectionBox({ children, className = '' }) {
  return (
    <div className={`selbox ${className}`}>
      {children}
      <span className="selbox__frame" aria-hidden="true">
        {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => <i key={h} className={`selbox__h selbox__h--${h}`} />)}
      </span>
    </div>
  )
}

// Deterministic torn edge: black below a ragged line, white paper fibres along it.
function rng(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
}
function tornPaths(seed) {
  const r = rng(seed)
  const pts = []
  for (let x = 0; x <= 1000; x += 4 + r() * 10) pts.push([x, 12 + r() * 14 + (r() < 0.12 ? r() * 8 : 0)])
  pts.push([1000, 18])
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')
  // fibres hang over the black side of the tear (white on light paper would vanish)
  const fibre = pts.map(([x, y]) => `${x.toFixed(1)},${(y + 1.5 + r() * 5).toFixed(1)}`).reverse().join(' L')
  return { ink: `M0,40 L${line} L1000,40 Z`, fibre: `M${line} L${fibre} Z` }
}
const TOP = tornPaths(11)
const BOTTOM = tornPaths(29)

/** The ragged top or bottom edge of a black band (the bottom one is the top one flipped). */
export function TornEdge({ side = 'top' }) {
  const p = side === 'top' ? TOP : BOTTOM
  return (
    <svg className={`torn torn--${side}`} viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="torn__ink" d={p.ink} />
      <path className="torn__fibre" d={p.fibre} />
    </svg>
  )
}
