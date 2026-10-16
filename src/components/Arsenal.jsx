import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { arsenal } from '../data/skills'
import { iconFor } from '../data/icons'
import IconBox from './IconBox'
import { useReducedMotion } from '../hooks/useMediaQuery'
import ChapterIntro from './ChapterIntro'
import { sfx, unlock } from './sfx'
import swordsSrc from '../assets/bleach/swords.webp'
import { Polaroid } from './Zine'
import '../styles/arsenal.css'


const GRIPS = Array.from({ length: 16 }, (_, i) => i * 22.5).filter((a) => a % 90 !== 0)
const BROWSE_MS = 1700

function Strap() {
  const links = Array.from({ length: 13 }, (_, i) => 40 + i * 40)
  return (
    <svg className="omni__strap" viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="592" height="172" rx="34" className="omni__band" />
      <rect x="22" y="44" width="556" height="92" rx="14" className="omni__band-inset" />
      {links.map((x) => <line key={x} x1={x} x2={x} y1="44" y2="136" className="omni__band-link" />)}
      <rect x="40" y="74" width="34" height="32" rx="6" className="omni__light" />
      <rect x="526" y="74" width="34" height="32" rx="6" className="omni__light" />
    </svg>
  )
}

function Bezel({ category, step }) {
  return (
    <svg className="omni__bezel" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <g className="omni__rot" style={{ '--rot': `${-category * 90}deg` }}>
        <circle cx="200" cy="200" r="190" className="omni__ring" />
        {GRIPS.map((a) => (
          <rect key={a} x="186" y="16" width="28" height="22" rx="4" transform={`rotate(${a} 200 200)`} className="omni__grip" />
        ))}
        {[0, 90, 180, 270].map((a, i) => (
          <path key={a} d="M176 12 L224 12 L214 42 L186 42 Z" transform={`rotate(${a} 200 200)`}
            className={i === category ? 'omni__notch is-active' : 'omni__notch'} />
        ))}
        <circle cx="200" cy="200" r="160" className="omni__inner" />
      </g>
      <g className="omni__dial" style={{ '--spin': `${step * 30}deg` }}>
        <circle cx="200" cy="200" r="153" className="omni__glow" />
      </g>
      <path d="M190 -14 L210 -14 L200 2 Z" className="omni__led" />
    </svg>
  )
}

// The faceplate in selection mode: lit hourglass, dark wedges, the current skill projected in front of it.
function Face({ skill, onSlam, label }) {
  const Icon = iconFor(skill.name)?.Icon
  return (
    <button type="button" className="omni__face" onClick={onSlam} aria-label={label}>
      <svg className="omni__glass" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <polygon className="omni__wedge omni__wedge--l" points="-2,-2 50,50 -2,102" />
        <polygon className="omni__wedge omni__wedge--r" points="102,-2 50,50 102,102" />
        <polygon className="omni__hourglass" points="15,10 85,10 50,50 85,90 15,90 50,50" />
      </svg>
      <span className="omni__holo" aria-hidden="true">{Icon && <Icon />}</span>
      <span className="omni__scan" aria-hidden="true" />
      <span className="omni__flash" aria-hidden="true" />
    </button>
  )
}

// Replay the icon-box entrance when a panel is shown again.
function replayBoxes(panel) {
  panel?.querySelectorAll('.ibox').forEach((el) => {
    el.classList.remove('is-in')
    void el.offsetWidth
    el.classList.add('is-in')
  })
}

