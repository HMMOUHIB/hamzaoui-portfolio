import { useRef } from 'react'
import { gsap, MQ, ScrollTrigger, useGSAP } from '../animations/gsap'
import { parcours } from '../data/parcours'
import SplitText from './SplitText'
import '../styles/parcours.css'

const pad = (n) => String(n).padStart(2, '0')
const TOTAL = pad(parcours.length)
const GRID_ON = { scale: 1, autoAlpha: 1, filter: 'blur(0px)' }
const GRID_OFF = { scale: 0.86, autoAlpha: 0.12, filter: 'blur(6px)' }

// The crosshair that locks onto a figure
function Reticle() {
  return (
    <svg className="pc-reticle" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="22" />
      <circle cx="50" cy="50" r="3" className="pc-reticle__dot" />
      <path d="M50 8v22M50 70v22M8 50h22M70 50h22" />
      <path d="M26 26l6 6M74 26l-6 6M26 74l6-6M74 74l-6-6" className="pc-reticle__ticks" />
    </svg>
  )
}

// The red cross painted over a chapter once it has been told
function Cross() {
  return (
    <svg className="pc-x" viewBox="0 0 100 100" aria-hidden="true">
      <path pathLength="1" d="M18 20 C40 42, 58 60, 84 82" />
      <path pathLength="1" d="M82 18 C60 40, 42 62, 16 84" />
    </svg>
  )
}

/**
 * Parcours: six frames, one story. Desktop pins the stage; a crosshair acquires each figure in turn, the frame
 * glitches open from silhouette to full colour while its chapter is told, then it is crossed off and the next one
 * is acquired. Phones get the chapters as a scroll of film frames; reduced motion gets everything, still.
 */
