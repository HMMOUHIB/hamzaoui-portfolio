import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { drawScreen, glyph, SCREEN_H, SCREEN_W } from './xmb'

/**
 * A PSP-1000 in a glossy black shell (after src/ref/PortfolioRef.mp4: black piano finish, white lens-flare glints on the
 * buttons, a halftone flower behind it; our own frame, no console logos), floating in a dark studio lit by hard white
 * strips. Drag to spin it; the face buttons and START are real buttons. The screen is a canvas texture at 3× the
 * handheld's resolution, redrawn at 30 fps while the scene is on screen.
 */
const FRONT = 0.18 // z of the body's face
const SCREEN = { w: 1.8, h: 1.02, y: 0.07 }

function roundedRect(hw, hh, r) {
  const s = new THREE.Shape()
  s.moveTo(-hw + r, -hh)
  s.lineTo(hw - r, -hh)
  s.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0)
  s.lineTo(hw, hh - r)
  s.absarc(hw - r, hh - r, r, 0, Math.PI / 2)
  s.lineTo(-hw + r, hh)
  s.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI)
  s.lineTo(-hw, -hh + r)
  s.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5)
  return s
}

// Extrude with a round bevel. Walls get smooth normals (poured metal); the flat caps keep their own.
function slab(shape, depth, bevel, segs = 4, spread = 0.8) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * spread, bevelSegments: segs, curveSegments: 24,
  })
  g.translate(0, 0, -depth / 2)
  const part = ({ start, count }, normals) => {
    const p = new THREE.BufferGeometry()
    p.setAttribute('position', new THREE.Float32BufferAttribute(g.attributes.position.array.slice(start * 3, (start + count) * 3), 3))
    if (normals) p.setAttribute('normal', new THREE.Float32BufferAttribute(g.attributes.normal.array.slice(start * 3, (start + count) * 3), 3))
    return p
  }
  const walls = mergeVertices(part(g.groups[1], false), 1e-5)
  walls.computeVertexNormals()
  const out = mergeGeometries([part(g.groups[0], true), walls.toNonIndexed()])
  g.dispose()
  return out
}

// Rounded-rect outline sampled by arc length, clockwise from the left end of the top edge: [x, y, nx, ny].
function outline(hw, hh, r) {
  const arc = (cx, cy, a0, a1) => ({
    L: r * Math.abs(a1 - a0),
    at: (s, L) => { const a = a0 + ((a1 - a0) * s) / L; return [cx + r * Math.cos(a), cy + r * Math.sin(a), Math.cos(a), Math.sin(a)] },
  })
  const line = (x0, y0, x1, y1, nx, ny) => ({
    L: Math.hypot(x1 - x0, y1 - y0),
    at: (s, L) => [x0 + ((x1 - x0) * s) / L, y0 + ((y1 - y0) * s) / L, nx, ny],
  })
  const segs = [
    line(-hw + r, hh, hw - r, hh, 0, 1), arc(hw - r, hh - r, Math.PI / 2, 0),
    line(hw, hh - r, hw, -hh + r, 1, 0), arc(hw - r, -hh + r, 0, -Math.PI / 2),
    line(hw - r, -hh, -hw + r, -hh, 0, -1), arc(-hw + r, -hh + r, -Math.PI / 2, -Math.PI),
    line(-hw, -hh + r, -hw, hh - r, -1, 0), arc(-hw + r, hh - r, Math.PI, Math.PI / 2),
  ]
  const total = segs.reduce((a, s) => a + s.L, 0)
  return (f) => {
    let d = (((f % 1) + 1) % 1) * total
    for (const s of segs) { if (d <= s.L) return s.at(d, s.L); d -= s.L }
    return segs[0].at(0, segs[0].L)
  }
}

function blob(cx, cy, rx, ry, n, wob = []) {
  const pts = []
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    const k = wob.reduce((acc, [f, amp, ph]) => acc + amp * Math.sin(f * a + ph), 1)
    pts.push(new THREE.Vector2(cx + rx * k * Math.sign(c) * Math.abs(c) ** (2 / n), cy + ry * k * Math.sign(s) * Math.abs(s) ** (2 / n)))
  }
  return new THREE.Path(pts)
}

