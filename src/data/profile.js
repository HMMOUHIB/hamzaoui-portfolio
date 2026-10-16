import placeholder from '../assets/profile-placeholder.svg'

// Drop your transparent photo at src/assets/profile.png (or .webp / .avif)
// and it is picked up automatically — no code changes needed.
const found = import.meta.glob('../assets/profile.{png,webp,avif,jpg,jpeg}', {
  eager: true,
  import: 'default',
})

const real = Object.values(found)[0]

export const profileSrc = real ?? placeholder
export const hasRealPhoto = Boolean(real)
export const profileAlt = 'Full-body portrait of Hamzaoui Mouhib'
