// The jewelled-logo material (after src/ref/lganime.mp4): any glyph or shape that carries filter:url(#jewel-…) becomes a
// hex-packed lattice of faceted rhinestones inside a chrome bevel. Pure SVG filter: a gem tile (feImage + feTile) clipped
// to the shape's alpha, a specular bevel from the blurred alpha, a dilated silver rim, and a dark core under the gaps.
// Rendered once at the top of the app; the shapes stay real DOM text, so they remain selectable and accessible.
const GEM = {
  silver: [['#ffffff', '#c9d0df', '#8a93a8', '#2b3140'], ['#f2fdff', '#a8dbe6', '#5aa9bb', '#14404e']], // silver + ice
  crimson: [['#ffd9d6', '#ff5a52', '#d1241d', '#4a0806'], ['#ffc4c0', '#f2362e', '#a3120d', '#360504']],
}

function tile(w, [a, b]) {
  const h = w * Math.sqrt(3), r = w * 0.435
  const grad = (id, c) =>
    `<radialGradient id="${id}" cx=".38" cy=".32" r=".78"><stop offset="0" stop-color="${c[0]}"/><stop offset=".25" stop-color="${c[1]}"/><stop offset=".62" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[3]}"/></radialGradient>`
  const gem = (id, x, y) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.36}" r="${r * 0.2}" fill="#fff" fill-opacity=".85"/>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${grad('a', a)}${grad('b', b)}</defs>${gem('a', w / 2, h / 4)}${gem('b', 0, h * 0.75)}${gem('b', w, h * 0.75)}</svg>`
  return { h, uri: `data:image/svg+xml,${encodeURIComponent(svg)}` }
}

function Jewel({ id, gems, w, bevel, rim }) {
  const t = tile(w, GEM[gems])
  return (
    <filter id={id} x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
      <feImage href={t.uri} x="0" y="0" width={w} height={t.h} preserveAspectRatio="none" result="t" />
      <feTile in="t" result="lat" />
      <feComposite in="lat" in2="SourceAlpha" operator="in" result="gems" />
      <feMorphology in="SourceAlpha" operator="dilate" radius={rim} result="dil" />
      <feMorphology in="SourceAlpha" operator="dilate" radius={rim + Math.max(1, rim * 0.3)} result="dil2" />
      <feFlood floodColor="#04050a" />
      <feComposite in2="dil2" operator="in" result="edge" />
      <feGaussianBlur in="dil" stdDeviation={bevel} result="bl" />
      <feDiffuseLighting in="bl" surfaceScale={rim * 1.4} diffuseConstant="1.15" lightingColor="#e9ecf4" result="metal0">
        <feDistantLight azimuth="225" elevation="34" />
      </feDiffuseLighting>
      <feComposite in="metal0" in2="dil" operator="in" result="metal" />
      <feSpecularLighting in="bl" surfaceScale={rim * 1.6} specularConstant="1.5" specularExponent="22" lightingColor="#ffffff" result="sp">
        <feDistantLight azimuth="225" elevation="34" />
      </feSpecularLighting>
      <feComposite in="sp" in2="dil" operator="in" result="spec" />
      <feFlood floodColor="#08090d" />
      <feComposite in2="SourceAlpha" operator="in" result="core" />
      <feMerge>
        <feMergeNode in="edge" />
        <feMergeNode in="metal" />
        <feMergeNode in="core" />
        <feMergeNode in="gems" />
        <feMergeNode in="spec" />
      </feMerge>
    </filter>
  )
}

export default function JewelDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <Jewel id="jewel-silver-s" gems="silver" w={3.4} bevel={0.8} rim={1.4} />
      <Jewel id="jewel-crimson-s" gems="crimson" w={3.1} bevel={0.8} rim={1.4} />
      <Jewel id="jewel-silver-l" gems="silver" w={9} bevel={2.4} rim={4.2} />
      <Jewel id="jewel-crimson-l" gems="crimson" w={8} bevel={2.2} rim={3.8} />
    </svg>
  )
}
