export const timeline = [
  {
    year: '2019',
    title: 'Information management',
    place: 'Institut Supérieur des Affaires de Sfax',
    body: 'Licence en Informatique de Gestion, Business Électronique track. Where the first interfaces were built.',
  },
  {
    year: '2024',
    title: 'Licence completed',
    place: 'ISAAS — 2019 to 2024',
    body: 'Degree finished. Freelance web development begins alongside personal projects.',
  },
  {
    year: '2025',
    title: 'Engineering cycle + Medianet',
    place: 'TEK-UP / Medianet',
    body: 'Full-Stack Developer intern at Medianet. Final year project: Career Hive, a career management platform.',
  },
  {
    year: '2026',
    title: '4th engineering year',
    place: 'TEK-UP',
    body: 'Deepening software engineering while steering toward the infrastructure layer.',
  },
  {
    year: 'Next',
    title: 'Cloud & Infrastructure',
    place: 'Intended specialization',
    body: 'Linux, networking, AWS and infrastructure as code. The systems beneath the systems.',
    future: true,
  },
]

export const experience = [
  { period: '2024 — Present', role: 'Freelance Web Developer', org: 'Independent' },
  { period: '2025', role: 'Full-Stack Developer Intern — Final Year Project', org: 'Medianet' },
  { period: '2023 — Present', role: 'Personal projects', org: 'Career Hive, Aura Store, CloudOps Manager' },
]

// The working loop, taken from the Medianet internship scope.
export const process = [
  { id: 'design', label: 'Design', note: 'Figma, responsive layouts' },
  { id: 'build', label: 'Build', note: 'MVC, REST APIs, business logic' },
  { id: 'debug', label: 'Debug', note: 'Trace it until it makes sense' },
  { id: 'test', label: 'Test', note: 'Break it before users do' },
  { id: 'optimize', label: 'Optimize', note: 'Queries, bundles, interfaces' },
  { id: 'ship', label: 'Ship', note: 'Git, review, deploy, repeat' },
]

// An illustrative session in the terminal — the tools of the trade, not a transcript.
export const terminalSession = [
  { cmd: 'git pull origin main' },
  { cmd: 'composer install', out: 'Installing dependencies from lock file' },
  { cmd: 'php bin/console make:controller CareerController', out: 'created: src/Controller/CareerController.php' },
  { cmd: 'npm run build', out: '✓ built' },
  { cmd: 'git commit -m "fix: validate input before persist"' },
  { cmd: 'ssh lab && sudo systemctl status nginx', out: '● active (running)' },
]
