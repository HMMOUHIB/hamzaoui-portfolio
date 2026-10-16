import careerShot from '../assets/cards/careerhive.webp'
import auraShot from '../assets/cards/aura.webp'

export const projects = [
{
  id: 'career-hive',
  num: '01',
  name: 'Career Hive',
  title: ['Career', 'Hive'],
  kanji: '巣',
  visual: 'hive',
  shot: careerShot,   // screenshot from github.com/HMMOUHIB/Career_Hive
  role: 'Full-Stack Developer — Medianet final year project',
  stack: ['React', 'Symfony', 'PHP', 'MySQL', 'JavaScript'],
  summary:
    'A full-stack career management platform. MVC architecture on Symfony, REST APIs feeding a React interface, and the business logic and database work between them.',
  points: ['MVC architecture', 'REST APIs', 'Database management', 'Responsive interfaces'],
  url: 'https://career-hive-ebon.vercel.app/',
  cta: 'View project',
},
  {
    id: 'aura-store',
    num: '02',
    name: 'Aura Store',
    title: ['Aura', 'Store'],
    kanji: '気',
    visual: 'aura',
    shot: auraShot,   // screenshot from github.com/HMMOUHIB/Aura-Store
    role: 'Full-Stack Developer — personal project',
    stack: ['PHP', 'JavaScript', 'MySQL', 'GSAP', 'AI integration'],
    summary:
      'An e-commerce experience with a complete store behind it, plus Aura AI Stylist — an AI integration that helps shoppers put looks together.',
    points: [
      'Authentication & email verification',
      'Products & cart',
      'Admin dashboard',
      'Security validation',
      'Aura AI Stylist',
    ],
    url: 'https://github.com/HMMOUHIB',
    cta: 'More on GitHub',
  },
  {
    id: 'nexos',
    num: '03',
    name: 'Nexos',
    title: ['Nex', 'os'],
    kanji: '結',
    visual: 'nexus',
    role: 'Personal project',
    stack: [],
    summary: 'A personal project currently in the works. The full write-up arrives when it ships.',
    points: [],
    url: 'https://github.com/HMMOUHIB',
    cta: 'Follow on GitHub',
  },
]