function frameShape() {
  const at = outline(1.77, 0.81, 0.69)
  const N = 360
  const pts = []
  for (let i = 0; i < N; i++) { const [x, y] = at(i / N); pts.push(new THREE.Vector2(x, y)) }
  const shape = new THREE.Shape(pts)
  shape.holes.push(
    blob(0, -0.02, 1.06, 0.69, 8, [[7, 0.006, 0.4]]), // screen + the button strip
    blob(-1.38, -0.08, 0.25, 0.54, 3, [[3, 0.04, 0.5], [5, 0.025, 1.3]]), // d-pad + analog
    blob(1.38, 0.12, 0.29, 0.34, 2.6, [[3, 0.035, 2.1], [5, 0.02, 0.2]]), // face buttons
  )
  return shape
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const paint = () => { ctx.clearRect(0, 0, w, h); draw(ctx, w, h); tex.needsUpdate = true }
  paint()
  document.fonts?.ready.then(paint) // labels are re-inked once Archivo has loaded
  return tex
}

const label = (text, size = 64) => canvasTex(512, 128, (ctx, w, h) => {
  ctx.font = `700 ${size}px "Archivo", Arial, sans-serif`
  ctx.fontStretch = 'expanded'
  ctx.letterSpacing = '6px'
  ctx.fillStyle = '#b8bfcc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2)
})

const symbol = (kind) => canvasTex(128, 128, (ctx) => {
  ctx.strokeStyle = '#c3cad6'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.lineCap = 'round'
  ctx.beginPath()
  if (kind === 'tri') { ctx.moveTo(64, 30); ctx.lineTo(96, 88); ctx.lineTo(32, 88); ctx.closePath() }
  if (kind === 'circle') ctx.arc(64, 64, 32, 0, Math.PI * 2)
  if (kind === 'cross') { ctx.moveTo(36, 36); ctx.lineTo(92, 92); ctx.moveTo(92, 36); ctx.lineTo(36, 92) }
  if (kind === 'square') ctx.rect(34, 34, 60, 60)
  ctx.stroke()
})

// speaker grille for the back openings: rows of drilled holes inside a rounded slot
const grille = () => canvasTex(256, 512, (ctx, w, h) => {
  ctx.fillStyle = '#0b0d12'
  ctx.beginPath(); ctx.roundRect(24, 24, w - 48, h - 48, 90); ctx.fill()
  ctx.fillStyle = '#262a34'
  for (let y = 64; y < h - 56; y += 26) {
    for (let x = 58 + ((y / 26) % 2) * 13; x < w - 50; x += 26) { ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill() }
  }
})

// white lens-flare glint: soft core with a four-point streak
const flareTex = () => canvasTex(256, 256, (ctx, w, h) => {
  const c = w / 2
  const g = ctx.createRadialGradient(c, c, 0, c, c, c)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.3, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  for (const [dx, dy] of [[1, 0], [0, 1]]) {
    const l = ctx.createLinearGradient(c - dx * c, c - dy * c, c + dx * c, c + dy * c)
    l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(0.5, 'rgba(255,255,255,0.9)'); l.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = l
    ctx.fillRect(dx ? 0 : c - 3, dy ? 0 : c - 3, dx ? w : 6, dy ? h : 6)
  }
})

