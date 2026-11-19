// Everything the redesign says about Mouhib comes from the existing site data or his own CV: nothing invented.
import { identity } from '../data/identity'
import { projects as baseProjects } from '../data/projects'

export { identity }

// one colour world per project card, so the stack reads as three distinct pieces
const tones = ['bone', 'volt', 'graphite']

export const projects = baseProjects.map((p, i) => ({
  ...p,
  tone: tones[i % tones.length],
  domain: new URL(p.url).host,
}))

export const statement = 'I build interfaces today. I engineer systems for tomorrow.'

export const about =
  "I'm Mouhib, a full-stack developer from Tunisia. I build interfaces that move with intent, and I'm studying the cloud and infrastructure that keep them running."

export const facts = [
  { k: 'Since 2024', v: 'Freelance web developer', d: 'Sites and web apps for clients, design to deployment.' },
  { k: 'Medianet', v: 'Full-stack intern', d: 'Built Career Hive: React, Symfony, REST APIs, MySQL.' },
  { k: 'TEK-UP', v: 'Cloud & infrastructure engineering', d: 'Engineering cycle, 4th year. AWS certifications in preparation.' },
]

export const disciplines = ['Frontend', 'Backend', 'Cloud', 'DevOps', 'Motion', 'Infrastructure']

export const nav = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]
