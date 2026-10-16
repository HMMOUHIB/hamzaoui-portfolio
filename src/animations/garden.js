// Type Garden growth and hover (after type-garden.vercel.app by Akshat Agarwal): stems, leaves and flowers grow out
// of a heading's letters, weaving in front of and behind them, then lean and turn toward the cursor. Coordinates are in em, origin = letter centre on the baseline,
// y up is negative. Everything is seeded, so a title always grows the same garden.

import { gsap } from './gsap'

const TAU = Math.PI * 2
const clamp01 = (t) => Math.min(1, Math.max(0, t))
const eo = (t) => 1 - Math.pow(1 - clamp01(t), 3)
const eb = (t) => { t = clamp01(t); return 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2) }

// Each title tunes these; see GARDENS in GardenTitle.jsx.
const BASE = {
  seed: 1, stem: '#111111', leaf: '#1b1b1b', ink: '#111111', flower: '#f2231b', core: '#ffc107',
  flowers: ['rose'],          // rose | daisy | tulip | sunflower | poppy | lotus | blossom | dahlia
  roseP: 0.45,                // chance a stem ends in a flower
  leafy: 1, dens: 1, reach: 0.85, curvy: 1, big: 1, bridgeP: 0.6, lean: 0,
  stagger: 140, speed: 1, delay: 250,
  every: 1,                   // grow from every Nth letter only (keeps small text readable)
  behind: false,              // keep everything under the text
}

// shades of a hex colour, for petals that read as layered
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255] }
const mix = (a, b, t) => { const B = hex(b); return `rgb(${hex(a).map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})` }

function rng(seed) {
  let s = seed | 0
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

const vine = (base, dir, len, amp, waves, ph, bend, n = 40) => {
  const P = [[base[0], base[1]]]; const step = len / n; let x = base[0]; let y = base[1]
  for (let i = 1; i <= n; i++) {
    const u = i / n; const a = dir + bend * u + amp * Math.sin(u * Math.PI * waves + ph) * Math.min(1, u * 3)
    x += Math.cos(a) * step; y += Math.sin(a) * step; P.push([x, y])
  }
  return P
}

const curl = (P, sign, rad) => {
  const n = P.length; const e = P[n - 1]; const a = Math.atan2(e[1] - P[n - 2][1], e[0] - P[n - 2][0])
  const c = [e[0] - Math.sin(a) * sign * rad, e[1] + Math.cos(a) * sign * rad]
  const a0 = Math.atan2(e[1] - c[1], e[0] - c[0])
  for (let i = 1; i <= 14; i++) { const u = i / 14; const t = a0 + sign * u * Math.PI * 1.6; const rr = rad * (1 - 0.5 * u); P.push([c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr]) }
  return P
}

const bez = (a, b, c, d, n) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n; const u = 1 - t
  return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]
})

const at = (P, u) => {
  const i = Math.min(P.length - 2, Math.max(1, Math.round(u * (P.length - 1))))
  return [P[i], Math.atan2(P[i + 1][1] - P[i - 1][1], P[i + 1][0] - P[i - 1][0])]
}

// Where a stem passes in front of (1) or behind (0) the letters: it swaps layers at a few cuts.
function weave(r, startLayer) {
  const cuts = Array.from({ length: 1 + Math.floor(r() * 3) }, () => 0.15 + r() * 0.7).sort((a, b) => a - b)
  const segs = []; let u0 = 0; let layer = startLayer
  for (const c of cuts) {
    if (c <= u0) continue
    segs.push({ u0, u1: c, layer })
    u0 = r() < 0.3 ? Math.min(0.98, c + 0.02 + r() * 0.03) : c
    layer = 1 - layer
  }
  segs.push({ u0, u1: 1, layer })
  return segs
}
const layerAt = (segs, u) => (segs.find((s) => u >= s.u0 && u <= s.u1) ?? segs[segs.length - 1]).layer