export default function Parcours() {
  const root = useRef(null)
  const stage = useRef(null)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add(MQ.desktop, () => {
      const el = root.current
      el.classList.add('is-stage')
      const grid = q('.pc-grid')[0]
      const cells = q('.pc-cell')
      const scenes = q('.pc-scene')
      const counter = q('.pc-hud__num')[0]
      const fill = q('.pc-hud__fill')[0]
      const ticks = q('.pc-hud__ticks li')
      const outro = q('.pc-outro')[0]

      gsap.set(scenes, { autoAlpha: 0 })
      gsap.set(q('.pc-shot'), { clipPath: 'inset(50% 0% 50% 0%)' })
      gsap.set(q('.pc-reticle'), { autoAlpha: 0 })
      gsap.set(outro, { autoAlpha: 0 })

      // the six figures assemble once, as the stage scrolls into view
      gsap.fromTo(cells, { autoAlpha: 0, y: 40, filter: 'blur(10px)' }, {
        autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: { each: 0.08, from: 'center' },
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      })

      const SPAN = 3
      let on = -1
      let done = -1
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onUpdate: () => {
          const time = tl.time()
          const n = Math.max(0, Math.min(parcours.length - 1, Math.floor((time - 0.2) / SPAN)))
          // a chapter is crossed off once its frame has wiped out (CSS draws the cross and dims the figure)
          const cleared = Math.max(0, Math.min(parcours.length, Math.floor((time - 0.4 - 2.7) / SPAN) + 1))
          if (n === on && cleared === done) return
          on = n
          done = cleared
          counter.textContent = pad(n + 1)
          ticks.forEach((t, k) => t.classList.toggle('is-on', k <= n))
          cells.forEach((c, k) => c.classList.toggle('is-cleared', k < cleared))
        },
        scrollTrigger: {
          trigger: stage.current, start: 'top top', end: `+=${parcours.length * 115 + 60}%`,
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          snap: { snapTo: 'labels', duration: { min: 0.35, max: 1 }, delay: 0.1, ease: 'power2.inOut' },
        },
      })
      tl.addLabel('start', 0)

      scenes.forEach((scene, i) => {
        const t = 0.4 + i * SPAN
        const cell = cells[i]
        const reticle = cell.querySelector('.pc-reticle')
        const shot = scene.querySelector('.pc-shot')
        const img = scene.querySelector('.pc-shot__img')
        const r = scene.querySelector('.pc-shot__r')
        const c = scene.querySelector('.pc-shot__c')
        const chars = scene.querySelectorAll('.pc-title .char')
        const copy = scene.querySelectorAll('.pc-tale, .pc-facts li')
        const meta = scene.querySelectorAll('.pc-meta, .pc-kanji, .pc-index')

        // acquire: the crosshair spins in and locks, everything else falls back
        tl.fromTo(reticle, { autoAlpha: 0, scale: 2.6, rotation: -120 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.35, ease: 'back.out(1.6)' }, t)
          .fromTo(cell, { scale: 1 }, { scale: 1.06, duration: 0.35, immediateRender: false }, t)
          .fromTo(grid, GRID_ON, { ...GRID_OFF, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, t + 0.35)
          .set(scene, { autoAlpha: 1 }, t + 0.35)
          // the frame tears open, RGB channels settle, the silhouette develops into colour
          .to(shot, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'expo.inOut' }, t + 0.35)
          .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2.4, ease: 'none' }, t + 0.35)
          .fromTo([r, c], { autoAlpha: 0.85, x: (k) => (k ? 36 : -36) }, { autoAlpha: 0, x: 0, duration: 0.7, ease: 'power2.out' }, t + 0.45)
          .fromTo(img, { filter: 'grayscale(1) contrast(1.9) brightness(0.4)' }, { filter: 'grayscale(0) contrast(1) brightness(1)', duration: 0.7, ease: 'power1.inOut' }, t + 0.55)
          .fromTo(meta, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.05 }, t + 0.6)
          .fromTo(chars, { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 0.5, stagger: 0.018, ease: 'expo.out' }, t + 0.62)
          .fromTo(copy, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.07 }, t + 0.85)
          .addLabel(`c${i}`, t + 1.6)

        // release: a last glitch, the frame wipes out, the figure is crossed off
        const out = t + 2.2
        tl.to([r, c], { autoAlpha: 0.9, x: (k) => (k ? 22 : -22), duration: 0.08, ease: 'none' }, out)
          .to([r, c], { autoAlpha: 0, x: 0, duration: 0.12, ease: 'none' }, out + 0.08)
          .to(shot, { clipPath: 'inset(0% 0% 0% 100%)', skewX: -6, duration: 0.35, ease: 'power3.in' }, out + 0.05)
          .to(scene.querySelector('.pc-copy'), { autoAlpha: 0, y: -18, duration: 0.25, ease: 'power2.in' }, out)
          .set(scene, { autoAlpha: 0 }, out + 0.42)
          .set(shot, { skewX: 0 }, out + 0.42)
          .fromTo(grid, GRID_OFF, { ...GRID_ON, duration: 0.45, ease: 'power2.inOut', immediateRender: false }, out + 0.3)
          .fromTo(cell, { scale: 1.06 }, { scale: 1, duration: 0.35, immediateRender: false }, out + 0.3)
          .fromTo(reticle, { autoAlpha: 1, scale: 1, rotation: 0 }, { autoAlpha: 0, scale: 0.5, rotation: 90, duration: 0.25, ease: 'power2.in', immediateRender: false }, out + 0.3)
      })

      const end = 0.4 + parcours.length * SPAN
      tl.fromTo(outro, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, end)
        .addLabel('end', end + 0.6)
        .to(fill, { scaleX: 1, ease: 'none', duration: end }, 0)

      ScrollTrigger.refresh()
      return () => { el.classList.remove('is-stage'); cells.forEach((c) => c.classList.remove('is-cleared')) }
    })

    // phones: each frame develops as it scrolls in
    mm.add(MQ.mobile, () => {
      gsap.fromTo(q('.pc-cell'), { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out',
        scrollTrigger: { trigger: q('.pc-grid')[0], start: 'top 85%', once: true },
      })
      q('.pc-scene').forEach((scene) => {
        const img = scene.querySelector('.pc-shot__img')
        gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top 78%', once: true } })
          .fromTo(scene.querySelector('.pc-shot'), { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
          .fromTo(img, { filter: 'grayscale(1) contrast(1.9) brightness(0.4)', scale: 1.2 }, { filter: 'grayscale(0) contrast(1) brightness(1)', scale: 1, duration: 1.2, ease: 'power2.out' }, 0.2)
          .fromTo(scene.querySelectorAll('.pc-title .char'), { yPercent: 115 }, { yPercent: 0, duration: 0.6, stagger: 0.02, ease: 'expo.out' }, 0.4)
          .fromTo(scene.querySelectorAll('.pc-meta, .pc-tale, .pc-facts li'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, 0.5)
      })
    })
  }, { scope: root })

  return (
    <section id="parcours" className="parcours" ref={root} aria-labelledby="parcours-title">
      <div className="pc-stage" ref={stage}>
        <div className="pc-grain" aria-hidden="true" />

        <header className="pc-head">
          <p className="pc-stamp" aria-hidden="true">
            <span>Origin file</span>
            <b>Parcours</b>
            <span>Six frames · one path</span>
          </p>
          <h2 id="parcours-title" className="sr-only">Parcours: my story in six chapters</h2>
        </header>

        <ol className="pc-grid" aria-hidden="true">
          {parcours.map((p, i) => (
            <li className="pc-cell" key={p.id}>
              <div className="pc-fig" style={{ '--cut': `url(${p.cut})` }}>
                <span className="pc-fig__c" />
                <span className="pc-fig__r" />
                <span className="pc-fig__ink" />
              </div>
              <Reticle />
              <Cross />
              <span className="pc-cell__tag">{pad(i + 1)} · {p.when}</span>
            </li>
          ))}
        </ol>

        <div className="pc-scenes">
          {parcours.map((p, i) => (
            <article className="pc-scene" key={p.id} aria-labelledby={`pc-${p.id}`}>
              <figure className="pc-shot">
                <img className="pc-shot__img" src={p.shot} alt="" loading="lazy" decoding="async" draggable="false" style={{ objectPosition: p.focus }} />
                <img className="pc-shot__r" src={p.shot} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" style={{ objectPosition: p.focus }} />
                <img className="pc-shot__c" src={p.shot} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" style={{ objectPosition: p.focus }} />
                <span className="pc-shot__scan" aria-hidden="true" />
                <figcaption className="pc-shot__rec" aria-hidden="true"><i /> REC · FRAME {pad(i + 1)}/{TOTAL}</figcaption>
              </figure>

              <div className="pc-copy">
                <span className="pc-index" aria-hidden="true">{pad(i + 1)}</span>
                <span className="pc-kanji" aria-hidden="true">{p.kanji}</span>
                <p className="pc-meta">Chapter {pad(i + 1)} / {TOTAL} — {p.when}</p>
                <h3 className="pc-title display" id={`pc-${p.id}`}><SplitText text={p.title} /></h3>
                <p className="pc-tale">{p.tale}</p>
                <ul className="pc-facts">
                  {p.facts.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <p className="pc-outro display" aria-hidden="true">Story cleared<span>→ now, the work</span></p>

        <div className="pc-hud" aria-hidden="true">
          <span className="pc-hud__count"><b className="pc-hud__num">01</b> / {TOTAL}</span>
          <ol className="pc-hud__ticks">{parcours.map((p) => <li key={p.id} />)}</ol>
          <span className="pc-hud__bar"><span className="pc-hud__fill" /></span>
          <span className="pc-hud__hint">Scroll to acquire</span>
        </div>
      </div>
    </section>
  )
}
