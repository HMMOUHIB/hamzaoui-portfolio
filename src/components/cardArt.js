import { projects } from '../data/projects'
// Paints a project as a trading-card face (630x880, drawn at 2x) for HoloCard to put foil on.
const W = 630
const H = 880
const SCALE = 2
const INK = '#111111'
const PAPER = '#f1efe8'
const CRIMSON = '#f2231b'
const DISPLAY = "'Archivo', 'Arial Black', Impact, sans-serif"
const HAND = "'Caveat', 'Segoe Print', cursive"

const round = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r) }

function wrap(c, text, maxW, maxLines) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (c.measureText(next).width > maxW && line) { lines.push(line); line = word } else line = next
  }
  lines.push(line)
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[ ,.;:]+\S*$/, '')}…`
  }
  return lines
}

// Same generative marks as the old polaroids, on a 520x360 board.
const MARKS = {
  hive(c) {
    const r = 26
    const w = Math.sqrt(3) * r
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 12; col++) {
        const x = col * w + (row % 2 ? w / 2 : 0) + 10
        const y = row * r * 1.5 + 10
        const hot = row === 4 && col === 6
        const lit = !hot && (row * 7 + col * 3) % 11 === 0
        c.beginPath()
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k - Math.PI / 6
          c[k ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a))
        }
        c.closePath()
        c.fillStyle = hot ? CRIMSON : lit ? 'rgba(242,35,27,0.14)' : 'rgba(0,0,0,0)'
        c.strokeStyle = hot ? '#e05a64' : lit ? 'rgba(242,35,27,0.7)' : 'rgba(236,236,236,0.14)'
        c.fill(); c.stroke()
      }
    }
  },
  aura(c) {
    for (let i = 0; i < 16; i++) {
      c.save()
      c.translate(260, 190)
      c.rotate(((-8 + i * 1.2) * Math.PI) / 180)
      c.beginPath()
      c.ellipse(0, 0, 30 + i * 18, 22 + i * 13, 0, 0, Math.PI * 2)
      c.strokeStyle = i === 5 ? CRIMSON : 'rgba(236,236,236,0.2)'
      c.lineWidth = i === 5 ? 2 : 1
      c.stroke()
      c.restore()
    }
    c.beginPath(); c.arc(260, 190, 6, 0, Math.PI * 2); c.fillStyle = '#ececec'; c.fill()
  },
  nexus(c) {
    const nodes = Array.from({ length: 28 }, (_, i) => {
      const a = i * 2.39996
      const d = 30 + ((i * 37) % 150)
      return { x: 260 + Math.cos(a) * d * 1.4, y: 180 + Math.sin(a) * d * 0.9 }
    })
    nodes.forEach((n, i) => {
      c.beginPath(); c.moveTo(260, 180); c.lineTo(n.x, n.y)
      c.strokeStyle = i % 9 === 0 ? CRIMSON : 'rgba(236,236,236,0.2)'
      c.lineWidth = i % 9 === 0 ? 2 : 1
      c.stroke()
    })
    nodes.forEach((n, i) => { c.beginPath(); c.arc(n.x, n.y, i % 5 === 0 ? 3.5 : 2, 0, Math.PI * 2); c.fillStyle = '#ececec'; c.fill() })
    c.save(); c.translate(260, 180); c.rotate(Math.PI / 4); c.fillStyle = CRIMSON; c.fillRect(-10, -10, 20, 20); c.restore()
  },
}

const loadShot = (src) => new Promise((resolve) => {
  if (!src) return resolve(null)
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => resolve(null) // falls back to the generative mark
  img.src = src
})

export default async function drawCard(project) {
  // the site fonts come from Google; wait for them or the canvas bakes in fallbacks
  const [shot] = await Promise.all([
    loadShot(project.shot),
    ...[`900 50px Archivo`, `500 19px Archivo`, `700 22px Caveat`].map((f) => document.fonts.load(f).catch(() => {})),
  ])
  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const c = canvas.getContext('2d')
  c.scale(SCALE, SCALE)
  c.textBaseline = 'alphabetic'

  // silver foil border
  const silver = c.createLinearGradient(0, 0, W, H)
  silver.addColorStop(0, '#d9dce1'); silver.addColorStop(0.5, '#9a9fa7'); silver.addColorStop(1, '#d3d6db')
  round(c, 0, 0, W, H, 36); c.fillStyle = silver; c.fill()

  // paper body with a faint site grid
  round(c, 26, 26, W - 52, H - 52, 14); c.fillStyle = PAPER; c.fill()
  c.save(); c.clip()
  c.strokeStyle = 'rgba(17,17,17,0.05)'; c.lineWidth = 1
  for (let x = 26; x < W; x += 22) { c.beginPath(); c.moveTo(x, 26); c.lineTo(x, H); c.stroke() }
  for (let y = 26; y < H; y += 22) { c.beginPath(); c.moveTo(26, y); c.lineTo(W, y); c.stroke() }
  c.restore()

  // header: tag, name, number badge
  c.fillStyle = INK; round(c, 44, 44, 92, 24, 4); c.fill()
  c.fillStyle = '#fff'; c.font = `800 14px ${DISPLAY}`; c.fillText('PROJECT', 54, 61)
  c.fillStyle = INK; c.font = `900 50px ${DISPLAY}`; c.fillText(project.name.toUpperCase(), 44, 112)
  c.beginPath(); c.arc(548, 82, 28, 0, Math.PI * 2); c.fillStyle = CRIMSON; c.fill()
  c.fillStyle = '#fff'; c.font = `900 26px ${DISPLAY}`; c.textAlign = 'center'; c.fillText(project.num, 548, 91); c.textAlign = 'left'

  // art window
  const ax = 44, ay = 128, aw = 542, ah = 360
  c.save(); round(c, ax, ay, aw, ah, 6); c.clip()
  c.fillStyle = '#101010'; c.fillRect(ax, ay, aw, ah)
  if (shot) {
    c.drawImage(shot, ax, ay, aw, ah)
  } else {
    const k = Math.max(aw / 520, ah / 360)
    c.translate(ax + (aw - 520 * k) / 2, ay + (ah - 360 * k) / 2); c.scale(k, k)
    MARKS[project.visual]?.(c)
  }
  c.restore()
  round(c, ax, ay, aw, ah, 6); c.strokeStyle = INK; c.lineWidth = 4; c.stroke()

  // silver info ribbon under the art
  const ribbon = c.createLinearGradient(0, 0, W, 0)
  ribbon.addColorStop(0, '#b9bdc4'); ribbon.addColorStop(0.5, '#e6e8ec'); ribbon.addColorStop(1, '#b9bdc4')
  round(c, ax, 496, aw, 24, 4); c.fillStyle = ribbon; c.fill()
  c.fillStyle = INK; c.font = `700 13px ${DISPLAY}`
  c.fillText(project.role.split('—')[0].trim().toUpperCase(), ax + 12, 513)

  // attack: stack badges + move name + number
  const badges = project.stack.slice(0, 3)
  badges.forEach((t, i) => {
    const x = 62 + i * 38
    c.beginPath(); c.arc(x, 563, 15, 0, Math.PI * 2); c.fillStyle = i ? INK : CRIMSON; c.fill()
    c.fillStyle = '#fff'; c.font = `900 15px ${DISPLAY}`; c.textAlign = 'center'; c.fillText(t[0], x, 569); c.textAlign = 'left'
  })
  const moveX = badges.length ? 62 + badges.length * 38 + 8 : 44
  c.fillStyle = INK; c.font = `900 28px ${DISPLAY}`
  c.fillText(project.points[0] ?? 'In the works', moveX, 573, 560 - moveX - 60)
  c.textAlign = 'right'; c.fillText(String(project.points.length * 10 || '--'), 586, 573); c.textAlign = 'left'

  // description
  c.fillStyle = '#2b2b2b'; c.font = `500 19px ${DISPLAY}`
  wrap(c, project.summary, 540, 5).forEach((line, i) => c.fillText(line, 44, 614 + i * 26))

  // weakness / resistance / retreat style row
  c.strokeStyle = 'rgba(17,17,17,0.35)'; c.lineWidth = 1.5
  c.beginPath(); c.moveTo(44, 770); c.lineTo(586, 770); c.stroke()
  c.fillStyle = INK; c.font = `800 13px ${DISPLAY}`
  c.fillText('STACK', 44, 794)
  c.font = `600 13px ${DISPLAY}`
  c.fillText(project.stack.join(' · ') || 'to be revealed', 96, 794, 490)

  // footer: illustrator, flavour, collector number
  c.fillStyle = INK; c.font = `700 22px ${HAND}`; c.fillText('Illus. Hamzaoui', 44, 826)
  c.font = `600 12px ${DISPLAY}`; c.textAlign = 'right'
  c.fillText(`${project.num}/${String(projects.length).padStart(2, '0')}  ·  © 2026`, 586, 826); c.textAlign = 'left'

  return canvas.toDataURL('image/png')
}
