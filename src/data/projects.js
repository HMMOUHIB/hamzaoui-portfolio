import careerShot from '../assets/cards/careerhive.webp'
import auraShot from '../assets/cards/aura.webp'
import cloudopsShot from '../assets/cards/cloudops.webp'

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
    url: 'https://aura-store-e24q.onrender.com/',
    cta: 'Visit the live store',
  },
  {
    id: 'cloudops',
    num: '03',
    name: 'CloudOps',
    title: ['Cloud', 'Ops'],
    kanji: '雲',
    visual: 'nexus',
    shot: cloudopsShot, // mockup of github.com/HMMOUHIB/first-nest-js
    role: 'DevOps & Full-Stack — academic project, built solo',
    stack: ['NestJS', 'Next.js', 'PostgreSQL', 'Docker', 'GitHub Actions', 'TypeScript'],
    summary:
      'CloudOps Manager: a platform to run projects, teams, servers, applications, monitoring, alerts and incidents. NestJS API and Next.js app on PostgreSQL, shipped as Docker containers through a GitHub Actions pipeline.',
    points: [
      'CI/CD pipeline',
      'Docker Compose (db · api · web)',
      'JWT auth & role guards',
      'Unit + e2e tests on real PostgreSQL',
      'Swagger / OpenAPI docs',
    ],
    url: 'https://github.com/HMMOUHIB/first-nest-js',
    cta: 'View on GitHub',
  },
]