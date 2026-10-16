import { useRef } from 'react'
import { gsap, MQ, ScrollTrigger, useGSAP } from '../animations/gsap'
import { principles } from '../data/skills'
import ChapterIntro from './ChapterIntro'
import HellButterflies from './HellButterflies'
import SplitText from './SplitText'
import katanaSrc from '../assets/zine/katana.webp'
import '../styles/mind.css'

const pad = (n) => String(n).padStart(2, '0')
const kindOf = (p) => p.word.replace('.', '').toLowerCase()   // build · break · evolve · rebuild
// Every word is two stacked copies (see Verb): both copies must move as one, so per-letter values repeat per copy —
// `k % n` where n is the letter count of one copy.
const each = (n, s) => (k) => (k % n) * s
// where Rebuild's pieces fly in from
const scatter = (n) => ({
  yPercent: (k) => [-80, 60, -30, 90, -60, 40][(k % n) % 6],
  xPercent: (k) => [-20, 30, -40, 10, 25, -15][(k % n) % 6],
  rotate: (k) => [-18, 24, -8, 30, -26, 12][(k % n) % 6],
})

// Each motion acts out its own verb on the way in
const ENTER = {
  build: (tl, w, chars, at, n) => tl
    .fromTo(w.querySelector('.mind__base'), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power3.inOut' }, at)
    .fromTo(chars, { yPercent: -170, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: each(n, 0.04), duration: 0.34, ease: 'bounce.out' }, at + 0.08),
  break: (tl, w, chars, at, n) => tl
    .fromTo(chars, { yPercent: 110 }, { yPercent: 0, stagger: each(n, 0.03), duration: 0.4, ease: 'expo.out' }, at),
  evolve: (tl, w, chars, at, n) => tl
    .fromTo(chars, { yPercent: 110 }, { yPercent: 0, stagger: each(n, 0.03), duration: 0.35, ease: 'expo.out' }, at)
    .fromTo(chars, { backgroundPosition: '100% 0%' }, { backgroundPosition: '0% 0%', stagger: each(n, 0.04), duration: 0.24, ease: 'none' }, at + 0.3),
  rebuild: (tl, w, chars, at, n) => tl
    .fromTo(chars, { ...scatter(n), autoAlpha: 0 }, { yPercent: 0, xPercent: 0, rotate: 0, autoAlpha: 1, stagger: each(n, 0.03), duration: 0.45, ease: 'expo.out' }, at)
    .fromTo(w.querySelector('.mind__mark'), { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: 'power3.inOut' }, at + 0.45),
}

/**
 * The Getsuga Tenshō: the flame crescent flies in from `fromX`, crosses the verb from its left edge (t.left) to its
 * right edge (t.right) at a steady speed, and each letter splits along the cut as the crescent reaches it —
 * the top copy up, the bottom copy down. Positions are read on every ScrollTrigger refresh; timings are fixed,
 * and each letter's moment is its centre as a fraction of the word's width, which doesn't change with font size.
 */
function getsugaCut(tl, w, g, stage, t, fromX) {
  const verb = w.querySelector('.mind__verb')
  const top = w.querySelectorAll('.mind__half--a .char')
  const bottom = w.querySelectorAll('.mind__half--b .char')
  const frac = [...top].map((c) => (c.offsetLeft + c.offsetWidth / 2) / verb.offsetWidth)
  const when = (k) => (t.right - t.left) * frac[k]
  const box = () => {
    const a = verb.getBoundingClientRect(), s = stage.getBoundingClientRect()
    return { l: a.left - s.left, r: a.right - s.left, y: (a.top + a.bottom) / 2 - s.top }
  }
  const scar = w.querySelector('.mind__scar')
  return tl
    .set(w.querySelectorAll('.word'), { overflow: 'visible' }, t.launch)          // the halves must fly past the letter masks
    .fromTo(g, { x: fromX, y: () => box().y, scale: 0.5, autoAlpha: 0 }, { x: () => box().l, scale: 1, autoAlpha: 1, duration: t.left - t.launch, ease: 'power1.in' }, t.launch)
    .to(g, { x: () => box().r, duration: t.right - t.left, ease: 'none' }, t.left)
    .to(g, { x: () => stage.offsetWidth + 320, scale: 1.3, autoAlpha: 0, duration: t.exit - t.right, ease: 'power1.in' }, t.right)
    .fromTo(scar, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: t.right - t.left, ease: 'none' }, t.left)
    .to(top, { yPercent: -36, xPercent: 9, rotate: -8, autoAlpha: 0, duration: 0.14, ease: 'power2.out', stagger: when }, t.left)
    .to(bottom, { yPercent: 36, xPercent: -6, rotate: 7, autoAlpha: 0, duration: 0.14, ease: 'power2.out', stagger: when }, t.left)
    .to(w.querySelectorAll('.mind__base, .mind__mark, .mind__note'), { autoAlpha: 0, duration: 0.1 }, t.right)
    .to(scar, { autoAlpha: 0, duration: 0.08 }, t.exit)
}