// glints sit on the d-pad, the face buttons and the bezel and breathe out of step, like the reference
const FLARES = [[-1.36, 0.3, 0.75, 0], [1.4, 0.2, 0.65, 2.1], [-1.58, 0.58, 0.45, 4.2], [0.05, -0.62, 0.55, 1.3]]
function Flare({ tex, x, y, size, phase, z }) {
  const mat = useRef(null)
  useFrame(({ clock }) => { mat.current.opacity = 0.45 + 0.55 * Math.sin(clock.elapsedTime * 1.6 + phase) ** 2 })
  return (
    <mesh position={[x, y, z]} renderOrder={5} raycast={() => null}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial ref={mat} map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

// The halftone flower behind the handheld: a 45° dot lattice whose dots swell toward the middle of a four-lobed bloom.
// White dots on the dark theme, black on the light one; it turns very slowly.
const HT_VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const HT_FRAG = `
  varying vec2 vUv;
  uniform float uTime; uniform float uAspect; uniform float uAlpha; uniform vec3 uInk;
  mat2 rot(float a) { float c = cos(a); float s = sin(a); return mat2(c, -s, s, c); }
  float clover(vec2 p) {
    float d = 9.0;
    for (int i = 0; i < 4; i++) { float a = float(i) * 1.5707963 + 0.7853982; d = min(d, length(p - 0.36 * vec2(cos(a), sin(a))) - 0.4); }
    return d;
  }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;
    p *= rot(uTime * 0.04);
    vec2 g = rot(0.7853982) * p * 34.0;
    vec2 cell = floor(g) + 0.5;
    vec2 f = g - cell;
    vec2 c = rot(-0.7853982) * (cell / 34.0);
    float r = clamp(-clover(c * 0.8) * 1.7, 0.0, 0.52);
    r *= 0.7 + 0.3 * smoothstep(-1.0, 1.0, c.y);
    float dotMask = smoothstep(r, r - 0.09, length(f)) * step(0.03, r);
    gl_FragColor = vec4(uInk, dotMask * uAlpha);
  }
`
function Halftone() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uAspect: { value: 10 / 6.75 }, uAlpha: { value: 0.6 }, uInk: { value: new THREE.Color('#ffffff') } }), [])
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uInk.value.set(document.documentElement.dataset.theme === 'light' ? '#111111' : '#ffffff')
  })
  return (
    <mesh position={[0.05, 0.1, -1.7]} raycast={() => null}>
      <planeGeometry args={[10, 6.75]} />
      <shaderMaterial vertexShader={HT_VERT} fragmentShader={HT_FRAG} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  )
}

const DPAD = [['up', 0, 0, 0.115], ['right', -Math.PI / 2, 0.115, 0], ['down', Math.PI, 0, -0.115], ['left', Math.PI / 2, -0.115, 0]]
const FACE = [['select', 'tri', 0, 0.15], ['back', 'circle', 0.15, 0], ['enter', 'cross', 0, -0.15], ['home', 'square', -0.15, 0]]

// A physical button: dips in when pressed, ignores the click that ends a drag.
function Key({ action, send, rig, position, rotation, children }) {
  const ref = useRef(null)
  const hit = useRef(-9)
  const { gl, clock } = useThree()
  useFrame(() => {
    const k = Math.max(0, 1 - (clock.elapsedTime - hit.current) / 0.2)
    ref.current.position.z = position[2] - 0.022 * Math.sin(k * Math.PI)
  })
  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); if (rig.current.moved > 6) return; hit.current = clock.elapsedTime; send({ type: action }) }}
      onPointerOver={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'pointer' }}
      onPointerOut={() => { gl.domElement.style.cursor = '' }}
    >
      {children}
    </group>
  )
}