function grow(r, E, p, o) {
  const tip = o.tip || (r() < p.roseP ? 'flower' : r() < 0.45 ? 'fan' : r() < 0.6 ? 'leaf' : 'curl')
  let P = o.pts || vine(o.base, o.dir, o.len, (0.35 + r() * 0.45) * p.curvy, 1 + r() * 1.6, r() * TAU, (r() - 0.5) * 1.2)
  if (tip === 'curl') P = curl(P, r() < 0.5 ? -1 : 1, 0.05 + r() * 0.05)
  const segs = weave(r, o.layer0 ?? (r() < 0.5 ? 0 : 1))
  const dur = Math.max(320, (o.len || 0.8) * 620)
  E.push({ t: 'stem', pts: P, segs, d0: o.d0, dur, w: o.depth ? 0.82 : 1 })

  let side = r() < 0.5 ? -1 : 1
  for (let i = 0, n = Math.floor(r() * 2.8 * p.leafy); i < n; i++) {
    const u = 0.25 + r() * 0.6; const [q, a] = at(P, u); side = -side
    E.push({ t: 'leaf', x: q[0], y: q[1], a: a + side * (0.55 + r() * 0.5), L: (0.14 + r() * 0.2) * (o.depth ? 0.8 : 1), bend: (r() - 0.5) * 1.2, layer: layerAt(segs, u), d0: o.d0 + dur * u })
  }
  const [tp, ta] = at(P, 1); const td = o.d0 + dur * 0.8; const tl = layerAt(segs, 1)
  if (tip === 'flower') {
    const kind = p.flowers[Math.floor(r() * p.flowers.length)]
    const R = (0.13 + r() * 0.15) * p.big * (o.depth ? 0.75 : 1)
    const over = tp[1] > -0.78 && tp[1] < 0.05 && Math.abs(tp[0]) < p.w * 0.5 // keep roses off the letter body
    const layer = over ? (r() < 0.22 ? 1 : 0) : (r() < 0.6 ? 1 : tl)
    E.push({ t: 'flower', kind, x: tp[0], y: tp[1], R, rot: kind === 'tulip' ? ta + Math.PI / 2 : r() * TAU, ph1: r() * TAU, ph2: r() * TAU, turns: 1.8 + r(), layer, d0: td })
  } else if (tip === 'fan') {
    const spread = 0.6 + r() * 0.3
    for (let j = 0; j < 2; j++) E.push({ t: 'leaf', x: tp[0], y: tp[1], a: ta + (j - 0.5) * spread, L: 0.2 + r() * 0.2, bend: (j - 0.5) * 0.8, layer: tl, d0: td + j * 60 })
  } else if (tip === 'leaf') {
    E.push({ t: 'leaf', x: tp[0], y: tp[1], a: ta + (r() - 0.5) * 0.3, L: 0.16 + r() * 0.16, bend: r() - 0.5, layer: tl, d0: td })
  }
  if (!o.depth && r() < 0.3) {
    const u = 0.35 + r() * 0.35; const [q, a] = at(P, u)
    grow(r, E, p, { base: q, dir: a + (r() < 0.5 ? -1 : 1) * (0.7 + r() * 0.4), len: o.len * (0.35 + r() * 0.2), d0: o.d0 + dur * u, depth: 1, layer0: layerAt(segs, u) })
  }
}

