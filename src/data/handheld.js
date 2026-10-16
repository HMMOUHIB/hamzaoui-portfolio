// What the timeline handheld (components/psp) shows: a "Me" column, then one column per year. Every line is taken
// from identity, story, timeline and skills; nothing new is claimed. `parts` fill an item's info page, one icon each.
import {
  TbBook, TbBrandGithub, TbBrandLinkedin, TbBuilding, TbCalendar, TbCertificate, TbCloudComputing, TbFlag, TbMail,
  TbMapPin, TbQuote, TbRoute, TbSchool, TbStack2, TbTarget, TbUser,
} from 'react-icons/tb'
import { identity } from './identity'
import { iconFor } from './icons'
import { certificationPath, evolutionPath } from './skills'
import { story } from './story'
import { process, timeline } from './timeline'

const reg = (key) => { const hit = iconFor(key); return hit ? { Icon: hit.Icon, color: hit.color } : {} }
const part = (Icon, label, text, color) => ({ Icon, label, text, color })
const act = (i) => ({ ...reg(story[i].icon), label: `Act ${story[i].roman} · ${story[i].title}`, text: story[i].tale })
const facts = story.flatMap((a) => a.facts)
const factPart = (f) => ({ ...reg(f.icon), label: f.when, text: `${f.title} · ${f.org}` })
const factItem = (f, extra = []) => ({
  name: f.title, sub: `${f.org} · ${f.when}`, ...reg(f.icon),
  parts: [part(TbBuilding, 'With', f.org), part(TbCalendar, 'When', f.when), ...extra],
})

const YEAR_ICONS = [TbSchool, TbCertificate, TbStack2, TbSchool, TbCloudComputing]
const YEAR_ACT = [0, 1, 1, 2, 2]
const projects = facts.find((f) => f.icon === 'story-projects')
const intern = facts.find((f) => f.icon === 'story-intern')
const host = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

const me = {
  year: 'Me', Icon: TbUser,
  items: [
    {
      name: `${identity.firstName} ${identity.lastName}`, sub: identity.roles[0], Icon: TbUser,
      parts: [
        part(TbSchool, 'Now', identity.roles[0], '#22d3ee'),
        { ...reg('Full-Stack'), label: 'Building', text: identity.roles[1] },
        { ...reg('Cloud Engineering'), label: 'Heading for', text: identity.roles[2] },
        part(TbQuote, 'Motto', identity.statement.join(' '), '#ffd166'),
      ],
    },
    factItem(projects, [act(1)]),
    {
      name: 'Contact', sub: identity.email, Icon: TbMail, color: '#ff6b6b',
      parts: [
        part(TbMail, 'Email', identity.email, '#ff6b6b'),
        part(TbBrandGithub, 'GitHub', host(identity.links.github), '#e6e9f0'),
        part(TbBrandLinkedin, 'LinkedIn', host(identity.links.linkedin), '#3b9cff'),
      ],
    },
  ],
}

const years = timeline.map((t, i) => {
  const ofYear = facts.filter((f) => f.when.startsWith(t.year))
  const main = {
    name: t.title, sub: t.place, Icon: YEAR_ICONS[i],
    parts: [
      part(TbFlag, 'Milestone', t.title, '#ffd166'),
      part(TbMapPin, 'Where', t.place, '#ff6b6b'),
      part(TbBook, 'Story', t.body, '#9ad1ff'),
      act(YEAR_ACT[i]),
      ...ofYear.filter((f) => !f.when.includes('Present')).map(factPart),
      ...(t.future ? [part(TbRoute, 'The path', evolutionPath.join(' → '), '#b84dff')] : []),
    ],
  }
  const work = ofYear.filter((f) => f.when.includes('Present') || f === intern)
    .map((f) => factItem(f, f === intern ? process.map((p) => ({ ...reg(p.id), label: p.label, text: p.note })) : [act(YEAR_ACT[i])]))
  const targets = t.future
    ? certificationPath.map((c) => ({
      name: c.name, sub: c.kind, ...(reg(c.name).Icon ? reg(c.name) : { Icon: TbCertificate }),
      parts: [{ ...(reg(c.name).Icon ? reg(c.name) : { Icon: TbCertificate }), label: c.kind, text: c.name }, part(TbTarget, 'Status', 'A target on the path, not held yet', '#ff6b6b')],
    }))
    : []
  return { year: t.year, future: t.future, Icon: YEAR_ICONS[i], items: [main, ...work, ...targets] }
})

export const handheld = [me, ...years]
