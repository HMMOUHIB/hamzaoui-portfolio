import { forwardRef } from 'react'
import { profileAlt, profileSrc } from '../data/profile'
import '../styles/profile.css'

/**
 * The protagonist. One asset, several treatments:
 *  hero       — full body, monochrome, crimson rim light
 *  portrait   — cropped to head and shoulders
 *  silhouette — pure black shape with a red edge
 *  calm       — soft, low-contrast, the final portrait
 *  core       — a different cutout (`src`) in full colour, framed for the Arsenal's circular core
 */
const ProfileFigure = forwardRef(function ProfileFigure(
  { variant = 'hero', className = '', priority = false, decorative = false, src = profileSrc },
  ref,
) {
  const maskStyle = { '--pf-src': `url("${src}")` }
  return (
    <figure className={`pf pf--${variant} ${className}`} ref={ref} style={maskStyle}>
      <span className="pf__rim" aria-hidden="true" />
      <span className="pf__rim pf__rim--blue" aria-hidden="true" />
      <img
        className="pf__img"
        src={src}
        alt={decorative ? '' : profileAlt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable="false"
      />
      <span className="pf__scan" aria-hidden="true" />
    </figure>
  )
})

export default ProfileFigure
