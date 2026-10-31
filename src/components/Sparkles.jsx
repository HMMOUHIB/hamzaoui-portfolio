// The glints from the reference: four-point stars that twinkle on random gems. Positions are % of the logo box; every
// star scales and fades in place (no rotation) on its own delay, so the loop never reads as a repeat.
const STARS = [ // x, y, size (em of the box's font-size), delay
  [8, 24, 0.34, 0.2], [30, 70, 0.26, 1.7], [47, 14, 0.38, 0.9], [62, 58, 0.28, 2.6],
  [78, 26, 0.36, 1.3], [92, 62, 0.3, 0.5], [22, 40, 0.22, 3.1], [70, 80, 0.24, 2.1],
]

export default function Sparkles({ className = '' }) {
  return (
    <span className={`sparks ${className}`} aria-hidden="true">
      {STARS.map(([x, y, s, d], i) => (
        <i key={i} style={{ left: `${x}%`, top: `${y}%`, '--s': `${s}em`, '--d': `${d}s` }} />
      ))}
    </span>
  )
}
