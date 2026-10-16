import { identity } from './identity'
import meSrc from '../assets/me.webp'
import logoSrc from '../assets/logo.png'

// One set of props for every place the ID card appears.
export const idCardProps = {
  photoUrl: meSrc,
  logoUrl: logoSrc,
  name: `${identity.lastName} ${identity.firstName}`,
  nativeName: 'ムヒブ・ハムザウイ',
  tag: 'Cloud Engineer',
  lines: [
    { label: 'base', value: 'Tunisia', icon: 'pin' },
    { label: 'email', value: identity.email, href: `mailto:${identity.email}`, icon: 'mail' },
    { label: 'github', value: 'HMMOUHIB', href: identity.links.github, icon: 'github' },
    { label: 'linkedin', value: 'hmazaoui-mouhib', href: identity.links.linkedin, icon: 'linkedin' },
  ],
  badgeId: '72000413',
  sealText: 'TEK-UP University',
}
