import { FaGithub, FaLinkedinIn, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import './Card.css'

const ICONS = { github: FaGithub, linkedin: FaLinkedinIn, mail: FaEnvelope, pin: FaMapMarkerAlt }

const BARS = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1]
const GAPS = [2, 3, 1, 2, 1, 3, 2, 1, 1, 2]

// Inked scribbles behind the content, in the spirit of a hand-annotated ID.
const DOODLES = [
  'M18 96c-8-22 6-44 26-44s26 24 14 42-30 16-40 2z M28 62c-6-14-2-26 8-30',
  'M330 20c10 8 18 22 12 40-6 16-24 20-34 8s-6-30 8-38z M320 30l-10-12 M338 34l14-10',
  'M410 250c8 18 24 28 44 24 M420 290c14 8 34 6 48-8',
  'M150 14q12 18 30 8t26 14',
]

function Header({ text }) {
  return (
    <h3 className="idcard__title">
      {text.split(' ').map((w, i) => (
        w.length > 2
          ? <span key={i} className="idcard__word"><b>{w[0]}</b>{w.slice(1)}</span>
          : <span key={i} className="idcard__word idcard__word--small">{w}</span>
      ))}
    </h3>
  )
}

/**
 * ID card, after a Commission-style badge: title band, red-framed photo,
 * inked name, small print, circular seal and a barcode.
 */
export default function Card({
  className = '',
  priority = false,
  variant = 'wide',
  photoUrl,
  logoUrl,
  header = 'Commission of Cloud Engineering',
  name,
  nativeName,
  tag,
  lines = [],
  badgeId,
  sealText,
}) {
  const code = String(badgeId ?? '')
  return (
    <article className={`idcard${variant === 'tall' ? ' idcard--tall' : ''} ${className}`.trim()} aria-label={`${name} — identity card`}>
      <svg className="idcard__doodles" viewBox="0 0 500 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {DOODLES.map((d) => <path key={d} d={d} />)}
      </svg>

      <Header text={header} />

      <div className="idcard__body">
        <figure className="idcard__photo">
          <img src={photoUrl} alt={`Portrait of ${name}`} loading={priority ? 'eager' : 'lazy'} decoding="async" draggable="false" />
        </figure>

        <div className="idcard__info">
          {tag && <p className="idcard__tag">{tag}</p>}
          <p className="idcard__name">
            {name.split(' ').map((w) => <span key={w}>{w}</span>)}
          </p>
          {nativeName && <p className="idcard__native" lang="ja">{nativeName}</p>}
          {lines.length > 0 && <dl className="idcard__lines">
            {lines.map((l) => {
              const Icon = ICONS[l.icon]
              return (
                <div className="idcard__line" key={l.label}>
                  <dt>
                    {Icon && <span className="idcard__ico" aria-hidden="true"><Icon /></span>}
                    {l.label}
                  </dt>
                  <dd>
                    {l.href
                      ? <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{l.value}</a>
                      : l.value}
                  </dd>
                </div>
              )
            })}
          </dl>}
        </div>

        {logoUrl && (
          <div className="idcard__seal" aria-hidden="true">
            <svg viewBox="0 0 120 120" className="idcard__seal-ring">
              <defs>
                <path id="idcard-seal-path" d="M 60,60 m -43,0 a 43,43 0 1,1 86,0 a 43,43 0 1,1 -86,0" />
              </defs>
              <circle cx="60" cy="60" r="58" className="idcard__seal-red" />
              <circle cx="60" cy="60" r="52" className="idcard__seal-black" />
              <text className="idcard__seal-text">
                <textPath href="#idcard-seal-path">{sealText} • {sealText} •</textPath>
              </text>
              <circle cx="60" cy="60" r="30" className="idcard__seal-core" />
            </svg>
            <span className="idcard__seal-logo"><img src={logoUrl} alt="" draggable="false" /></span>
          </div>
        )}
      </div>

      <span className="idcard__shine" aria-hidden="true" />

      <div className="idcard__foot" aria-hidden="true">
        <span className="idcard__barcode">
          {Array.from({ length: 90 }).map((_, i) => (
            <i key={i} style={{ width: `${BARS[i % 10]}px`, marginRight: `${GAPS[i % 10]}px` }} />
          ))}
        </span>
        <span className="idcard__code">{code}</span>
      </div>
    </article>
  )
}