function Psp({ state, send, cols, name, rig, reduced }) {
  const { gl, clock } = useThree()
  const geo = useMemo(() => {
    const arrow = new THREE.Shape()
    arrow.moveTo(-0.05, -0.055); arrow.lineTo(0.05, -0.055); arrow.lineTo(0.05, 0.015); arrow.lineTo(0, 0.06); arrow.lineTo(-0.05, 0.015); arrow.closePath()
    return {
      body: slab(roundedRect(1.7, 0.74, 0.62), 0.28, 0.04),
      frame: slab(frameShape(), 0.34, 0.07, 7, 0.7),
      arrow: slab(arrow, 0.02, 0.012, 3),
      pill: slab(roundedRect(0.1, 0.032, 0.03), 0.016, 0.01, 3),
    }
  }, [])
  const mats = useMemo(() => ({
    body: new THREE.MeshPhysicalMaterial({ color: '#06070b', roughness: 0.46, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.2 }),
    shell: new THREE.MeshPhysicalMaterial({ color: '#06070a', roughness: 0.12, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#f1f4fa', metalness: 1, roughness: 0.06 }),
    key: new THREE.MeshPhysicalMaterial({ color: '#191b22', roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.15 }),
    nub: new THREE.MeshStandardMaterial({ color: '#2b2f39', roughness: 0.7 }),
    glass: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 1, roughness: 0.02, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false }),
  }), [])
  const tex = useMemo(() => ({
    home: label('HOME', 58), select: label('SELECT'), start: label('START'), mark: label(name.last.toUpperCase(), 54), back: label(name.last.toUpperCase(), 70),
    tri: symbol('tri'), circle: symbol('circle'), cross: symbol('cross'), square: symbol('square'), grille: grille(), flare: flareTex(),
  }), [name])

  // the screen
  const screen = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = SCREEN_W; c.height = SCREEN_H
    const map = new THREE.CanvasTexture(c)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = gl.capabilities.getMaxAnisotropy()
    return { ctx: c.getContext('2d'), map }
  }, [gl])
  const menu = useMemo(() => cols.map((c) => ({
    ...c,
    glyph: glyph(c.Icon),
    items: c.items.map((it) => ({ ...it, glyph: glyph(it.Icon), parts: it.parts.map((p) => ({ ...p, glyph: glyph(p.Icon) })) })),
  })), [cols])
  const anim = useMemo(() => ({ col: 0, row: 0, list: 1, open: 0, listCol: -1 }), [])
  const startMat = useRef(null)
  const ledMat = useRef(null)
  const screenMat = useRef(null)
  const live = useRef(state)
  const bootAt = useRef(0)
  const since = useRef(1)
  useEffect(() => {
    live.current = state
    if (state.power === 'boot') bootAt.current = clock.elapsedTime
  }, [state, clock])

  useFrame((s, dt) => {
    since.current += dt
    if (since.current < 1 / 30) return
    const t = s.clock.elapsedTime
    const st = live.current
    drawScreen(screen.ctx, { state: st, cols: menu, name, t: reduced ? 2 : t, dt: since.current, bootT: t - bootAt.current, anim })
    screenMat.current.map.needsUpdate = true
    since.current = 0
    startMat.current.emissiveIntensity = st.power === 'off' ? 0.5 + 0.5 * Math.sin(t * 3.2) : 0
    ledMat.current.emissiveIntensity = st.power === 'off' ? 0.15 : 2.4
  })

  const k = { send, rig }
  const z = FRONT
  const cursor = (c) => { gl.domElement.style.cursor = c }
  // a click on the shell zooms in or out; on the zoomed screen it opens the chosen item
  const tap = (type) => (e) => { e.stopPropagation(); if (rig.current.moved > 6) return; send({ type }) }
  return (
    <group
      onClick={tap(state.focus ? 'blur' : 'focus')}
      onPointerOver={() => { rig.current.hover = true; cursor(state.focus ? 'zoom-out' : 'zoom-in') }}
      onPointerOut={() => { rig.current.hover = false; cursor('') }}
    >
      <mesh geometry={geo.body} material={mats.body} />
      <mesh geometry={geo.frame} material={mats.shell} />

      <mesh position={[0, SCREEN.y, z + 0.002]} onClick={tap(state.focus ? 'enter' : 'focus')}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial ref={screenMat} map={screen.map} toneMapped={false} />
      </mesh>
      <mesh position={[0, SCREEN.y, z + 0.004]} material={mats.glass}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
      </mesh>

      {DPAD.map(([action, rot, dx, dy]) => (
        <Key key={action} action={action} {...k} position={[-1.38 + dx, 0.2 + dy, z + 0.018]} rotation={[0, 0, rot]}>
          <mesh geometry={geo.arrow} material={mats.key} />
        </Key>
      ))}
      <mesh position={[-1.38, -0.36, z + 0.026]} rotation={[Math.PI / 2, 0, 0]} material={mats.nub}>
        <cylinderGeometry args={[0.112, 0.124, 0.05, 48]} />
      </mesh>

      {FACE.map(([action, sym, dx, dy]) => (
        <Key key={action} action={action} {...k} position={[1.38 + dx, 0.15 + dy, z + 0.026]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.key}>
            <cylinderGeometry args={[0.068, 0.068, 0.05, 48]} />
          </mesh>
          <mesh position={[0, 0, 0.0256]}>
            <circleGeometry args={[0.062, 48]} />
            <meshBasicMaterial map={tex[sym]} transparent toneMapped={false} />
          </mesh>
        </Key>
      ))}

      {[['home', -0.6, tex.home], ['select', 0.48, null], ['start', 0.76, null]].map(([action, x, t]) => (
        <Key key={action} action={action} {...k} position={[x, -0.6, z + 0.014]}>
          {action === 'start' ? (
            <mesh geometry={geo.pill}>
              <meshPhysicalMaterial ref={startMat} color="#191b22" roughness={0.3} clearcoat={0.7} emissive="#ff3b30" emissiveIntensity={0} />
            </mesh>
          ) : <mesh geometry={geo.pill} material={mats.key} />}
          {t && (
            <mesh position={[0, 0, 0.019]}>
              <planeGeometry args={[0.2, 0.05]} />
              <meshBasicMaterial map={t} transparent toneMapped={false} />
            </mesh>
          )}
        </Key>
      ))}
      {[[tex.select, 0.48], [tex.start, 0.76]].map(([t, x]) => (
        <mesh key={x} position={[x, -0.52, z + 0.002]}>
          <planeGeometry args={[0.24, 0.06]} />
          <meshBasicMaterial map={t} transparent toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[-0.05, -0.6, z + 0.002]}>
        <planeGeometry args={[0.6, 0.15]} />
        <meshBasicMaterial map={tex.mark} transparent toneMapped={false} />
      </mesh>
      <mesh position={[-0.88, -0.6, z + 0.01]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial ref={ledMat} color="#0b3d12" emissive="#39ff6a" emissiveIntensity={0.15} />
      </mesh>

      {FLARES.map(([x, y, size, phase]) => <Flare key={x} tex={tex.flare} x={x} y={y} size={size} phase={phase} z={z + 0.06} />)}

      {/* the back: grilles in the side openings, a chrome ring with the name inside */}
      {[[-1.38, -0.08, 0.36, 0.86], [1.38, 0.12, 0.4, 0.5]].map(([x, y, w, h]) => (
        <mesh key={x} position={[x, y, -z - 0.002]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex.grille} transparent roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0, -z - 0.02]} material={mats.chrome}>
        <torusGeometry args={[0.5, 0.045, 32, 160]} />
      </mesh>
      <mesh position={[0, 0, -z - 0.003]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.84, 0.21]} />
        <meshBasicMaterial map={tex.back} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

// Spin: drift on its own while off, follow the pointer, glide home to face the viewer once the menu is up.
function Rig({ rig, spin, power, focus, whole, reduced, children }) {
  const bob = useRef(null)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const el = gl.domElement
    let last = null
    const r = rig.current
    const down = (e) => { r.down = true; r.moved = 0; last = { x: e.clientX, y: e.clientY, t: performance.now() } }
    const move = (e) => {
      if (!r.down) return
      const now = performance.now()
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      r.y += dx * 0.009
      r.x = Math.max(-0.8, Math.min(0.8, r.x + dy * 0.006))
      r.vy = (dx * 0.009) / Math.max(0.008, (now - last.t) / 1000)
      r.moved += Math.abs(dx) + Math.abs(dy)
      if (r.moved > 6) r.touched = true
      last = { x: e.clientX, y: e.clientY, t: now }
    }
    const up = () => { r.down = false }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl, rig])

  useFrame((s, delta) => {
    const dt = Math.min(delta, 0.05)
    const k = (rate) => 1 - Math.exp(-dt * rate)
    const p = rig.current
    // Spins on its own only while off, untouched and fully on screen; once dragged it keeps the visitor's angle.
    // Zoomed in, it turns to face the camera.
    if (!p.down) {
      if (focus) {
        const home = Math.round(p.y / (Math.PI * 2)) * Math.PI * 2
        p.y += (home - p.y) * k(3.5)
        p.x += (0.03 - p.x) * k(3.5)
        p.vy = 0
      } else if (power === 'off' && whole && !p.touched && !reduced) {
        p.vy += (0.55 - p.vy) * k(1.2)
        p.y += p.vy * dt
        p.x += (0.12 - p.x) * k(1.5)
      } else {
        p.y += p.vy * dt
        p.vy *= Math.exp(-dt * 3)
      }
    }
    spin.current.rotation.set(p.x, p.y, 0)
    p.calm += ((focus ? 0 : 1) - p.calm) * k(4) // zoomed in: the float settles so the screen reads
    p.lift += ((p.hover && !focus ? 1.035 : 1) - p.lift) * k(8)
    bob.current.scale.setScalar(p.lift)
    if (!reduced) {
      const t = s.clock.elapsedTime
      bob.current.position.y = Math.sin(t * 1.1) * 0.07 * p.calm
      bob.current.rotation.z = Math.sin(t * 0.7) * 0.025 * p.calm
    }
  })
  return <group ref={bob}><group ref={spin}>{children}</group></group>
}

// Auto-framing: every frame, project the device's turned bounding box and pull back just enough to keep all of it
// (horns included) inside the stage, so it is as big as it can be and never cut off at any angle. Zoomed in: the screen.
const BOX = new THREE.Box3(new THREE.Vector3(-2.25, -1.2, -0.3), new THREE.Vector3(2.25, 1.2, 0.3))
const CORNERS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => new THREE.Vector3(
  i & 1 ? BOX.max.x : BOX.min.x, i & 2 ? BOX.max.y : BOX.min.y, i & 4 ? BOX.max.z : BOX.min.z,
))
const FILL = 0.86 // share of the stage the device may use
function Lens({ focus, device }) {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3())
  const v = useRef(new THREE.Vector3())
  useFrame((_, delta) => {
    const tan = 2 * Math.tan((camera.fov * Math.PI) / 360)
    const aspect = size.width / size.height
    const tv = Math.tan((camera.fov * Math.PI) / 360) * FILL
    const th = tv * aspect
    let far = 0
    CORNERS.forEach((c) => {
      const p = v.current.copy(c).applyMatrix4(device.current.matrixWorld)
      far = Math.max(far, p.z + Math.abs(p.x) / th, p.z + Math.abs(p.y) / tv)
    })
    const near = FRONT + Math.max((SCREEN.w * 1.3) / (tan * aspect), (SCREEN.h * 1.3) / tan)
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 4.5)
    camera.position.x += (0 - camera.position.x) * k
    camera.position.y += ((focus ? SCREEN.y : 0.12) - camera.position.y) * k
    camera.position.z += ((focus ? near : far) - camera.position.z) * k
    look.current.y += ((focus ? SCREEN.y : 0) - look.current.y) * k
    camera.lookAt(look.current)
  })
  return null
}

