// The PSP screen, drawn on a 2D canvas at 3× the handheld's 480×272: a glowing idle splash, a boot card, and an
// XMB-style menu (columns across, items down, waves behind) holding the timeline. Original drawing, no console logos.
export const SCREEN_W = 1440
export const SCREEN_H = 816

// [top, middle, wave glow]; SELECT cycles them like the handheld's monthly colours
const THEMES = [
  ['#040d2b', '#12409e', '#6f9dff'],
  ['#2a0406', '#9c1016', '#ff5a4f'],
  ['#03201a', '#0d6b4a', '#46e0a0'],
  ['#170830', '#4d23a0', '#b190ff'],
  ['#231a04', '#8a6a10', '#f5c95a'],
  ['#08080a', '#34353c', '#c9cdd8'],
]

const FONT = '"Archivo", "Arial", sans-serif'
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const ease = (cur, target, dt, k = 10) => cur + (target - cur) * (1 - Math.exp(-dt * k))

// react-icons components are plain trees of <path>/<circle> elements: turn one into Path2D objects for the canvas.
export function glyph(Icon) {
  const el = Icon({})
  const attr = el.props.attr || {}
  const vb = String(attr.viewBox || '0 0 24 24').split(/[\s,]+/).map(Number)
  const paths = []
  const walk = (kids) => [].concat(kids ?? []).flat().forEach((c) => {
    const p = c?.props
    if (!p) return
    if (c.type === 'path' && p.d && !(p.fill === 'none' && p.stroke === 'none')) paths.push(new Path2D(p.d))
    if (c.type === 'circle') { const q = new Path2D(); q.arc(+p.cx, +p.cy, +p.r, 0, Math.PI * 2); paths.push(q) }
    walk(p.children)
  })
  walk(el.props.children)
  return { paths, vb, fill: attr.fill !== 'none' }
}

function drawGlyph(ctx, g, x, y, size, color) {
  if (!g) return
  const s = size / Math.max(g.vb[2], g.vb[3])
  ctx.save()
  ctx.translate(x - (g.vb[2] * s) / 2, y - (g.vb[3] * s) / 2)
  ctx.scale(s, s)
  ctx.translate(-g.vb[0], -g.vb[1])
  if (g.fill) {
    ctx.fillStyle = color
    g.paths.forEach((p) => ctx.fill(p))
  } else {
    ctx.strokeStyle = color; ctx.lineWidth = 1.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    g.paths.forEach((p) => ctx.stroke(p))
  }
  ctx.restore()
}

function fit(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
}

function wrap(ctx, text, maxW) {
  const out = []
  let line = ''
  text.split(' ').forEach((w) => {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width > maxW && line) { out.push(line); line = w } else line = next
  })
  if (line) out.push(line)
  return out
}

function waves(ctx, w, h, t, glow) {
  for (let k = 0; k < 3; k++) {
    const amp = h * (0.045 + k * 0.018)
    const base = h * (0.57 + k * 0.035)
    const top = (x) => base + Math.sin(x * 0.0041 + t * (0.32 + k * 0.11) + k * 1.7) * amp + Math.sin(x * 0.0105 - t * 0.47 + k) * amp * 0.35
    const low = (x) => base + h * 0.07 + Math.sin(x * 0.0036 + t * (0.27 + k * 0.09) + k * 1.7 + 0.9) * amp * 1.15
    ctx.beginPath()
    ctx.moveTo(0, top(0))
    for (let x = 12; x <= w; x += 12) ctx.lineTo(x, top(x))
    for (let x = w; x >= 0; x -= 12) ctx.lineTo(x, low(x))
    ctx.closePath()
    const g = ctx.createLinearGradient(0, base - amp, 0, base + h * 0.12)
    g.addColorStop(0, 'rgba(255,255,255,0.16)')
    g.addColorStop(1, 'rgba(255,255,255,0.01)')
    ctx.fillStyle = g
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(0, top(0))
    for (let x = 12; x <= w; x += 12) ctx.lineTo(x, top(x))
    ctx.strokeStyle = glow; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1
  }
}

function idle(ctx, w, h, t, name) {
  const bg = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, w * 0.6)
  bg.addColorStop(0, '#0c1838'); bg.addColorStop(1, '#010206')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = `700 ${h * 0.32}px "Caveat", cursive`
  ctx.fillStyle = '#e8f0ff'
  ctx.shadowColor = '#5b8cff'
  ;[60, 24, 0].forEach((b) => { ctx.shadowBlur = b; ctx.fillText(name.first, w / 2, h * 0.42) })
  ctx.shadowBlur = 0
  ctx.font = `600 ${h * 0.045}px ${FONT}`; ctx.fontStretch = 'expanded'; ctx.letterSpacing = `${h * 0.02}px`
  ctx.fillStyle = 'rgba(214,226,255,0.75)'
  ctx.fillText(name.last.toUpperCase(), w / 2, h * 0.66)
  ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3.2))
  ctx.font = `700 ${h * 0.042}px ${FONT}`
  ctx.fillStyle = '#fff'
  ctx.fillText('PRESS START', w / 2, h * 0.86)
  ctx.globalAlpha = 1; ctx.letterSpacing = '0px'; ctx.fontStretch = 'normal'
}