// One letter's garden: stems up out of the letter, a few down, one bridge back to the previous letter.
function gen(L, prev, base) {
  if (L.i % base.every) { L.els = []; L.end = 0; return }
  const r = rng(base.seed * 7919 + L.i * 104729 + 13)
  const p = { ...base, w: L.w, big: base.big * (0.85 + r() * 0.45), curvy: base.curvy * (0.8 + r() * 0.6) }
  const E = []; const w = L.w; const inX = () => (r() - 0.5) * w * 0.7
  for (let i = 0, n = 1 + (r() < 0.45 * p.dens ? 1 : 0); i < n; i++) {
    grow(r, E, p, { base: [inX(), -r() * 0.3], dir: -Math.PI / 2 + p.lean * 0.5 + (r() - 0.5) * 0.7, len: (0.6 + r() * 0.5) * p.reach, d0: 40 + i * 130, tip: L.first && i === 0 ? 'flower' : null })
  }
  if (r() < 0.4 * p.dens) grow(r, E, p, { base: [inX(), -0.1 - r() * 0.35], dir: Math.PI / 2 + (r() - 0.5) * 0.8, len: (0.3 + r() * 0.3) * p.reach, d0: 160 })
  if (prev && r() < Math.min(0.95, p.bridgeP * p.dens)) {
    const px = (prev.x - L.x) / L.S
    const a = [inX(), -0.05 - r() * 0.55]; const b = [px + (r() - 0.5) * 0.25, -0.05 - r() * 0.55]
    const bulge = (r() < 0.55 ? -1 : 1) * (0.4 + r() * 0.4); const dx = b[0] - a[0]
    let P = bez(a, [a[0] + dx * 0.15, a[1] + bulge], [b[0] - dx * 0.15, b[1] + bulge * 0.9], b, 40)
    if (r() < 0.45) P = P.slice(0, Math.floor(P.length * (0.7 + r() * 0.2)))
    grow(r, E, p, { pts: P, len: Math.abs(dx) + Math.abs(bulge), d0: 90, tip: r() < 0.5 ? 'curl' : r() < 0.5 ? 'leaf' : 'flower' })
  }
  if (L.first) grow(r, E, p, { base: [-w * 0.3, -0.15 - r() * 0.4], dir: Math.PI + (r() - 0.5) * 1.2, len: (0.45 + r() * 0.3) * p.reach, d0: 120, tip: 'curl' })
  if (base.behind) E.forEach((e) => { if (e.layer != null) e.layer = 0; e.segs?.forEach((s) => { s.layer = 0 }) })
  L.els = E
  L.end = Math.max(...E.map((e) => e.d0 + (e.dur ?? 600))) + 700
}

// ---------- drawing ----------
function smooth(c, p) {
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  c.moveTo(p[0][0], p[0][1])
  for (let i = 1; i < p.length - 1; i++) { const q = m(p[i], p[i + 1]); c.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]) }
  c.lineTo(p[p.length - 1][0], p[p.length - 1][1])
}

function strokeRange(c, P, a, b) {
  const n = P.length - 1; const ia = a * n; const ib = b * n
  const lerp = (t) => { const i = Math.min(n - 1, Math.floor(t)); const f = t - i; return [P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f] }
  const pts = [lerp(ia)]
  for (let i = Math.floor(ia) + 1; i < ib; i++) pts.push(P[i])
  pts.push(lerp(ib))
  if (pts.length < 2) return
  c.beginPath(); smooth(c, pts); c.stroke()
}

function leaf(c, e, k, p, S, x, y, a) {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(e.L * k, e.L * k)
  const b = e.bend * 0.3; const lw = Math.min(0.1, Math.max(0.03, 1 / (e.L * S * k)))
  c.beginPath(); c.moveTo(0, 0)
  c.bezierCurveTo(0.25, -0.3 + b * 0.6, 0.7, -0.28 + b, 1, b)
  c.bezierCurveTo(0.7, 0.28 + b, 0.25, 0.3 + b * 0.6, 0, 0)
  c.fillStyle = p.leaf; c.fill(); c.strokeStyle = p.ink; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke()
  c.beginPath(); c.moveTo(0.04, 0); c.quadraticCurveTo(0.5, b * 0.5, 0.86, b * 0.9)
  c.strokeStyle = p.leafHi; c.lineWidth = lw * 0.9; c.lineCap = 'round'; c.stroke()
  c.restore()
}

