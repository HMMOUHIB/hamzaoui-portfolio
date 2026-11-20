// Parcours: the story told in six frames. Facts come from story.js / timeline; only the framing is new.
// shot = the full photo shown when the chapter is "acquired", cut = the cut-out used as a silhouette in the grid.
import shot1 from '../assets/parcours/01-origin.webp'
import cut1 from '../assets/parcours/01-origin-cut.webp'
import shot2 from '../assets/parcours/02-code.webp'
import cut2 from '../assets/parcours/02-code-cut.webp'
import shot3 from '../assets/parcours/03-freelance.webp'
import cut3 from '../assets/parcours/03-freelance-cut.webp'
import shot4 from '../assets/parcours/04-medianet.webp'
import cut4 from '../assets/parcours/04-medianet-cut.webp'
import shot5 from '../assets/parcours/05-tekup.webp'
import cut5 from '../assets/parcours/05-tekup-cut.webp'
import shot6 from '../assets/parcours/06-next.webp'
import cut6 from '../assets/parcours/06-next-cut.webp'

export const parcours = [
  {
    id: 'origin',
    when: '2019 — 2024',
    title: 'Origin',
    kanji: '起源',
    tale: 'It started with business, not code: how companies run on information. A Licence in Informatique de Gestion at ISAAS Sfax taught me the problem before the tools.',
    facts: ['Licence en Informatique de Gestion', 'ISAAS Sfax · Business Électronique'],
    shot: shot1, cut: cut1, focus: '50% 30%',
  },
  {
    id: 'code',
    when: '2023 →',
    title: 'First code',
    kanji: '実装',
    tale: 'Then I wanted to build the thing, not just describe it. Interfaces, APIs, databases: personal projects became my playground and my proof.',
    facts: ['Career Hive · Aura Store · CloudOps Manager', 'React · Symfony · Spring Boot · MySQL'],
    shot: shot2, cut: cut2, focus: '45% 40%',
  },
  {
    id: 'freelance',
    when: '2024 →',
    title: 'Freelance',
    kanji: '独立',
    tale: 'Real clients, real deadlines. Freelancing taught me to ship, to listen, and to own a product from the first call to the last deploy.',
    facts: ['Freelance Web Developer', 'Independent · 2024 — Present'],
    shot: shot3, cut: cut3, focus: '50% 60%',
  },
  {
    id: 'medianet',
    when: '2025',
    title: 'Medianet',
    kanji: '集中',
    tale: 'My final-year project inside a real team: I built the first version of Career Hive, end to end, at Medianet.',
    facts: ['Full-Stack Developer Intern — Final Year Project', 'Medianet Tunisia · Career Hive v1'],
    shot: shot4, cut: cut4, focus: '60% 40%',
  },
  {
    id: 'tekup',
    when: '2026',
    title: 'Engineer',
    kanji: '工学',
    tale: 'Back to school to go deeper: the engineering cycle at TEK-UP. Same city lights, sharper tools.',
    facts: ['TEK-UP — Engineering cycle, 4th year', 'Ariana, Tunisia'],
    shot: shot5, cut: cut5, focus: '50% 28%',
  },
  {
    id: 'next',
    when: 'Next',
    title: 'The layer beneath',
    kanji: '基盤',
    tale: 'Now the layer beneath all of it: cloud and infrastructure. The interfaces stay beautiful; the systems underneath stay up.',
    facts: ['Intended specialization: Cloud & Infrastructure Engineering', 'AWS · Docker · CI/CD'],
    shot: shot6, cut: cut6, focus: '50% 30%',
  },
]
