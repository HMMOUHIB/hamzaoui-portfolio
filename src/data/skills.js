// `learning: true` marks skills that are part of the current study path
// rather than production experience — keeps the arsenal honest.
export const arsenal = [
  {
    id: 'frontend',
    name: 'Frontend',
    kanji: '表',
    note: 'Interfaces that move with intent.',
    skills: [
      { name: 'React.js' }, { name: 'JavaScript' }, { name: 'HTML5' }, { name: 'CSS3' },
      { name: 'GSAP' }, { name: 'Motion' }, { name: 'Three.js' }, { name: 'MUI' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    kanji: '裏',
    note: 'Business logic, APIs and data that hold.',
    skills: [
      { name: 'PHP' }, { name: 'Symfony' }, { name: 'Java' }, { name: 'Spring Boot' },
      { name: 'REST APIs' }, { name: 'MySQL' },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    kanji: '基',
    note: 'The layer everything else stands on.',
    skills: [
      { name: 'Linux' }, { name: 'Networking' }, { name: 'AWS' }, { name: 'Cloud fundamentals' },
      { name: 'Terraform', learning: true }, { name: 'Kubernetes', learning: true },
      { name: 'DevOps concepts', learning: true },
    ],
  },
  {
    id: 'tools',
    name: 'Tools',
    kanji: '具',
    note: 'The daily blade.',
    skills: [{ name: 'Git' }, { name: 'GitHub' }, { name: 'VS Code' }, { name: 'Figma' }, { name: 'Linux' }],
  },
]

export const principles = [
  { word: 'Build.', lines: ['Responsive interfaces', 'REST APIs', 'Backend business logic'] },
  { word: 'Break.', lines: ['Debugging', 'Testing', 'Finding the edge cases'] },
  { word: 'Evolve.', lines: ['MVC architecture', 'Database management', 'Optimization'] },
  { word: 'Rebuild.', lines: ['Frontend to full-stack', 'Full-stack to infrastructure', 'Every version stronger'] },
]

export const evolutionPath = [
  'Frontend', 'Full-Stack', 'Linux', 'Networking', 'AWS', 'Infrastructure', 'Cloud Engineering',
]

// Targets — none of these are claimed as held.
export const certificationPath = [
  { name: 'AWS Cloud Practitioner', kind: 'Certification target' },
  { name: 'AWS Solutions Architect — Associate', kind: 'Certification target' },
  { name: 'Linux / RHCSA path', kind: 'Certification track' },
  { name: 'Terraform', kind: 'Infrastructure as code' },
  { name: 'Kubernetes', kind: 'Orchestration' },
  { name: 'DevOps & cloud infrastructure', kind: 'Practice' },
]
