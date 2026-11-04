// Icon registry — every icon on the site, with its colour.
// Brand marks: Simple Icons (CC0), Font Awesome & Tabler (MIT) via react-icons,
// bundled as inline SVG (no network requests).
import {
  SiReact, SiJavascript, SiHtml5, SiCss, SiGreensock, SiFramer, SiThreedotjs, SiMui,
  SiPhp, SiSymfony, SiSpringboot, SiMysql, SiLinux, SiTerraform, SiKubernetes,
  SiGit, SiGithub, SiFigma, SiRedhat,
  SiNestjs, SiNextdotjs, SiPostgresql, SiDocker, SiGithubactions, SiTypescript,
} from 'react-icons/si'
import { FaAws, FaJava, FaLinkedinIn } from 'react-icons/fa6'
import {
  TbApi, TbNetwork, TbCloud, TbInfinity, TbBrandVscode, TbPencil, TbCode, TbBug,
  TbTestPipe, TbGauge, TbRocket, TbLayout, TbStack2, TbServer, TbSparkles, TbMail,
  TbCloudComputing, TbDatabase, TbBriefcase, TbSchool, TbCertificate,
} from 'react-icons/tb'

const PAPER = '#ece7df'
const RED = '#e23a47'

// name → [Icon, colour]. Brands use their own colour; dark brand marks
// (GitHub, Three.js, Symfony) switch to off-white so they read on black.
const REGISTRY = {
  // Frontend
  'React.js': [SiReact, '#61dafb'], React: [SiReact, '#61dafb'],
  JavaScript: [SiJavascript, '#f7df1e'],
  HTML5: [SiHtml5, '#e34f26'],
  CSS3: [SiCss, '#2d8cf0'],
  GSAP: [SiGreensock, '#88ce02'],
  Motion: [SiFramer, '#fff312'],
  'Three.js': [SiThreedotjs, PAPER],
  MUI: [SiMui, '#007fff'],
  // Backend
  PHP: [SiPhp, '#8993be'],
  Symfony: [SiSymfony, PAPER],
  Java: [FaJava, '#f89820'],
  'Spring Boot': [SiSpringboot, '#6db33f'],
  'REST APIs': [TbApi, '#ff6c37'],
  MySQL: [SiMysql, '#4db6e6'],
  'AI integration': [TbSparkles, '#c084fc'],
  NestJS: [SiNestjs, '#e0234e'],
  'Next.js': [SiNextdotjs, PAPER],
  TypeScript: [SiTypescript, '#3178c6'],
  PostgreSQL: [SiPostgresql, '#4f8fd8'],
  Docker: [SiDocker, '#2496ed'],
  'GitHub Actions': [SiGithubactions, '#2088ff'],
  // Infrastructure
  Linux: [SiLinux, '#fcc624'],
  Networking: [TbNetwork, '#22d3ee'],
  AWS: [FaAws, '#ff9900'],
  'Cloud fundamentals': [TbCloud, '#93c5fd'],
  Terraform: [SiTerraform, '#8b5cf6'],
  Kubernetes: [SiKubernetes, '#4f86f7'],
  'DevOps concepts': [TbInfinity, '#f472b6'],
  // Tools
  Git: [SiGit, '#f05032'],
  GitHub: [SiGithub, PAPER],
  'VS Code': [TbBrandVscode, '#23a9f2'],
  Figma: [SiFigma, '#f24e1e'],
  // Evolution path
  Frontend: [TbLayout, '#61dafb'],
  'Full-Stack': [TbStack2, '#88ce02'],
  Infrastructure: [TbServer, '#8b5cf6'],
  'Cloud Engineering': [TbCloudComputing, RED],
  // Certification path
  'AWS Cloud Practitioner': [FaAws, '#ff9900'],
  'AWS Solutions Architect — Associate': [FaAws, '#ff9900'],
  'Linux / RHCSA path': [SiRedhat, '#ee0000'],
  'DevOps & cloud infrastructure': [TbInfinity, '#f472b6'],
  // Working loop
  design: [TbPencil, '#f472b6'],
  build: [TbCode, '#38bdf8'],
  debug: [TbBug, RED],
  test: [TbTestPipe, '#4ade80'],
  optimize: [TbGauge, '#facc15'],
  ship: [TbRocket, '#a78bfa'],
  // Origin story
  'story-information': [TbDatabase, '#22d3ee'],
  'story-code': [TbCode, '#ff3db8'],
  'story-systems': [TbCloudComputing, '#b84dff'],
  'story-degree': [TbSchool, '#22d3ee'],
  'story-freelance': [TbBriefcase, '#ff3db8'],
  'story-intern': [TbStack2, '#f472b6'],
  'story-projects': [TbRocket, '#a78bfa'],
  'story-school': [TbCertificate, '#b84dff'],
  // Contact
  LinkedIn: [FaLinkedinIn, '#0a8fe0'],
  Email: [TbMail, RED],
}

export function iconFor(name) {
  const hit = REGISTRY[name]
  return hit ? { Icon: hit[0], color: hit[1] } : null
}
