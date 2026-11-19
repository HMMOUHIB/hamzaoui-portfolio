import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, startSmoothScroll, scrollToTarget, lockScroll, reducedMotion, finePointer } from './motion'
import { identity, projects, statement, about, facts, disciplines, nav } from './content'
import portrait from '../assets/profile-casque.webp'

/* ---------- small pieces ------------------------------------------------------------------------------------ */

// Letters in their own masks so a word can rise into place.
function Chars({ text, className = '' }) {
  return (
    <span className={`chars ${className}`} aria-hidden="true">
      {[...text].map((c, i) => <span className="chars__c" key={i}>{c === ' ' ? ' ' : c}</span>)}
    </span>
  )
}

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 18 18 6M8 6h10v10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  )
}

/* ---------- loader ----------------------------------------------------------------------------------------- */

function Loader({ onDone }) {
  const root = useRef(null)
  const count = useRef(null)
  useGSAP(() => {
    lockScroll(true)
    const n = { v: 0 }
    const assets = Promise.race([
      Promise.all([document.fonts?.ready, new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = portrait })]),
      new Promise((r) => setTimeout(r, 2600)),
    ])
    if (reducedMotion()) { assets.then(() => { lockScroll(false); onDone() }); return }
    const tl = gsap.timeline({ paused: true })
    tl.to(n, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(n.v)).padStart(3, '0') } })
      .from('.loader .chars__c', { yPercent: 110, stagger: 0.04, duration: 0.8, ease: 'expo.out' }, 0.1)
      .to('.loader .chars__c', { yPercent: -110, stagger: 0.025, duration: 0.5, ease: 'expo.in' }, '+=0.15')
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut', onStart: () => { lockScroll(false); onDone() } }, '-=0.15')
    assets.then(() => tl.play())
  }, { scope: root })
  return (
    <div className="loader" ref={root} aria-hidden="true">
      <Chars text="Mouhib Hamzaoui" className="loader__name" />
      <span className="loader__count mono" ref={count}>000</span>
      <span className="loader__tag mono">Portfolio — 2026</span>
    </div>
  )
}

/* ---------- navigation ------------------------------------------------------------------------------------- */