// ---- flowers: unit radius, flat colour + ink outline, layered rings so they read as petals.
// The inner tiers slide toward the cursor (lift), which is what makes a flower look like it turns to face you.
let LEAN = [0, 0]
const lift = (c, z) => c.translate(LEAN[0] * z, LEAN[1] * z)
const disc = (c, x, y, r, fill, p, lw) => {
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = fill; c.fill()
  if (lw) { c.strokeStyle = p.ink; c.lineWidth = lw; c.stroke() }
}
const petalPath = (c, len, wid) => {
  c.moveTo(0, 0); c.bezierCurveTo(len * 0.25, -wid, len * 0.8, -wid * 0.85, len, 0); c.bezierCurveTo(len * 0.8, wid * 0.85, len * 0.25, wid, 0, 0)
}
// n pointed petals around the centre; `vein` draws a centre line on each
function ring(c, n, off, len, wid, fill, p, lw, vein) {
  for (let i = 0; i < n; i++) {
    c.save(); c.rotate(off + (i / n) * TAU)
    c.beginPath(); petalPath(c, len, wid); c.fillStyle = fill; c.fill(); c.strokeStyle = p.ink; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke()
    if (vein) { c.beginPath(); c.moveTo(len * 0.14, 0); c.lineTo(len * 0.72, 0); c.strokeStyle = vein; c.lineWidth = lw * 0.7; c.lineCap = 'round'; c.stroke() }
    c.restore()
  }
}
const FLOWERS = {
  rose(c, e, p, lw) { // cupped petals spiralling in
    disc(c, 0, 0, 1, p.lo, p, lw); lift(c, 0.06)
    for (let i = 0; i < 6; i++) { const a = e.ph1 + (i / 6) * TAU; disc(c, Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0.5, p.flower, p, lw) }
    lift(c, 0.07)
    for (let i = 0; i < 5; i++) { const a = e.ph2 + (i / 5) * TAU; disc(c, Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.36, p.hi, p, lw) }
    lift(c, 0.08); disc(c, 0, 0, 0.2, p.flower, p, lw)
    c.beginPath()
    for (let i = 0; i <= 24; i++) { const u = i / 24; const a = u * 2.6 * TAU + e.ph1; const r = 0.2 * (1 - u * 0.85); c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r) }
    c.strokeStyle = p.ink; c.lineWidth = lw * 0.8; c.stroke()
  },
  daisy(c, e, p, lw) {
    ring(c, 14, e.ph1, 1, 0.17, p.hi, p, lw, p.lo); lift(c, 0.12)
    disc(c, 0, 0, 0.3, p.core, p, lw)
    for (let i = 0; i < 7; i++) { const a = e.ph2 + (i / 7) * TAU; disc(c, Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.035, p.coreLo, p, 0) }
  },
  tulip(c, e, p, lw) { // side view, petals point along the stem
    c.rotate(-Math.PI / 2)
    for (const s of [-1, 1]) { c.save(); c.rotate(s * 0.42); c.beginPath(); petalPath(c, 1.7, 0.5); c.fillStyle = p.lo; c.fill(); c.strokeStyle = p.ink; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); c.restore() }
    c.beginPath(); petalPath(c, 1.9, 0.6); c.fillStyle = p.flower; c.fill(); c.strokeStyle = p.ink; c.lineWidth = lw; c.stroke()
    c.beginPath(); c.moveTo(0.2, 0); c.quadraticCurveTo(1, 0.1, 1.55, 0); c.strokeStyle = p.hi; c.lineWidth = lw * 1.2; c.lineCap = 'round'; c.stroke()
  },
  sunflower(c, e, p, lw) {
    ring(c, 18, e.ph1 + 0.17, 1, 0.17, p.lo, p, lw); lift(c, 0.05)
    ring(c, 18, e.ph1, 0.92, 0.18, p.flower, p, lw); lift(c, 0.09)
    disc(c, 0, 0, 0.44, p.core, p, lw)
    disc(c, 0, 0, 0.3, p.coreLo, p, 0)
    for (let i = 1; i <= 34; i++) { const r = 0.4 * Math.sqrt(i / 34); const a = i * 2.39996 + e.ph2; disc(c, Math.cos(a) * r, Math.sin(a) * r, 0.032, p.coreHi, p, 0) }
  },
  poppy(c, e, p, lw) { // four broad ruffled petals, dark heart
    for (let i = 0; i < 4; i++) {
      c.save(); c.rotate(e.ph1 + (i / 4) * TAU + 0.4)
      c.beginPath(); c.ellipse(0.58, 0, 0.6, 0.66, 0, 0, TAU); c.fillStyle = i % 2 ? p.flower : p.hi; c.fill(); c.strokeStyle = p.ink; c.lineWidth = lw; c.stroke()
      c.beginPath(); c.ellipse(0.3, 0, 0.26, 0.3, 0, 0, TAU); c.fillStyle = p.lo; c.fill()
      c.restore()
    }
    lift(c, 0.1); disc(c, 0, 0, 0.2, p.core, p, lw)
    for (let i = 0; i < 10; i++) { const a = e.ph2 + (i / 10) * TAU; disc(c, Math.cos(a) * 0.33, Math.sin(a) * 0.33, 0.04, p.core, p, 0) }
  },
  lotus(c, e, p, lw) { // three tiers of pointed petals
    ring(c, 8, e.ph1, 1, 0.3, p.lo, p, lw); lift(c, 0.05)
    ring(c, 8, e.ph1 + TAU / 16, 0.84, 0.28, p.flower, p, lw, p.lo); lift(c, 0.06)
    ring(c, 6, e.ph1, 0.62, 0.26, p.hi, p, lw, p.flower); lift(c, 0.08)
    disc(c, 0, 0, 0.14, p.core, p, lw)
  },
  blossom(c, e, p, lw) { // five notched petals and a spray of stamens
    for (let i = 0; i < 5; i++) {
      c.save(); c.rotate(e.ph1 + (i / 5) * TAU)
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(0.15, -0.62, 0.82, -0.66, 1, -0.14); c.lineTo(0.88, 0); c.lineTo(1, 0.14); c.bezierCurveTo(0.82, 0.66, 0.15, 0.62, 0, 0)
      c.fillStyle = p.hi; c.fill(); c.strokeStyle = p.ink; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke()
      c.beginPath(); c.moveTo(0.1, 0); c.lineTo(0.7, 0); c.strokeStyle = p.flower; c.lineWidth = lw * 0.8; c.lineCap = 'round'; c.stroke()
      c.restore()
    }
    lift(c, 0.1); disc(c, 0, 0, 0.3, p.flower, p, 0)
    for (let i = 0; i < 9; i++) {
      const a = e.ph2 + (i / 9) * TAU
      c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 0.36, Math.sin(a) * 0.36); c.strokeStyle = p.core; c.lineWidth = lw * 0.7; c.stroke()
      disc(c, Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0.045, p.core, p, 0)
    }
  },
  dahlia(c, e, p, lw) { // many tight tiers
    ring(c, 18, e.ph1, 1, 0.16, p.lo, p, lw); lift(c, 0.04)
    ring(c, 16, e.ph1 + TAU / 32, 0.82, 0.16, p.flower, p, lw); lift(c, 0.05)
    ring(c, 14, e.ph1, 0.64, 0.15, p.hi, p, lw); lift(c, 0.05)
    ring(c, 10, e.ph1 + 0.3, 0.42, 0.13, p.flower, p, lw); lift(c, 0.05)
    ring(c, 8, e.ph1, 0.24, 0.1, p.core, p, lw)
  },
}