// two stacked copies of the word, each keeping one side of the cut, so the Getsuga can split it
function Verb({ p }) {
  const kind = kindOf(p)
  return (
    <span className={`mind__verb mind__verb--${kind}`}>
      <span className="mind__half mind__half--a"><SplitText text={p.word} className="display" /></span>
      <span className="mind__half mind__half--b" aria-hidden="true"><SplitText text={p.word} className="display" /></span>
      {kind === 'build' && <span className="mind__base" aria-hidden="true" />}
      {kind === 'rebuild' && <span className="mind__mark" aria-hidden="true" />}
      <span className="mind__scar" aria-hidden="true" />
    </span>
  )
}

// the flame crescent: black core, red fire body and halo, a hot leading edge, flame tongues trailing behind
function Getsuga() {
  return (
    <svg className="mind__getsuga" viewBox="0 0 200 400" aria-hidden="true">
      <defs>
        <filter id="gt-flame" x="-60%" y="-20%" width="220%" height="140%">
          <feTurbulence className="mind__turb" type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="gt-halo" x="-80%" y="-30%" width="260%" height="160%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <linearGradient id="gt-fire" x1="0" x2="1">
          <stop offset="0" stopColor="#7a0a0a" />
          <stop offset="0.55" stopColor="#f2231b" />
          <stop offset="1" stopColor="#ff7a45" />
        </linearGradient>
      </defs>
      <g filter="url(#gt-halo)" opacity="0.85">
        <path d="M30 0C190 50 220 350 30 400C140 320 140 80 30 0Z" fill="#f2231b" />
      </g>
      <g filter="url(#gt-flame)">
        <path className="mind__tongue" d="M60 110C10 120-60 140-150 140M70 200C0 200-80 200-190 196M60 290C10 280-60 262-150 262" />
        <path d="M40 8C170 60 200 340 40 392C120 320 120 80 40 8Z" fill="url(#gt-fire)" />
        <path d="M58 58C150 108 166 292 58 342C110 290 110 110 58 58Z" fill="#0c0c0e" />
        <path d="M40 8C170 60 200 340 40 392" fill="none" stroke="#ffd2bf" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/**
 * Chapter 02: the four motions on a pinned stage. Each word plays its own entrance (Build drops onto a ruler,
 * Break rises, Evolve fills with ink, Rebuild reassembles), then the katana swings and a Getsuga Tenshō cuts it —
 * the cut lands as that word's stretch of scroll ends. Hell butterflies and a pale manga print behind. Phones:
 * each word reveals, then a Getsuga cuts it as it scrolls up.
 */
export default function Mind() {
  const root = useRef(null)
  const stage = useRef(null)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()
    const g = q('.mind__getsuga')[0]

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // the manga floor eases out of a slight zoom as the chapter passes
      gsap.fromTo(q('.mind__manga span'), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      // the flames flicker, only while the chapter is on screen
      const flicker = gsap.to(q('.mind__turb'), { attr: { baseFrequency: '0.055 0.14' }, duration: 0.16, repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true })
      ScrollTrigger.create({ trigger: root.current, start: 'top bottom', end: 'bottom top', onToggle: (s) => flicker.paused(!s.isActive) })
    })

    mm.add(MQ.desktop, () => {
      stage.current.classList.add('is-pinned')
      const words = q('.mind__word')
      const steps = q('.mind__steps li')
      const counter = q('.mind__count-num')[0]
      const sword = q('.mind__sword')[0]
      const arc = q('.mind__arc')[0]
      const flash = q('.mind__flash')[0]
      const wordsBox = q('.mind__words')[0]
      // the crescent leaves from the middle of the blade
      const fromX = () => sword.offsetLeft + sword.offsetWidth * 0.4
      gsap.set(sword, { rotation: -82, transformOrigin: '12% 50%' })
      let on = 0
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onUpdate: () => {
          const n = Math.min(words.length - 1, Math.floor(tl.time()))
          if (n === on) return
          on = n
          counter.textContent = pad(n + 1)
          steps.forEach((s, k) => s.classList.toggle('is-on', k === n))
        },
        scrollTrigger: { trigger: stage.current, start: 'top top', end: '+=400%', pin: true, scrub: 0.8, invalidateOnRefresh: true },
      })
      words.forEach((w, i) => {
        const chars = w.querySelectorAll('.char')
        tl.set(w, { autoAlpha: 1 }, i)
          .fromTo(w.querySelectorAll('.mind__note li'), { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.3 }, i + 0.2)
        ENTER[w.dataset.kind](tl, w, chars, i, chars.length / 2)
        // wind up, swing, the crescent flies; the last letter splits just as this word's scroll runs out
        const t = { launch: i + 0.66, left: i + 0.71, right: i + 0.86, exit: i + 0.96 }
        tl.to(sword, { rotation: -118, duration: 0.1, ease: 'power2.out' }, i + 0.5)
          .to(sword, { rotation: 38, duration: 0.09, ease: 'power3.in' }, i + 0.6)
          .fromTo(arc, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, i + 0.63)
          .to(arc, { autoAlpha: 0, duration: 0.1 }, i + 0.69)
        getsugaCut(tl, w, g, stage.current, t, fromX)
        tl.fromTo(flash, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, t.left)
          .to(flash, { autoAlpha: 0, duration: 0.12 }, t.left + 0.03)
          .to(wordsBox, { keyframes: { x: [0, -10, 8, -5, 2, 0], y: [0, 5, -4, 2, -1, 0] }, duration: 0.07, ease: 'none' }, t.left)
          .set(w, { autoAlpha: 0 }, i + 1)
        if (i < words.length - 1) tl.to(sword, { rotation: -82, duration: 0.14, ease: 'power2.inOut' }, i + 0.92)
      })
      tl.to(q('.mind__bar-fill'), { scaleX: 1, ease: 'none', duration: words.length }, 0)
      return () => stage.current?.classList.remove('is-pinned')
    })

    mm.add(MQ.mobile, () => {
      q('.mind__word').forEach((w) => {
        const chars = w.querySelectorAll('.char')
        const n = chars.length / 2
        const tl = gsap.timeline({ scrollTrigger: { trigger: w, start: 'top 80%', once: true } })
          .fromTo(chars, { yPercent: 110 }, { yPercent: 0, stagger: each(n, 0.03), duration: 0.7, ease: 'expo.out' })
          .fromTo(w.querySelectorAll('.mind__note li'), { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.5 }, 0.2)
          .fromTo(w.querySelectorAll('.mind__base, .mind__mark'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0.3)
        if (w.dataset.kind === 'evolve') tl.fromTo(chars, { backgroundPosition: '100% 0%' }, { backgroundPosition: '0% 0%', stagger: each(n, 0.05), duration: 0.4, ease: 'none' }, 0.5)
        // as the word scrolls up past the middle, a Getsuga cuts it — done by the time it nears the top
        const cut = gsap.timeline({ scrollTrigger: { trigger: w.querySelector('.mind__verb'), start: 'top 42%', end: 'top 18%', scrub: 0.6, invalidateOnRefresh: true } })
        getsugaCut(cut, w, g, stage.current, { launch: 0, left: 0.2, right: 0.75, exit: 1 }, () => -120)
      })
    })
  }, { scope: root })

  return (
    <section id="mind" className="mind" ref={root} aria-labelledby="mind-title">

      {/* Drifting ink wash — the chapter's own animated background */}
      <div className="mind__ink" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
      {/* A pale manga panel (bleach2) printed into the paper, held in view while the chapter scrolls */}
      <div className="mind__manga" aria-hidden="true"><span /></div>

      <div className="mind__inner">
        <ChapterIntro
          id="mind-title"
          num="02"
          garden="mind"
          title="Mind"
          lead={['Every system I have built', 'went through the same four motions.']}
        />

        <div className="mind__stage" ref={stage}>
          <HellButterflies />
          <span className="mind__flash" aria-hidden="true" />
          <span className="mind__arc" aria-hidden="true" />
          <img className="mind__sword" src={katanaSrc} alt="" loading="lazy" decoding="async" draggable="false" />
          <div className="mind__rail" aria-hidden="true">
            <p className="mind__count">
              <span className="mind__count-num">01</span>
              <span className="mind__count-of">/ {pad(principles.length)}</span>
            </p>
            <ol className="mind__steps">
              {principles.map((p, i) => (
                <li key={p.word} className={i === 0 ? 'is-on' : ''}><b />{p.word.replace('.', '')}</li>
              ))}
            </ol>
          </div>
          <ol className="mind__words">
            {principles.map((p) => (
              <li className="mind__word" key={p.word} data-kind={kindOf(p)}>
                <Verb p={p} />
                <ul className="mind__note">
                  {p.lines.map((l) => <li key={l}>{l}</li>)}
                </ul>
              </li>
            ))}
          </ol>
          <Getsuga />
          <span className="mind__bar" aria-hidden="true"><span className="mind__bar-fill" /></span>
        </div>
      </div>

    </section>
  )
}
