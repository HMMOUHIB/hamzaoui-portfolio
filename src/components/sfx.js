// Interface sounds, synthesized with Web Audio (no sound files). The PSP in the timeline: the XMB cursor tick,
// a confirm chime, a back blip, a colour-change pop, the boot swell and the power-off fall. The Omnitrix in the
// arsenal: the dial ratchet and the transform slam. Quiet, and silent until the visitor presses something —
// browsers only allow audio after a gesture, so unlock() runs inside one.
let ctx, out, hiss

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    out = ctx.createBiquadFilter()                     // a soft top end, like a small device speaker
    out.type = 'lowpass'; out.frequency.value = 5200
    const vol = ctx.createGain(); vol.gain.value = 0.9
    out.connect(vol).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
}

// the first press may still be waking the context: play once it's up rather than dropping the note
function ready(play, retry) {
  if (!ctx) return false
  if (ctx.state === 'running') return true
  if (retry) ctx.resume().then(play, () => {})
  return false
}

function envelope(at, a, d, v) {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(v, at + a); g.gain.exponentialRampToValueAtTime(0.0001, at + a + d)
  return g
}

// one enveloped oscillator: f → f2 over the note, attack a, decay d (seconds), peak v, starting t from now
function tone(n, retry = true) {
  if (!ready(() => tone(n, false), retry)) return
  const { f, f2 = f, type = 'sine', t = 0, a = 0.004, d = 0.08, v = 0.08 } = n
  const at = ctx.currentTime + t, end = at + a + d
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f, at); o.frequency.exponentialRampToValueAtTime(f2, end)
  o.connect(envelope(at, a, d, v)).connect(out); o.start(at); o.stop(end + 0.02)
}

// a burst of band-passed static centred on f (→ f2)
function noise(n, retry = true) {
  if (!ready(() => noise(n, false), retry)) return
  const { f, f2 = f, q = 1.2, t = 0, a = 0.003, d = 0.1, v = 0.08 } = n
  if (!hiss) {
    hiss = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const ch = hiss.getChannelData(0)
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1
  }
  const at = ctx.currentTime + t, end = at + a + d
  const src = ctx.createBufferSource(); src.buffer = hiss
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q
  bp.frequency.setValueAtTime(f, at); bp.frequency.exponentialRampToValueAtTime(f2, end)
  src.connect(bp).connect(envelope(at, a, d, v)).connect(out); src.start(at); src.stop(end + 0.02)
}

export const sfx = {
  // PSP
  move: () => tone({ f: 1250, f2: 900, type: 'triangle', d: 0.05, v: 0.09 }),
  open: () => { tone({ f: 1319, d: 0.18, v: 0.07 }); tone({ f: 1976, t: 0.06, d: 0.3, v: 0.06 }) },
  back: () => tone({ f: 880, f2: 520, type: 'triangle', d: 0.1, v: 0.08 }),
  select: () => { tone({ f: 1568, d: 0.05, v: 0.06 }); tone({ f: 2093, t: 0.05, d: 0.08, v: 0.05 }) },
  boot: () => {
    [523.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone({ f, t: i * 0.08, a: 0.5, d: 1.6, v: 0.03 }))
    tone({ f: 2637, t: 0.3, a: 0.8, d: 1.2, v: 0.012 })
  },
  off: () => tone({ f: 660, f2: 180, d: 0.3, v: 0.07 }),

  // Omnitrix: the dial turns (three ratchet clicks), then the hologram chirps up
  dial: () => {
    [0, 0.045, 0.09].forEach((t) => { noise({ f: 3200, q: 4, t, d: 0.025, v: 0.16 }); tone({ f: 190, type: 'square', t, d: 0.02, v: 0.03 }) })
    tone({ f: 620, f2: 1880, type: 'sawtooth', t: 0.13, a: 0.01, d: 0.16, v: 0.035 })
  },
  // Omnitrix: the core slams down — a thud, a rising energy zap and a burst of green static
  slam: () => {
    tone({ f: 140, f2: 46, t: 0, a: 0.003, d: 0.22, v: 0.22 })
    noise({ f: 900, f2: 4200, q: 0.9, a: 0.01, d: 0.32, v: 0.12 })
    tone({ f: 240, f2: 1680, type: 'sawtooth', t: 0.04, a: 0.03, d: 0.34, v: 0.05 })
    tone({ f: 2400, f2: 3100, type: 'square', t: 0.3, a: 0.01, d: 0.12, v: 0.015 })
  },
}