// x, y: warped centre in em; tl: this flower's turn toward the cursor (unit-disc vector, screen space)
function flower(c, e, k, p, S, x, y, rot, tl) {
  const R = e.R; const tm = Math.hypot(tl[0], tl[1])
  const lw = Math.min(0.14, Math.max(0.045, 1.1 / (R * S * k)))
  const ang = rot + tl[0] * 0.22 + (1 - k) * 1.4
  c.save(); c.translate(x + tl[0] * R * 0.16, y + tl[1] * R * 0.16); c.rotate(ang); c.scale(R * k, R * k)
  if (tm > 0.001) { // foreshorten along the turn, like the original's tilted rose
    const phi = Math.atan2(tl[1], tl[0]) - ang
    c.rotate(phi); c.scale(1 - 0.28 * tm, 1); c.rotate(-phi)
  }
  LEAN = [tl[0] * Math.cos(-ang) - tl[1] * Math.sin(-ang), tl[0] * Math.sin(-ang) + tl[1] * Math.cos(-ang)]
  c.lineCap = 'round'; c.lineJoin = 'round'
  FLOWERS[e.kind](c, e, p, lw)
  c.restore()
}

// ---------- hover: one shared pointer for every title on the page ----------
const ptr = { x: 0, y: 0, on: false }
let ptrUsers = 0
const onMove = (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true }
const onAway = (e) => { if (!e.pointerType || e.pointerType !== 'mouse') ptr.on = false } // fingers relax the flowers on lift
const onOut = (e) => { if (!e.relatedTarget) ptr.on = false }
function trackPointer() {
  if (ptrUsers++ === 0) {
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onAway); window.addEventListener('pointercancel', onAway)
    document.addEventListener('mouseout', onOut)
  }
  return () => {
    if (--ptrUsers === 0) {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onAway); window.removeEventListener('pointercancel', onAway)
      document.removeEventListener('mouseout', onOut)
      ptr.on = false
    }
  }
}

