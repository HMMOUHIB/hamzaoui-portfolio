// Static SVG stand-in for the WebGL network on mobile and reduced motion.
export default function NetworkFallback() {
  const tiers = [
    { y: 50, xs: [80, 160, 240, 320] },
    { y: 150, xs: [50, 120, 200, 280, 350] },
    { y: 250, xs: [30, 90, 150, 200, 250, 310, 370] },
  ]
  const lines = []
  tiers.slice(0, -1).forEach((t, ti) => {
    t.xs.forEach((x, i) => {
      const next = tiers[ti + 1].xs
      ;[i, i + 1].forEach((j) => next[j] !== undefined && lines.push([x, t.y, next[j], tiers[ti + 1].y, ti]))
    })
  })
  return (
    <svg className="net net--static" viewBox="0 0 400 300" aria-hidden="true" focusable="false">
      {tiers.map((t) => <line key={t.y} x1="10" x2="390" y1={t.y + 14} y2={t.y + 14} className="netf__tier" />)}
      {lines.map(([x1, y1, x2, y2, ti], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={ti === 1 && i % 3 === 0 ? 'netf__link is-hot' : 'netf__link'} />
      ))}
      {tiers.flatMap((t) => t.xs.map((x) => <circle key={`${x}-${t.y}`} cx={x} cy={t.y} r="3" className="netf__node" />))}
    </svg>
  )
}
