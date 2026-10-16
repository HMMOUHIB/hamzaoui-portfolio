import IconBox from '../IconBox'
import './FloatingIcons.css'

// name → registry key in data/icons.js · x/y in % of the layer · depth drives parallax and blur.
const ITEMS = [
  { name: 'React.js', x: 2, y: 6, size: 'lg', depth: 0.9, d: 9 },
  { name: 'Symfony', x: 44, y: 2, size: 'md', depth: 0.5, d: 11 },
  { name: 'JavaScript', x: 92, y: 9, size: 'md', depth: 1.1, d: 8 },
  { name: 'Linux', x: 8, y: 30, size: 'md', depth: 0.4, d: 12 },
  { name: 'AWS', x: 95, y: 34, size: 'lg', depth: 0.8, d: 10 },
  { name: 'GSAP', x: 47, y: 22, size: 'sm', depth: 1.3, d: 7 },
  { name: 'Git', x: 3, y: 56, size: 'sm', depth: 1.2, d: 8 },
  { name: 'MySQL', x: 90, y: 58, size: 'md', depth: 0.6, d: 13 },
  { name: 'Spring Boot', x: 50, y: 48, size: 'sm', depth: 0.3, d: 12 },
  { name: 'Terraform', x: 12, y: 80, size: 'md', depth: 1, d: 9 },
  { name: 'HTML5', x: 46, y: 88, size: 'lg', depth: 0.7, d: 11 },
  { name: 'Kubernetes', x: 93, y: 84, size: 'sm', depth: 1.4, d: 7 },
  { name: 'CSS3', x: 28, y: 12, size: 'sm', depth: 0.6, d: 10 },
  { name: 'Figma', x: 72, y: 70, size: 'sm', depth: 0.9, d: 12 },
]

/** Brand-coloured icon boxes drifting behind a section. Purely decorative. */
export default function FloatingIcons({ tone = 'dark' }) {
  const items = tone === 'light' ? ITEMS.map((it) => (it.name === 'Symfony' ? { ...it, name: 'PHP' } : it)) : ITEMS
  return (
    <div className={`floaters${tone === 'light' ? ' floaters--light' : ''}`} aria-hidden="true">
      {items.map((it, i) => (
        <span
          key={it.name}
          className="floater"
          data-depth={it.depth}
          style={{
            left: `${it.x}%`, top: `${it.y}%`,
            '--d': `${it.d}s`, '--dl': `${-i * 1.3}s`,
            '--dx': `${(i % 2 ? -1 : 1) * (14 + (i % 4) * 6)}px`, '--dy': `${(i % 3 ? 1 : -1) * (18 + (i % 5) * 5)}px`,
            '--r': `${(i % 2 ? -1 : 1) * (6 + (i % 3) * 4)}deg`,
            '--blur': `${Math.max(0, (1 - it.depth) * 1.6)}px`,
          }}
        >
          <IconBox name={it.name} size={it.size} i={i} />
        </span>
      ))}
    </div>
  )
}
