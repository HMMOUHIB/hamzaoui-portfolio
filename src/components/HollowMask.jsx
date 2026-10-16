// An original, abstract mask shard — fractured bone-white plane, two angular
// slits and a single crimson cut. Not based on any existing character design.
export default function HollowMask({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 240 300" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hm-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3efe8" />
          <stop offset="0.7" stopColor="#cfc9bf" />
          <stop offset="1" stopColor="#8e877d" />
        </linearGradient>
      </defs>
      <path
        d="M120 8 C170 12 214 52 222 118 C228 170 206 226 170 262 L150 240 L158 292 L126 250 L112 296 L100 238 L70 270 L78 226 C40 196 22 150 26 104 C32 50 72 6 120 8 Z"
        fill="url(#hm-shade)"
      />
      <path d="M58 120 L108 132 L104 146 L62 140 Z" fill="#000" />
      <path d="M140 132 L190 116 L186 138 L144 146 Z" fill="#000" />
      <path d="M128 24 L118 110 L132 170 L120 250" stroke="#b3121f" strokeWidth="6" fill="none" strokeLinecap="square" />
      <path d="M40 180 C70 196 100 200 120 198 M120 198 C150 200 180 192 204 176" stroke="#000" strokeWidth="3" fill="none" opacity="0.55" />
      <path d="M150 60 L176 96 M160 52 L190 86" stroke="#000" strokeWidth="1.5" opacity="0.35" />
    </svg>
  )
}