const hash = (n) => { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x) }
// the "boil": every 120 ms each element hops a hair, so the lines look hand-inked
const jit = (id, f, amp) => [(hash(id * 1.37 + f * 7.13) * 2 - 1) * amp, (hash(id * 2.71 + f * 3.11) * 2 - 1) * amp, (hash(id * 5.3 + f * 1.7) * 2 - 1) * 0.035]

// Plants a garden on a heading. `host` holds `.char` spans (SplitText); `back`/`front` are canvases that sit
// under and over the text. Grows when scrolled into view, then keeps reacting to the cursor and boiling while
// it is on screen. Returns a cleanup function.
export function plant(host, back, front, preset, reduced) {
  const p = { ...BASE, ...preset }
  // on the dark theme stems and leaves are lightened so they don't vanish into the black
  const tones = () => {
    const dark = document.documentElement.dataset.theme !== 'light'
    const stem = dark ? mix(preset.stem ?? BASE.stem, '#ffffff', 0.62) : (preset.stem ?? BASE.stem)
    const leaf = dark ? mix(preset.leaf ?? BASE.leaf, '#ffffff', 0.42) : (preset.leaf ?? BASE.leaf)
    Object.assign(p, {
      stem, leaf, lo: mix(p.flower, '#000000', 0.3), hi: mix(p.flower, '#ffffff', 0.5), leafHi: mix(preset.leaf ?? BASE.leaf, '#ffffff', 0.55),
      coreLo: mix(p.core, '#000000', 0.45), coreHi: mix(p.core, '#ffffff', 0.3),
    })
  }
  tones()
  const ctx = { 0: back.getContext('2d'), 1: front.getContext('2d') }
  let letters = []; let W = 0; let H = 0; let raf = 0; let t0 = 0; let end = 0; let last = 0; let boilF = -1
  let alive = true; let started = false; let visible = true; let flowerMoving = false
  const untrack = reduced ? () => {} : trackPointer()

  const measure = () => {
    W = back.clientWidth; H = back.clientHeight
    if (!W || !H) return false
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    for (const k of [0, 1]) { const cv = k ? front : back; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx[k].setTransform(dpr, 0, 0, dpr, 0, 0) }
    const cs = getComputedStyle(host); const S = parseFloat(cs.fontSize)
    const m = ctx[0]; m.font = `${cs.fontStyle} ${cs.fontWeight} ${S}px ${cs.fontFamily}`
    const tm = m.measureText('H'); const A = tm.fontBoundingBoxAscent ?? S * 0.9; const D = tm.fontBoundingBoxDescent ?? S * 0.22
    const cr = back.getBoundingClientRect()
    const chars = [...host.querySelectorAll('.char')]
    const old = letters
    letters = chars.map((c, i) => {
      const r = c.getBoundingClientRect()
      const dx = Number(gsap.getProperty(c, 'x') ?? 0) + (Number(gsap.getProperty(c, 'xPercent') ?? 0) / 100) * r.width
      const dy = Number(gsap.getProperty(c, 'y') ?? 0) + (Number(gsap.getProperty(c, 'yPercent') ?? 0) / 100) * r.height
      const top = r.top - dy
      return { i, S, w: r.width / S, lean: old[i]?.lean ?? [0, 0], x: r.left - dx - cr.left + r.width / 2, y: top - cr.top + (r.height - (A + D)) / 2 + A, first: c.parentElement !== chars[i - 1]?.parentElement, start: i * p.stagger }
    })
    letters.forEach((L, i) => {
      gen(L, letters[i - 1] && !L.first ? letters[i - 1] : null, p)
      L.els.forEach((e, k) => { e.id = L.i * 1000 + k; e.fa = old[i]?.els?.[k]?.fa ?? [0, 0] }) // keep the turn through a resize
    })
    end = Math.max(0, ...letters.map((L) => L.start + L.end))
    return true
  }

  // lean each letter toward the cursor (reach and easing from Type Garden); true while anything still moves
  const lean = (cr, dt) => {
    const kl = 1 - Math.pow(1 - 0.07, dt / 16.7); let moving = false
    for (const L of letters) {
      let tx = 0; let ty = 0
      if (ptr.on) {
        const dx = ptr.x - cr.left - L.x; const dy = ptr.y - cr.top - (L.y - L.S * 0.6); const d = Math.hypot(dx, dy); const reach = Math.max(260, L.S * 3.2)
        if (d < reach && d > 1) { const w = 1 - d / reach; const s = w * w * (3 - 2 * w); tx = (dx / d) * s; ty = (dy / d) * s }
      }
      L.lean[0] += (tx - L.lean[0]) * kl; L.lean[1] += (ty - L.lean[1]) * kl
      if (Math.abs(tx - L.lean[0]) + Math.abs(ty - L.lean[1]) > 0.002) moving = true
    }
    return moving
  }

  const render = (t, now, cr, dt) => {
    ctx[0].clearRect(0, 0, W, H); ctx[1].clearRect(0, 0, W, H)
    const f = reduced ? 0 : Math.floor(now / 120)
    const kf = 1 - Math.pow(1 - 0.09, dt / 16.7); flowerMoving = false
    for (const pass of ['stem', 'leaf', 'flower']) {
      for (const L of letters) {
        const lt = t - L.start
        if (lt <= 0) continue
        const amp = reduced ? 0 : Math.max(0.8 / L.S, 0.01); const sec = lt / 1000; const dmp = Math.exp(-sec * 3.2); const dir = L.i % 2 ? 1 : -1
        // bend toward the cursor (higher parts more) plus a damped sway just after growing
        const warp = (x, y) => {
          const hh = Math.min(2.5, Math.max(0, -y)); const g = hh * hh * 0.5 + hh * 0.5
          let wx = x + L.lean[0] * 0.1 * g; let wy = y + L.lean[1] * 0.05 * g
          if (!reduced && sec < 2.5) { wx += 0.07 * hh * dmp * Math.sin(sec * 11) * dir; wy += 0.035 * hh * dmp * Math.sin(sec * 11 + 1.2) }
          return [wx, wy]
        }
        for (const k of [0, 1]) { ctx[k].save(); ctx[k].translate(L.x, L.y); ctx[k].scale(L.S, L.S) }
        for (const e of L.els) {
          if (e.t !== pass) continue
          const j = jit(e.id, f, amp)
          if (pass === 'stem') {
            const prog = eo((lt - e.d0) / e.dur)
            const P = e.pts.map((q) => warp(q[0] + j[0], q[1] + j[1]))
            for (const s of e.segs) {
              const b = Math.min(s.u1, prog)
              if (b <= s.u0) continue
              const c = ctx[s.layer]; c.strokeStyle = p.stem; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = Math.max(1.2 / L.S, 0.022 * e.w)
              strokeRange(c, P, s.u0, b)
            }
          } else {
            const k = eb((lt - e.d0) / (pass === 'leaf' ? 420 : 520))
            if (k <= 0) continue
            const [x, y] = warp(e.x + j[0], e.y + j[1])
            if (pass === 'leaf') { leaf(ctx[e.layer], e, k, p, L.S, x, y, e.a + j[2]); continue }
            let tx = 0; let ty = 0
            if (ptr.on && !reduced) { // this flower's own turn: nearest pointer within 300 px
              const dx = ptr.x - cr.left - (L.x + x * L.S); const dy = ptr.y - cr.top - (L.y + y * L.S); const d = Math.hypot(dx, dy)
              if (d < 300 && d > 0.001) { const w = 1 - d / 300; const s = w * w * (3 - 2 * w) * Math.min(1, d / 40); tx = (dx / d) * s; ty = (dy / d) * s }
            }
            e.fa[0] += (tx - e.fa[0]) * kf; e.fa[1] += (ty - e.fa[1]) * kf
            if (Math.abs(tx - e.fa[0]) + Math.abs(ty - e.fa[1]) > 0.002) flowerMoving = true
            flower(ctx[e.layer], e, k, p, L.S, x, y, e.rot + j[2], e.fa)
          }
        }
        for (const k of [0, 1]) ctx[k].restore()
      }
    }
  }

  // one loop for growth, hover and boil; it sleeps while the title is off screen
  const frame = (now) => {
    raf = 0
    if (!alive || !visible) return
    const dt = Math.min(64, now - (last || now)); last = now
    const t = (now - t0) * p.speed
    const cr = back.getBoundingClientRect()
    const moving = lean(cr, dt) || flowerMoving
    const tick = Math.floor(now / 120)
    if (t > 0 && (t < end || moving || tick !== boilF)) { boilF = tick; render(t, now, cr, dt) }
    raf = requestAnimationFrame(frame)
  }
  const wake = () => { if (!raf && alive && started && visible && !reduced) { last = 0; raf = requestAnimationFrame(frame) } }

  const start = async () => {
    const cs = getComputedStyle(host)
    await document.fonts?.load(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, host.textContent).catch(() => {})
    await document.fonts?.ready
    if (!alive || !measure()) return
    started = true
    if (reduced) { render(Infinity, 0, back.getBoundingClientRect(), 16.7); return }
    t0 = performance.now() + p.delay // let the letters rise first
    wake()
  }

  const startIO = new IntersectionObserver(([e]) => { if (e.isIntersecting) { startIO.disconnect(); start() } }, { threshold: 0.35 })
  startIO.observe(host)
  const visIO = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake() }, { rootMargin: '200px' })
  visIO.observe(host)
  const ro = new ResizeObserver(() => {
    if (!started) return
    const done = performance.now() - t0 >= end
    if (measure()) render(reduced || done ? Infinity : (performance.now() - t0) * p.speed, performance.now(), back.getBoundingClientRect(), 16.7)
  })
  ro.observe(host)
  const themeWatch = new MutationObserver(() => { // lightened or darkened stems; the live loop repaints on its own, still gardens need a nudge
    tones()
    if (started && (reduced || performance.now() - t0 >= end)) render(Infinity, performance.now(), back.getBoundingClientRect(), 16.7)
  })
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  return () => { alive = false; cancelAnimationFrame(raf); startIO.disconnect(); visIO.disconnect(); ro.disconnect(); themeWatch.disconnect(); untrack() }
}