function bootCard(ctx, w, h, b, name) {
  const a = smooth(0.15, 0.6, b) * (1 - smooth(1.15, 1.55, b))
  if (a <= 0) return
  ctx.globalAlpha = a
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = `800 ${h * 0.085}px ${FONT}`; ctx.fontStretch = 'expanded'; ctx.letterSpacing = `${h * 0.012}px`
  ctx.fillStyle = '#fff'; ctx.shadowColor = '#9db8ff'; ctx.shadowBlur = 30
  ctx.fillText(`${name.first} ${name.last}`.toUpperCase(), w / 2, h * 0.47)
  ctx.shadowBlur = 0
  const lw = w * 0.42 * smooth(0.3, 1.0, b)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(w / 2 - lw / 2, h * 0.56, lw, 3)
  ctx.globalAlpha = 1; ctx.letterSpacing = '0px'; ctx.fontStretch = 'normal'
}

function statusBar(ctx, w, u) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  ctx.font = `600 ${11 * u}px ${FONT}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillText(`${pad(now.getDate())}/${pad(now.getMonth() + 1)}  ${pad(now.getHours())}:${pad(now.getMinutes())}`, w - 44 * u, 16 * u)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.2 * u
  ctx.strokeRect(w - 36 * u, 11 * u, 22 * u, 10 * u)
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillRect(w - 14 * u, 14 * u, 2 * u, 4 * u)
  ctx.fillRect(w - 34 * u, 13 * u, 14 * u, 6 * u)
}

function xmb(ctx, w, h, v) {
  const { state, anim, cols, t, dt } = v
  const u = h / 272
  const [c0, c1, glow] = THEMES[state.theme % THEMES.length]
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, c0); bg.addColorStop(0.6, c1); bg.addColorStop(1, c0)
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
  waves(ctx, w, h, t, glow)
  statusBar(ctx, w, u)

  anim.col = ease(anim.col, state.col, dt, 9)
  if (anim.listCol !== state.col) { anim.listCol = state.col; anim.row = state.row; anim.list = 0 }
  anim.row = ease(anim.row, state.row, dt, 11)
  anim.list = ease(anim.list, 1, dt, 7)
  anim.open = ease(anim.open, state.open ? 1 : 0, dt, 10)

  const x0 = w * 0.25
  const gap = 96 * u
  const rowY = 76 * u
  const dim = 1 - anim.open * 0.85
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  cols.forEach((c, i) => {
    const d = i - anim.col
    const x = x0 + d * gap
    if (x < -gap || x > w + gap) return
    const sel = Math.max(0, 1 - Math.abs(d))
    ctx.globalAlpha = (0.5 + 0.5 * sel) * dim
    ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 18 * sel
    drawGlyph(ctx, c.glyph, x, rowY, (28 + 12 * sel) * u, '#fff')
    ctx.shadowBlur = 0
    ctx.globalAlpha = sel * dim
    ctx.font = `700 ${12 * u}px ${FONT}`
    ctx.fillStyle = c.future ? '#ffd2cf' : '#fff'
    ctx.fillText(c.year, x, rowY + 31 * u)
  })

  // items of the open column: the chosen one sits under the icon row, earlier ones slide up above it
  const col = cols[state.col]
  const A = rowY + 66 * u
  const B = rowY - 46 * u
  const S = 40 * u
  ctx.textAlign = 'left'
  col.items.forEach((it, j) => {
    const d = j - anim.row
    const y = d >= 0 ? A + d * S : d >= -1 ? A + d * (A - B) : B + (d + 1) * S
    if (y < -S || y > h + S) return
    const sel = Math.max(0, 1 - Math.abs(d))
    ctx.globalAlpha = (d < -0.5 ? 0.35 : 0.5 + 0.5 * sel) * anim.list * dim
    ctx.shadowColor = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 14 * sel
    drawGlyph(ctx, it.glyph, x0, y, (20 + 8 * sel) * u, it.color || '#fff')
    ctx.shadowBlur = 0
    ctx.fillStyle = '#fff'
    ctx.font = `${sel > 0.5 ? 700 : 600} ${(12 + 3 * sel) * u}px ${FONT}`
    ctx.fillText(fit(ctx, it.name, w - x0 - 40 * u), x0 + 26 * u, y - (it.sub ? 6 * u * sel : 0))
    if (it.sub && sel > 0.05) {
      ctx.globalAlpha *= sel * 0.8
      ctx.font = `500 ${10 * u}px ${FONT}`
      ctx.fillText(fit(ctx, it.sub, w - x0 - 40 * u), x0 + 26 * u, y + 10 * u)
    }
  })
  ctx.globalAlpha = 1

  // button hints, bottom right
  ctx.textAlign = 'right'; ctx.font = `600 ${10 * u}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText(state.open ? '○ Back' : '✕ Enter    ◀ ▶ Years    ▲ ▼ Browse', w - 14 * u, h - 14 * u)

  if (anim.open > 0.01) info(ctx, w, h, u, col, col.items[state.row], anim.open)
}

