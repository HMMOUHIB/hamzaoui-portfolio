// One full-screen fragment shader, seven moods — one per chapter.
// Two moods are blended during a chapter change (uFrom → uTo by uMix).
// 03 and 06 are painted plates (src/assets/bleach) brought to life here; their mask textures pack
// R = depth (parallax), G = where the sky may move, B = an effect mask (city lights / the eyed shadow).
export const BG = { AWAKENING: 0, ORIGIN: 1, ARSENAL: 2, WORK: 3, EVOLUTION: 4, NEXT: 5, CONTACT: 6 }

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;
  uniform int   uFrom;
  uniform int   uTo;
  uniform float uMix;
  uniform sampler2D uEcl;
  uniform sampler2D uEclMask;
  uniform sampler2D uSwd;
  uniform sampler2D uSwdMask;
  varying vec2 vUv;

  const vec3 RED = vec3(0.70, 0.07, 0.12);
  const vec3 ASH = vec3(0.925, 0.906, 0.875);
  const vec3 BLUE = vec3(0.12, 0.38, 1.0);

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float hash1(float n) { return fract(sin(n) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
  }

  // 00 — spirit pressure: warped crimson smoke rising from below
  vec3 awakening(vec2 p) {
    float t = uTime * 0.05;
    vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, -t)), fbm(p * 1.4 + vec2(5.2, t)));
    float n = fbm(p * 2.0 + q * 2.2 + vec2(0.0, -t * 3.0));
    float mask = smoothstep(1.25, 0.0, length((p - vec2(0.0, -0.55)) * vec2(0.9, 1.2)));
    float e = smoothstep(0.42, 0.9, n) * mask;
    // red pressure from the left, blue spirit from the right, meeting at the figure
    float side = smoothstep(-0.9, 0.9, p.x + (q.x - 0.5) * 0.9);
    vec3 energy = mix(RED, BLUE, side);
    return energy * e * 0.62 + ASH * pow(e, 5.0) * 0.18;
  }

  const vec3 ICE = vec3(0.78, 0.84, 1.0);

  // Screen uv → plate uv, cropped like background-size: cover around \`focus\` and zoomed by \`z\`.
  vec2 cover(vec2 uv, float aspect, vec2 focus, float z) {
    float sa = uRes.x / uRes.y;
    vec2 s = (sa > aspect ? vec2(1.0, aspect / sa) : vec2(sa / aspect, 1.0)) / z;
    return clamp(focus - s * 0.5, vec2(0.0), vec2(1.0) - s) + uv * s;
  }

  // Cold, slightly desaturated grade that seats a plate behind the type.
  vec3 grade(vec3 c, float level) {
    c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 0.85) * vec3(0.93, 0.96, 1.07);
    return pow(c, vec3(1.12)) * level;
  }

  // 06 — the next world, an eclipse over a tower in the clouds: the corona pours out of a black moon,
  // a pillar of reiatsu climbs out of the tower, the city below flickers. The camera breathes and follows the pointer in depth.
  const float ECL_A = 1.7765;
  const vec2 MOON = vec2(0.508, 0.682);
  const float MOON_R = 0.112; // in plate heights
  vec3 eclipse(vec2 uv) {
    float t = uTime;
    float z = 1.08 + 0.02 * sin(t * 0.07);
    vec2 iuv = cover(uv, ECL_A, MOON, z);
    vec3 m = texture2D(uEclMask, iuv).rgb;
    iuv -= uMouse * (0.004 + 0.016 * m.r) / z; // nearer layers slide further

    vec2 md = (iuv - MOON) * vec2(ECL_A, 1.0);
    float r = length(md);
    float disc = smoothstep(MOON_R * 0.85, MOON_R * 0.7, r);
    vec2 boil = vec2(noise(iuv * 9.0 + t * 0.06), noise(iuv * 9.0 + vec2(5.2, 1.3) - t * 0.05)) - 0.5;
    vec2 wuv = iuv + boil * (0.01 * m.g + 0.006 * disc);
    vec3 c = texture2D(uEcl, wuv).rgb;

    // the corona streams outward: two phases of a slow radial zoom, crossfaded so it loops
    vec2 d = wuv - MOON;
    float pa = fract(t * 0.03), pb = fract(t * 0.03 + 0.5);
    vec3 fa = texture2D(uEcl, MOON + d * (1.0 - 0.1 * pa)).rgb;
    vec3 fb = texture2D(uEcl, MOON + d * (1.0 - 0.1 * pb)).rgb;
    c = mix(c, mix(fa, fb, abs(2.0 * pa - 1.0)), m.g * smoothstep(MOON_R, MOON_R * 1.6, r));

    float breathe = 0.5 + 0.5 * sin(t * 0.55);
    c += ICE * smoothstep(MOON_R * 2.8, MOON_R, r) * smoothstep(MOON_R * 0.92, MOON_R * 1.04, r) * (0.06 + 0.07 * breathe);
    c += RED * exp(-pow((r - MOON_R * 1.03) / (MOON_R * 0.045), 2.0)) * (0.25 + 0.35 * breathe);

    // reiatsu pillar: light climbing from the tower into the moon
    float px = (iuv.x - 0.4987) * ECL_A;
    float shaft = exp(-px * px * 2600.0) * smoothstep(0.18, 0.3, iuv.y) * smoothstep(0.62, 0.5, iuv.y);
    float streak = pow(noise(vec2(px * 140.0, iuv.y * 16.0 - t * 1.4)), 3.0);
    c += ICE * shaft * (0.1 + streak * 0.6);

    // the city lights flicker
    float tw = noise(iuv * vec2(460.0, 260.0) + t * 0.9);
    c *= 1.0 + m.b * (tw * 1.8 - 0.6) * smoothstep(0.1, 0.35, dot(c, vec3(0.333)));

    // fog drifting along the horizon, a near layer moving faster and further with the pointer
    float fogA = smoothstep(0.35, 0.9, noise(vec2(iuv.x * 6.0 - t * 0.03, iuv.y * 16.0)));
    float fogB = smoothstep(0.4, 0.95, noise(vec2((uv.x + uMouse.x * 0.04) * 4.0 + t * 0.04, uv.y * 9.0 + 3.0)));
    c += vec3(0.42, 0.43, 0.58) * (fogA * smoothstep(0.34, 0.14, iuv.y) * smoothstep(0.02, 0.16, iuv.y) * 0.22
                                 + fogB * smoothstep(0.32, 0.0, uv.y) * 0.14);

    // the certification list runs straight across the corona: soft knee on the highlights keeps it >= 3:1
    c = grade(c, 0.65);
    return min(c, vec3(0.42)) + max(c - 0.42, 0.0) * 0.35;
  }

  // 01 — topographic contour lines, one crimson ridge travelling
  vec3 origin(vec2 p) {
    float n = fbm(p * 1.2 + vec2(uTime * 0.02, uTime * 0.012));
    float k = n * 16.0;
    float w = fwidth(k);
    float line = 1.0 - smoothstep(0.0, w * 1.4, abs(fract(k) - 0.5));
    float band = step(mod(floor(k) - floor(uTime * 0.35), 11.0), 0.5);
    float bandB = step(mod(floor(k) + floor(uTime * 0.28), 13.0), 0.5);
    float fade = 0.35 + 0.65 * smoothstep(1.6, 0.1, length(p));
    vec3 base = mix(vec3(0.085), RED * 0.85, band);
    base = mix(base, BLUE * 0.9, bandB * (1.0 - band));
    return base * line * fade;
  }

  // 03 — the field of blades: the sky churns, light falls through the gap, the eyed shadow's tatters
  // flutter and its eyes slowly open red, embers lift off the battlefield.
  const float SWD_A = 1.7791;
  vec3 swords(vec2 uv) {
    float t = uTime;
    float z = 1.06 + 0.015 * sin(t * 0.06);
    vec2 iuv = cover(uv, SWD_A, vec2(0.46, 0.5), z);
    vec3 m = texture2D(uSwdMask, iuv).rgb;
    iuv -= uMouse * (0.004 + 0.016 * m.r) / z;

    float body = smoothstep(0.15, 0.45, m.b);
    vec2 boil = vec2(noise(iuv * 7.0 + vec2(t * 0.06, 0.0)), noise(iuv * 7.0 + vec2(3.1, 7.7) - t * 0.05)) - 0.5;
    vec2 flutter = vec2(sin(iuv.y * 70.0 + t * 2.3), cos(iuv.x * 55.0 + t * 1.8)) * 0.0022 * body;
    vec3 c = texture2D(uSwd, iuv + boil * 0.012 * m.g + flutter).rgb;

    // cloud light sliding across the sky
    c *= mix(1.0, 0.75 + 0.5 * noise(iuv * vec2(4.0, 6.0) + vec2(-t * 0.04, t * 0.012)), m.g);

    // light falling through the gap in the clouds
    vec2 ld = (iuv - vec2(0.4, 0.74)) * vec2(SWD_A, 1.0);
    float a = atan(ld.y, ld.x);
    float rays = pow(max(0.0, sin(a * 9.0 + t * 0.05)), 30.0) + 0.6 * pow(max(0.0, sin(a * 4.0 - t * 0.035 + 1.0)), 50.0);
    c += ICE * rays * exp(-length(ld) * 2.4) * 0.14;

    // the eyes open: tight core plus a halo read from a blurrier mip of the same mask
    float open = pow(0.5 + 0.5 * sin(t * 0.42 - 1.2), 3.0);
    float eyes = smoothstep(0.7, 0.95, m.b);
    float halo = clamp(texture2D(uSwdMask, iuv, 3.5).b * 2.0 - 1.0, 0.0, 1.0);
    c = mix(c, c * vec3(1.6, 0.35, 0.4), eyes * open * 0.85) + RED * halo * open * 1.4;

    // embers
    vec2 eu = vec2(uv.x * uRes.x / uRes.y, uv.y) * 11.0 + vec2(sin(t * 0.3 + uv.y * 4.0) * 0.4, -t * 0.32);
    vec2 cell = floor(eu);
    float h = hash(cell);
    vec2 off = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
    float ember = smoothstep(0.07, 0.0, length(fract(eu) - 0.5 - off * 0.7)) * step(0.86, h);
    c += mix(RED * 1.6, vec3(1.0, 0.5, 0.32), fract(h * 7.0)) * ember * smoothstep(0.75, 0.0, uv.y) * 0.8;

    return grade(c, 0.62);
  }

  // 04 — the archive floor: perspective grid with a scanning line
  vec3 work(vec2 p) {
    vec3 c = vec3(0.0);
    float horizon = -0.05;
    if (p.y < horizon) {
      float z = 1.0 / (horizon - p.y + 0.02);
      vec2 g = vec2(p.x * z * 0.6, z + uTime * 0.35);
      vec2 gw = fwidth(g);
      vec2 gl = 1.0 - smoothstep(vec2(0.0), gw * 1.5, abs(fract(g) - 0.5));
      float grid = max(gl.x, gl.y);
      float depth = smoothstep(18.0, 1.5, z);
      c += mix(vec3(0.11), BLUE * 0.35, smoothstep(6.0, 1.5, z)) * grid * depth;
    }
    float scan = fract(uTime * 0.045);
    float sy = mix(0.9, -0.9, scan);
    c += BLUE * exp(-pow((p.y - sy) * 40.0, 2.0)) * 0.4;
    c += RED * smoothstep(0.35, 0.0, abs(p.y - horizon)) * 0.06;
    return c;
  }

  // 05 — data rain: columns of falling packets
  vec3 evolution(vec2 uv) {
    float cols = 70.0;
    float col = floor(uv.x * cols);
    float speed = 0.04 + hash1(col) * 0.12;
    float off = hash1(col + 7.0);
    float y = fract(uv.y * 1.2 + uTime * speed + off);
    float head = pow(y, 18.0);
    float cx = abs(fract(uv.x * cols) - 0.5);
    float colMask = smoothstep(0.18, 0.05, cx) * step(0.45, hash1(col + 3.0));
    float h = hash1(col + 11.0);
    vec3 tint = h > 0.9 ? RED * 1.2 : (h > 0.72 ? BLUE * 1.1 : vec3(0.18));
    return tint * head * colMask * 0.9;
  }

  // 07 — calm aurora for the last page
  vec3 contact(vec2 p) {
    float t = uTime * 0.05;
    float wave = sin(p.x * 1.8 + t * 2.0) * 0.08 + (fbm(vec2(p.x * 1.2, t)) - 0.5) * 0.5;
    float band = exp(-pow((p.y - 0.28 - wave) * 3.5, 2.0));
    float curtain = fbm(vec2(p.x * 7.0, p.y * 1.5 - t * 2.0));
    vec3 tint = mix(RED, BLUE, smoothstep(-1.2, 1.2, p.x + sin(t * 3.0) * 0.4));
    return tint * band * curtain * 0.6 + ASH * band * pow(curtain, 3.0) * 0.06;
  }

  vec3 mood(int id, vec2 uv, vec2 p) {
    if (id == 0) return awakening(p);
    if (id == 1) return origin(p);
    if (id == 2) return swords(uv);
    if (id == 3) return work(p);
    if (id == 4) return evolution(uv);
    if (id == 5) return eclipse(uv);
    return contact(p);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.0;
    p += uMouse * 0.04;

    // Two call sites only: every one inlines all seven moods, and shader compile time grows with them.
    vec3 c = mood(uMix >= 0.999 ? uTo : uFrom, uv, p);
    if (uMix > 0.001 && uMix < 0.999) c = mix(c, mood(uTo, uv, p), smoothstep(0.0, 1.0, uMix));

    // Film grain + vignette keep it cinematic and hide banding.
    c += (hash(uv * uRes + fract(uTime) * 100.0) - 0.5) * 0.035;
    c *= smoothstep(1.9, 0.4, length((uv - 0.5) * vec2(1.6, 1.0)));
    gl_FragColor = vec4(max(c, 0.0), 1.0);
  }
`
