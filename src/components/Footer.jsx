import { identity } from '../data/identity'

export default function Footer() {
  return (
    <footer className="footer">
      <p>© Hamzaoui 2026</p>
      <ul>
        <li><a href={identity.links.github} target="_blank" rel="noreferrer">GitHub</a></li>
        <li><a href={identity.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
        <li><a href={`mailto:${identity.email}`}>Email</a></li>
      </ul>
    </footer>
  )
}