// ✕ on an item: the info page. A header, then one card per part, each with its own icon, staggering in.
function info(ctx, w, h, u, col, it, a) {
  ctx.globalAlpha = a
  const shade = ctx.createLinearGradient(0, 0, w, 0)
  shade.addColorStop(0, 'rgba(0,0,0,0.72)'); shade.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h)

  const L = 22 * u
  const R = w - 22 * u
  ctx.shadowColor = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 18
  drawGlyph(ctx, it.glyph, L + 22 * u, 40 * u, 38 * u, it.color || '#fff')
  ctx.shadowBlur = 0
  const tx = L + 54 * u
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  ctx.font = `800 ${10 * u}px ${FONT}`; ctx.fillStyle = col.future ? '#ffb3ad' : 'rgba(255,255,255,0.65)'
  ctx.fillText(col.year.toUpperCase(), tx, 26 * u)
  ctx.font = `800 ${17 * u}px ${FONT}`; ctx.fillStyle = '#fff'
  ctx.fillText(fit(ctx, it.name, R - tx), tx, 46 * u)
  if (it.sub) {
    ctx.font = `600 ${10 * u}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(fit(ctx, it.sub, R - tx), tx, 60 * u)
  }

  const parts = it.parts || []
  const cols = parts.length > 3 ? 2 : 1
  const rows = Math.ceil(parts.length / cols)
  const top = 74 * u
  const gx = 8 * u
  const gy = 6 * u
  const cw = (R - L - gx * (cols - 1)) / cols
  const ch = Math.min(58 * u, (h - 26 * u - top - gy * (rows - 1)) / rows)
  parts.forEach((p, i) => {
    const k = smooth(0, 1, a * 1.8 - i * 0.1)
    if (k <= 0) return
    const x = L + (i % cols) * (cw + gx)
    const y = top + Math.floor(i / cols) * (ch + gy) + (1 - k) * 8 * u
    const tint = p.color || '#9ab8ff'
    ctx.globalAlpha = a * k
    ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 5 * u)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1.5; ctx.stroke()
    const box = Math.min(ch - 10 * u, 28 * u)
    const bx = x + 6 * u
    const by = y + (ch - box) / 2
    ctx.beginPath(); ctx.roundRect(bx, by, box, box, 4 * u)
    ctx.fillStyle = tint; ctx.globalAlpha = a * k * 0.2; ctx.fill()
    ctx.globalAlpha = a * k; ctx.strokeStyle = tint; ctx.lineWidth = 2; ctx.stroke()
    drawGlyph(ctx, p.glyph, bx + box / 2, by + box / 2, box * 0.62, tint)
    const lx = bx + box + 8 * u
    const lw = x + cw - lx - 6 * u
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
    ctx.font = `800 ${7.5 * u}px ${FONT}`; ctx.fillStyle = tint
    ctx.fillText(fit(ctx, p.label.toUpperCase(), lw), lx, y + 13 * u)
    ctx.font = `500 ${9 * u}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,0.94)'
    const lines = wrap(ctx, p.text, lw)
    const max = Math.max(1, Math.floor((ch - 17 * u) / (11 * u)))
    lines.slice(0, max).forEach((l, n) => ctx.fillText(n === max - 1 && lines.length > max ? fit(ctx, `${l}…`, lw) : l, lx, y + 25 * u + n * 11 * u))
  })

  ctx.globalAlpha = a
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = `600 ${10 * u}px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText('○ Back', w - 14 * u, h - 13 * u)
  ctx.globalAlpha = 1
}

// v: { state, cols, name, t, dt, bootT, anim }
export function drawScreen(ctx, v) {
  const w = SCREEN_W
  const h = SCREEN_H
  ctx.save()
  ctx.clearRect(0, 0, w, h)
  if (v.state.power === 'off') idle(ctx, w, h, v.t, v.name)
  else {
    const b = v.state.power === 'boot' ? v.bootT : 9
    const a = smooth(1.35, 1.95, b)
    if (a > 0) xmb(ctx, w, h, v)
    if (a < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - a})`; ctx.fillRect(0, 0, w, h) }   // the menu fades up out of black
    if (b < 2) bootCard(ctx, w, h, b, v.name)
  }
  ctx.restore()
}
