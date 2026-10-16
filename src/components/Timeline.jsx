import { Component, lazy, Suspense, useEffect, useReducer, useRef, useState } from 'react'
import { handheld as COLS } from '../data/handheld'
import { identity } from '../data/identity'
import { timeline } from '../data/timeline'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { sfx, unlock } from './sfx'
import '../styles/timeline.css'

const PspScene = lazy(() => import('./psp/PspScene'))

const NAME = { first: identity.firstName, last: identity.lastName }

function reduce(s, a) {
  if (a.type === 'start') return { ...s, power: s.power === 'off' ? 'boot' : 'off', open: false }
  if (a.type === 'focus') return { ...s, focus: true, power: s.power === 'off' ? 'boot' : s.power }
  if (a.type === 'blur') return { ...s, focus: false, open: false }
  if (a.type === 'booted') return s.power === 'boot' ? { ...s, power: 'on' } : s
  if (a.type === 'jump') return { ...s, power: s.power === 'off' ? 'boot' : s.power, col: a.col, row: 0, open: false }
  if (a.type === 'select') return { ...s, theme: s.theme + 1 }
  if (s.power === 'off') return a.type === 'enter' ? { ...s, power: 'boot' } : s   // any confirm wakes it
  if (a.type === 'back' && !s.open && s.focus) return { ...s, focus: false }      // ○ / Esc with nothing open zooms back out
  if (s.power !== 'on') return s
  const last = COLS[s.col].items.length - 1
  switch (a.type) {
    case 'left': return s.open ? s : { ...s, col: Math.max(0, s.col - 1), row: 0 }
    case 'right': return s.open ? s : { ...s, col: Math.min(COLS.length - 1, s.col + 1), row: 0 }
    case 'up': return s.open ? s : { ...s, row: Math.max(0, s.row - 1) }
    case 'down': return s.open ? s : { ...s, row: Math.min(last, s.row + 1) }
    case 'enter': return { ...s, open: true }
    case 'back': return { ...s, open: false }
    case 'home': return { ...s, col: 0, row: 0, open: false }
    default: return s
  }
}

// No WebGL: fall back to the plain list.
class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFail() }
  render() { return this.state.failed ? null : this.props.children }
}

const KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Enter: 'enter', ' ': 'enter', Escape: 'back', Backspace: 'back' }
const PAD = [
  ['start', 'START', 'Power'], ['select', 'SELECT', 'Change colour'], ['left', '◀', 'Previous year'], ['up', '▲', 'Previous item'],
  ['down', '▼', 'Next item'], ['right', '▶', 'Next year'], ['enter', '✕', 'Open'], ['back', '○', 'Back'],
]

/**
 * The timeline lives on a handheld: a chrome PSP floating in 3D (after src/ref/psp.mp4). Drag to spin it, press START,
 * and the years open as an XMB-style menu. The year rail, the pad under the stage and the keyboard drive the same state.
 */
export default function Timeline() {
  const [s, send] = useReducer(reduce, { power: 'off', col: 1, row: 0, open: false, theme: 0, focus: false })
  const [near, setNear] = useState(false)
  const [inView, setInView] = useState(false)
  const [whole, setWhole] = useState(false)
  const [failed, setFailed] = useState(false)
  const stage = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = stage.current
    const warm = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '600px 0px' })
    const live = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); setWhole(e.intersectionRatio > 0.97) }, { threshold: [0, 0.97, 1] })
    warm.observe(el); live.observe(el)
    return () => { warm.disconnect(); live.disconnect() }
  }, [])

  // zoomed onto the screen: the keyboard drives it straight away
  useEffect(() => { if (s.focus) stage.current.focus({ preventScroll: true }) }, [s.focus])

  // the handheld's sounds follow what changed, whichever input caused it (keys, pad, rail, the 3D device)
  const prev = useRef(s)
  useEffect(() => {
    const p = prev.current
    prev.current = s
    if (p === s) return
    if (p.power === 'off' && s.power !== 'off') sfx.boot()
    else if (p.power !== 'off' && s.power === 'off') sfx.off()
    else if (!p.open && s.open) sfx.open()
    else if ((p.open && !s.open) || (p.focus && !s.focus)) sfx.back()
    else if (p.col !== s.col || p.row !== s.row) sfx.move()
    else if (p.theme !== s.theme) sfx.select()
  }, [s])

  useEffect(() => {
    if (s.power !== 'boot') return undefined
    const t = setTimeout(() => send({ type: 'booted' }), reduced ? 0 : 2000)
    return () => clearTimeout(t)
  }, [s.power, reduced])

  const onKeyDown = (e) => {
    const type = KEYS[e.key]
    if (!type) return
    e.preventDefault()
    send({ type: s.power === 'off' && type === 'enter' ? 'focus' : type })
  }

  const col = COLS[s.col]
  const item = col.items[s.row]
  const say = s.power === 'off' ? 'Press START, or click the handheld, to switch on the story.'
    : s.power === 'boot' ? 'Starting.'
      : s.open ? `${col.year}. ${item.name}.`
        : `${col.year}: ${item.name}${item.sub ? `, ${item.sub}` : ''}. ${s.row + 1} of ${col.items.length}.`
  const detail = s.open ? item.parts.map((p) => `${p.label}: ${p.text}.`).join(' ') : ''

  return (
    <div className="tl" onPointerDownCapture={unlock} onKeyDownCapture={unlock}>
      <div className="tl__rail" role="group" aria-label="Jump to a year">
        {COLS.map((c, i) => (
          <button
            key={c.year}
            className={`tl__year-btn ${s.power !== 'off' && i === s.col ? 'is-active' : ''}`}
            aria-pressed={s.power !== 'off' && i === s.col}
            onClick={() => send({ type: 'jump', col: i })}
          >
            {c.year}
          </button>
        ))}
      </div>

      <div
        className={`tl__stage is-${s.power} ${s.focus ? 'is-focus' : ''}`}
        ref={stage}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Story handheld. Enter switches it on and opens an item, arrow keys browse, Escape steps back. Drag to spin it."
        hidden={failed}
      >
        {near && !failed && (
          <Boundary onFail={() => setFailed(true)}>
            <Suspense fallback={null}>
              <PspScene state={s} send={send} cols={COLS} name={NAME} active={inView} whole={whole} reduced={reduced} />
            </Suspense>
          </Boundary>
        )}
      </div>
      <p className="tl__hint" aria-hidden="true">
        {s.focus ? 'Arrows browse · Enter opens · Esc steps back' : 'Click the PSP to zoom in · drag to spin'}
      </p>

      {!failed && (
        <div className="tl__pad" role="group" aria-label="Handheld buttons">
          {PAD.map(([type, glyph, label]) => (
            <button key={type} type="button" className={`tl__key tl__key--${type}`} aria-label={label} onClick={() => send({ type })}>
              {glyph}
            </button>
          ))}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{say} {detail}</p>

      <ol className={`tl__track ${failed ? '' : 'sr-only'}`}>
        {timeline.map((t) => (
          <li className={`tl__item ${t.future ? 'tl__item--future' : ''}`} key={t.year}>
            <span className="tl__year" aria-hidden="true">{t.year}</span>
            <div className="tl__card">
              <h3>{t.title}</h3>
              <p className="tl__place">{t.place}</p>
              <p className="tl__body">{t.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