function Nav() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const sheet = useRef(null)

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    if (!reducedMotion()) gsap.fromTo(sheet.current.querySelectorAll('.sheet__link'), { yPercent: 100 }, { yPercent: 0, stagger: 0.06, duration: 0.9, ease: 'expo.out', delay: 0.15 })
    return () => { lockScroll(false); window.removeEventListener('keydown', esc) }
  }, [open])

  const go = (e, id) => { e.preventDefault(); setOpen(false); setTimeout(() => scrollToTarget(`#${id}`), open ? 350 : 0) }

  return (
    <>
      <header className={`nav${solid ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
        <a className="nav__logo" href="#top" onClick={(e) => go(e, 'top')} aria-label={`${identity.firstName} ${identity.lastName}, back to top`}>
          MH<span className="nav__reg">®</span>
        </a>
        <nav className="nav__links" aria-label="Sections">
          {nav.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)} data-cursor>
              <span className="mono">0{i + 1}</span>{n.label}
            </a>
          ))}
        </nav>
        <div className="nav__end">
          <span className="nav__status mono"><i aria-hidden="true" />Open to remote work</span>
          <a className="btn btn--volt nav__cta" href={`mailto:${identity.email}`} data-cursor>Let's talk</a>
          <button className="nav__menu" aria-expanded={open} aria-controls="sheet" onClick={() => setOpen((o) => !o)}>
            <span className="nav__burger" aria-hidden="true"><i /><i /></span>
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </header>

      <div id="sheet" className={`sheet${open ? ' is-open' : ''}`} ref={sheet} hidden={!open}>
        <ol className="sheet__list">
          {[{ id: 'top', label: 'Home' }, ...nav].map((n, i) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
                <span className="sheet__link"><span className="mono">0{i}</span>{n.label}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="sheet__foot">
          <a href={`mailto:${identity.email}`}>{identity.email}</a>
          <span><a href={identity.links.github} target="_blank" rel="noreferrer">GitHub</a> · <a href={identity.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></span>
        </div>
      </div>
    </>
  )
}

/* ---------- hero --------------------------------------------------------------------------------------------- */

function Hero({ ready }) {
  const root = useRef(null)
  useGSAP(() => {
    if (!ready) return
    const q = gsap.utils.selector(root)
    if (!reducedMotion()) {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from(q('.hero__line .chars__c'), { yPercent: 112, duration: 1.3, stagger: 0.035 }, 0)
        .from(q('.hero__me'), { yPercent: 16, autoAlpha: 0, duration: 1.5 }, 0.15)
        .from(q('.hero__meta > *, .hero__sticker'), { y: 24, autoAlpha: 0, stagger: 0.08, duration: 1 }, 0.55)
    }
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // the frame folds into a slanted card and lets the statement underneath show through
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=120%', scrub: 0.6, pin: true } })
        .to(q('.hero__frame'), { clipPath: 'polygon(12% 21%, 88% 15%, 84% 81%, 16% 87%)', ease: 'none' }, 0)
        .to(q('.hero__me'), { scale: 1.12, yPercent: 5, ease: 'none' }, 0)
        .to(q('.hero__line--back'), { xPercent: -12, ease: 'none' }, 0)
        .to(q('.hero__line--front'), { xPercent: 12, ease: 'none' }, 0)
        .fromTo(q('.hero__under span'), { yPercent: (k) => (k ? -60 : 60), autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: 'none' }, 0.15)
    })
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const x = gsap.quickTo(q('.hero__me'), 'x', { duration: 1, ease: 'power3' })
      const bx = gsap.quickTo(q('.hero__line--back'), 'x', { duration: 1.2, ease: 'power3' })
      const move = (e) => { const k = e.clientX / window.innerWidth - 0.5; x(k * 30); bx(k * -50) }
      window.addEventListener('pointermove', move)
      return () => window.removeEventListener('pointermove', move)
    })
  }, { scope: root, dependencies: [ready] })

  return (
    <section className="hero" id="top" ref={root} aria-label="Introduction">
      <p className="hero__under" aria-hidden="true">{statement.split('. ').map((l, i, a) => <span key={i}>{l}{i < a.length - 1 ? '.' : ''}</span>)}</p>
      <div className="hero__frame">
        <div className="hero__grain" aria-hidden="true" />
        <h1 className="hero__title">
          <span className="sr-only">{identity.firstName} {identity.lastName}, full-stack developer and cloud engineering student</span>
          <span className="hero__line hero__line--back"><Chars text="MOUHIB" /></span>
          <span className="hero__line hero__line--front"><Chars text="HAMZAOUI" /></span>
        </h1>
        <img className="hero__me" src={portrait} alt="" width="598" height="1059" fetchpriority="high" />
        <span className="hero__sticker mono" aria-hidden="true">Full-stack<br />&amp; cloud</span>
        <div className="hero__meta">
          <p>Full-stack developer<br />Cloud &amp; infrastructure engineering</p>
          <p className="hero__meta-mid">Based in Tunisia<br />Working remote, worldwide</p>
          <a href="#work" className="hero__scroll" onClick={(e) => { e.preventDefault(); scrollToTarget('#work') }} data-cursor>
            Selected work <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ---------- discipline marquee (speeds up and flips with the scroll) ------------------------------------------ */

function Marquee() {
  const root = useRef(null)
  useGSAP(() => {
    if (reducedMotion()) return
    const tracks = gsap.utils.toArray('.marquee__track', root.current)
    const tweens = tracks.map((t, i) => {
      const tw = gsap.to(t, { xPercent: i ? 50 : -50, repeat: -1, ease: 'none', duration: 26 })
      tw.totalTime(tw.duration() * 50) // room to run backwards
      return tw
    })
    ScrollTrigger.create({
      trigger: root.current, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const boost = Math.min(Math.abs(self.getVelocity()) / 300, 5)
        tweens.forEach((tw) => {
          gsap.to(tw, { timeScale: self.direction * (1 + boost), duration: 0.25, overwrite: true })
          gsap.to(tw, { timeScale: self.direction, duration: 1.2, delay: 0.25 })
        })
      },
    })
  }, { scope: root })
  const row = [...disciplines, ...disciplines]
  return (
    <section className="marquee" ref={root} aria-label="Disciplines">
      <ul className="sr-only">{disciplines.map((d) => <li key={d}>{d}</li>)}</ul>
      {[0, 1].map((r) => (
        <div className="marquee__row" key={r} aria-hidden="true">
          <div className="marquee__track">
            {[...row, ...row].map((d, i) => (
              <span key={i} className={`marquee__item${(i + r) % 2 ? ' is-outline' : ''}`}>{d}<i aria-hidden="true">✳</i></span>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

/* ---------- about ------------------------------------------------------------------------------------------ */

function About() {
  const root = useRef(null)
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.about__lead .w', { opacity: 0.14 }, {
        opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: '.about__lead', start: 'top 78%', end: 'bottom 52%', scrub: true },
      })
      gsap.from('.fact', { y: 60, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.facts', start: 'top 82%' } })
    })
  }, { scope: root })
  return (
    <section className="about" id="about" ref={root} aria-labelledby="about-title">
      <p className="eyebrow mono" id="about-title"><span>(01)</span> About</p>
      <p className="about__lead">
        {about.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}
      </p>
      <ul className="facts">
        {facts.map((f) => (
          <li className="fact" key={f.k}>
            <span className="fact__k mono">{f.k}</span>
            <strong className="fact__v">{f.v}</strong>
            <span className="fact__d">{f.d}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- work: full-screen cards that stack as you scroll ----------------------------------------------- */

function Work() {
  const root = useRef(null)
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('.proj', root.current)
      cards.forEach((card, i) => {
        // each screenshot tips up into place as its card arrives
        gsap.fromTo(card.querySelector('.proj__browser'), { rotateX: 22, yPercent: 14, scale: 0.92 }, {
          rotateX: 0, yPercent: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'top top', scrub: true },
        })
        gsap.from(card.querySelectorAll('.proj__reveal'), {
          yPercent: 100, duration: 1.1, stagger: 0.06, ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 55%' },
        })
        const next = cards[i + 1]
        if (!next) return
        // the card underneath sinks back and dims as the next one slides over it
        gsap.to(card.querySelector('.proj__card'), {
          scale: 0.9, yPercent: -3, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
        })
        gsap.to(card.querySelector('.proj__shade'), {
          opacity: 0.5, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 75%', end: 'top top', scrub: true },
        })
      })
    })
  }, { scope: root })

  return (
    <section className="work" id="work" ref={root} aria-labelledby="work-title">
      <header className="work__head">
        <p className="eyebrow mono"><span>(02)</span> Selected work</p>
        <h2 className="work__title" id="work-title">Work<sup className="mono">0{projects.length}</sup></h2>
        <p className="work__intro">Three builds, front to back: interfaces, APIs, databases and the pipelines that ship them.</p>
      </header>

      {projects.map((p, i) => (
        <article className="proj" key={p.id} data-tone={p.tone} aria-labelledby={`${p.id}-name`}>
          <div className="proj__card">
            <div className="proj__info">
              <div className="proj__top mono">
                <span>{p.num} / 0{projects.length}</span>
                <span>{p.role.split('—')[1]?.trim() || 'Project'}</span>
              </div>
              <h3 className="proj__name" id={`${p.id}-name`}>
                {p.title.map((t) => <span className="mask" key={t}><span className="proj__reveal">{t}</span></span>)}
              </h3>
              <p className="proj__role">{p.role.split('—')[0].trim()}</p>
              <p className="proj__summary">{p.summary}</p>
              <ul className="proj__stack" aria-label="Stack">
                {p.stack.map((s) => <li key={s}>{s}</li>)}
              </ul>
              <a className="btn proj__cta" href={p.url} target="_blank" rel="noreferrer" data-cursor>
                {p.cta} <Arrow /><span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <a className="proj__shot" href={p.url} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true" data-cursor="Open">
              <div className="proj__browser">
                <div className="proj__bar"><i /><i /><i /><span className="mono">{p.domain}</span></div>
                <img src={p.shot} alt="" width="1084" height="720" loading={i ? 'lazy' : 'eager'} decoding="async" />
              </div>
            </a>
            <div className="proj__shade" aria-hidden="true" />
          </div>
        </article>
      ))}
    </section>
  )
}

/* ---------- contact + footer ---------------------------------------------------------------------------- */

function Contact() {
  const root = useRef(null)
  const [copied, setCopied] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Tunis' })
    const tick = () => setTime(fmt.format(new Date()))
    tick(); const id = setInterval(tick, 20000)
    return () => clearInterval(id)
  }, [])

  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.contact__line .chars__c', { yPercent: 110, stagger: 0.02, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.contact__title', start: 'top 80%' } })
    })
    gsap.matchMedia().add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const btn = root.current.querySelector('.orb')
      const x = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3' })
      const y = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3' })
      const move = (e) => { const r = btn.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.35); y((e.clientY - r.top - r.height / 2) * 0.35) }
      const leave = () => { x(0); y(0) }
      btn.addEventListener('pointermove', move); btn.addEventListener('pointerleave', leave)
      return () => { btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerleave', leave) }
    })
  }, { scope: root })

  const copy = async () => {
    try { await navigator.clipboard.writeText(identity.email); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { window.location.href = `mailto:${identity.email}` }
  }

  return (
    <section className="contact" id="contact" ref={root} aria-labelledby="contact-title">
      <p className="eyebrow mono"><span>(03)</span> Contact</p>
      <h2 className="contact__title" id="contact-title">
        <span className="sr-only">Let's build something worth opening.</span>
        <span className="contact__line"><Chars text="Let's build" /></span>
        <span className="contact__line contact__line--volt"><Chars text="something" /></span>
        <span className="contact__line"><Chars text="worth opening" /></span>
      </h2>
      <div className="contact__row">
        <a className="orb" href={`mailto:${identity.email}`} data-cursor>
          <span>Say<br />hello</span>
        </a>
        <div className="contact__links">
          <button className="contact__mail" onClick={copy} data-cursor>
            <span className="mono">{copied ? 'Copied to clipboard' : 'Email — click to copy'}</span>
            {identity.email}
          </button>
          <a href={identity.links.github} target="_blank" rel="noreferrer" data-cursor>GitHub <Arrow /></a>
          <a href={identity.links.linkedin} target="_blank" rel="noreferrer" data-cursor>LinkedIn <Arrow /></a>
        </div>
      </div>
      <footer className="foot mono">
        <span>© 2026 {identity.firstName} {identity.lastName}</span>
        <span>Tunis — {time}</span>
        <a href="#top" onClick={(e) => { e.preventDefault(); scrollToTarget('#top') }}>Back to top ↑</a>
      </footer>
    </section>
  )
}

/* ---------- cursor (mouse only) --------------------------------------------------------------------------- */

function Cursor() {
  const dot = useRef(null)
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return
    const el = dot.current
    el.hidden = false
    const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' })
    const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' })
    const move = (e) => { x(e.clientX); y(e.clientY) }
    const over = (e) => {
      const t = e.target.closest('[data-cursor]')
      el.classList.toggle('is-big', !!t)
      setLabel(t?.dataset.cursor || '')
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerover', over) }
  }, [])
  return <div className="cursor" ref={dot} hidden aria-hidden="true"><span>{label}</span></div>
}

/* ---------- page ------------------------------------------------------------------------------------------ */

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => startSmoothScroll(), [])
  useEffect(() => { if (ready) ScrollTrigger.refresh() }, [ready])

  return (
    <>
      <a className="skip mono" href="#work">Skip to work</a>
      <Loader onDone={() => setReady(true)} />
      <Cursor />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Work />
        <Contact />
      </main>
    </>
  )
}