export default function PspScene({ state, send, cols, name, active, whole, reduced }) {
  const device = useRef(null)
  const rig = useRef({ x: 0.12, y: -0.6, vy: 0, down: false, moved: 0, hover: false, lift: 1, calm: 1, touched: false })
  return (
    <Canvas
      className="tl__canvas"
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 26, position: [0, 0.12, 12] }}
      gl={{ antialias: true, alpha: true, toneMappingExposure: 1.1 }}
      onPointerMissed={() => {}}
    >
      <Lens focus={state.focus} device={device} />
      <Halftone />
      <directionalLight position={[3, 4, 5]} intensity={0.7} />
      {/* a black studio with hard white strips: the glossy shell shows them as crisp streaks, like the reference */}
      <Environment resolution={512} frames={1}>
        <color attach="background" args={['#030305']} />
        <Lightformer form="rect" intensity={6} color="#ffffff" position={[0, 5, 2]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[-6, 1, 2]} scale={[2, 8, 1]} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[6, -1, 2]} scale={[2, 8, 1]} />
        <Lightformer form="rect" intensity={4} color="#ffffff" position={[-2.5, 1.5, 6]} scale={[0.8, 4, 1]} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[3, -1.5, 6]} scale={[5, 0.5, 1]} />
        <Lightformer form="rect" intensity={5} color="#ffffff" position={[0, 4, -6]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[-6, -1, -4]} scale={[2, 8, 1]} />
        <Lightformer form="rect" intensity={1} color="#0b0d14" position={[0, -6, 0]} scale={[12, 4, 1]} />
      </Environment>
      <Rig rig={rig} spin={device} power={state.power} focus={state.focus} whole={whole} reduced={reduced}>
        <Psp state={state} send={send} cols={cols} name={name} rig={rig} reduced={reduced} />
      </Rig>
    </Canvas>
  )
}