export default function Arsenal() {
  const [active, setActive] = useState(0)
  const [pick, setPick] = useState(0)     // which skill of the category the watch is showing
  const [slam, setSlam] = useState(0)     // bumps on every category change or press of the face
  const [hold, setHold] = useState(false) // pointer over the watch or the list: stop browsing
  const [inView, setInView] = useState(false)
  const root = useRef(null)
  const core = useRef(null)
  const tabRefs = useRef([])
  const reduced = useReducedMotion()

  const current = arsenal[active]
  const skill = current.skills[pick % current.skills.length]
  // sounds only on the visitor's own clicks / keys, never on the automatic browse
  const choose = (i) => { unlock(); sfx.dial(); setActive(i); setPick(0); setSlam((s) => s + 1) }
  const press = () => { unlock(); sfx.slam(); setPick((p) => (p + 1) % current.skills.length); setSlam((s) => s + 1) }

  // Browse the category on its own while the watch is on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(core.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (reduced || hold || !inView) return undefined
    const t = setInterval(() => setPick((p) => (p + 1) % arsenal[active].skills.length), BROWSE_MS)
    return () => clearInterval(t)
  }, [reduced, hold, inView, active])

  // Category change or press: the hourglass slams shut with a green flash and the face bounces.
  useGSAP(() => {
    if (reduced) return
    gsap.timeline()
      .fromTo('.omni__wedge--l', { xPercent: -80 }, { xPercent: 0, duration: 0.42, ease: 'back.out(1.7)' }, 0)
      .fromTo('.omni__wedge--r', { xPercent: 80 }, { xPercent: 0, duration: 0.42, ease: 'back.out(1.7)' }, 0)
      .fromTo('.omni__flash', { autoAlpha: 1, scale: 0.3 }, { autoAlpha: 0, scale: 1.4, duration: 1, ease: 'power3.in' }, 0.12)
      .fromTo('.omni__face', { scale: 0.9 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.45)' }, 0.12)
  }, { scope: root, dependencies: [slam, reduced] })

  // Every new skill: the hologram flickers in.
  useGSAP(() => {
    if (reduced) return
    gsap.timeline()
      .fromTo('.omni__holo', { autoAlpha: 0, scale: 0.55, skewX: 16 }, { autoAlpha: 1, scale: 1, skewX: 0, duration: 0.42, ease: 'back.out(2)' })
      .fromTo('.omni__lcd-name', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'steps(3)' }, 0)
  }, { scope: root, dependencies: [active, pick, reduced] })

  // Category change: the list rises in.
  useGSAP(() => {
    if (reduced) return
    const id = arsenal[active].id
    gsap.timeline()
      .fromTo(`#panel-${id} .arsenal__skill-inner`, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.04, ease: 'expo.out' }, 0.1)
      .add(() => replayBoxes(root.current.querySelector(`#panel-${id}`)), 0.15)
      .fromTo(`#panel-${id} .arsenal__note`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.3)
  }, { scope: root, dependencies: [active, reduced] })

  const onKeyDown = (e) => {
    const n = arsenal.length
    let next = null
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (active + 1) % n
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (active - 1 + n) % n
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = n - 1
    if (next !== null) {
      e.preventDefault()
      choose(next)
      tabRefs.current[next]?.focus()
    }
  }

  const next = current.skills[(pick + 1) % current.skills.length]

  return (
    <section id="arsenal" className="arsenal" ref={root} aria-labelledby="arsenal-title">
      <Polaroid className="arsenal__print" tilt={5} tape caption="the field of blades">
        <img src={swordsSrc} alt="" loading="lazy" decoding="async" />
      </Polaroid>
      <ChapterIntro
        id="arsenal-title"
        num="03"
        garden="arsenal"
        title="Arsenal"
        lead={['No percentages.', 'Only what has been used to ship.']}
      />

      <div className="arsenal__body">
        <div className="arsenal__tabs" role="tablist" aria-label="Skill categories" aria-orientation="vertical" onKeyDown={onKeyDown}>
          {arsenal.map((cat, i) => (
            <button
              key={cat.id}
              ref={(el) => (tabRefs.current[i] = el)}
              role="tab"
              id={`tab-${cat.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${cat.id}`}
              tabIndex={i === active ? 0 : -1}
              className={`arsenal__tab ${i === active ? 'is-active' : ''}`}
              onClick={() => choose(i)}
            >
              <span className="arsenal__tab-idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="arsenal__tab-name">{cat.name}</span>
            </button>
          ))}
        </div>

        <div
          className="arsenal__core omni"
          ref={core}
          onPointerEnter={() => setHold(true)}
          onPointerLeave={() => setHold(false)}
        >
          <Strap />
          <Bezel category={active} step={pick} />
          <Face skill={skill} onSlam={press} label={`Next skill: ${next.name}`} />
          <p className="omni__lcd" aria-hidden="true">
            <span className="omni__lcd-idx">{String(pick + 1).padStart(2, '0')}</span>
            <span className="omni__lcd-name">{skill.name}{skill.learning ? ' ·' : ''}</span>
          </p>
        </div>

        {arsenal.map((cat, i) => (
          <div
            key={cat.id}
            id={`panel-${cat.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${cat.id}`}
            hidden={i !== active}
            className="arsenal__panel"
            onPointerEnter={() => setHold(true)}
            onPointerLeave={() => setHold(false)}
          >
            <p className="arsenal__note">{cat.note}</p>
            <ul className="arsenal__skills">
              {cat.skills.map((s, k) => (
                <li
                  key={s.name}
                  className={`arsenal__skill ${s.learning ? 'is-learning' : ''} ${i === active && k === pick ? 'is-current' : ''}`}
                  onPointerEnter={() => setPick(k)}
                >
                  <span className="arsenal__skill-inner">
                    <IconBox name={s.name} size="sm" i={k} />
                    {s.name}
                    {s.learning && <em className="arsenal__learning">in progress</em>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
