import { projects } from '../data/projects'
import ChapterIntro from './ChapterIntro'
import ProjectCard from './ProjectCard'
import '../styles/projects.css'

export default function Projects() {
  return (
    <section id="work" className="work" aria-labelledby="work-title">
      <ChapterIntro
        id="work-title"
        num="04"
        garden="work"
        title="The work"
        lead={['Three builds.', 'Each one asked for a different blade.']}
      />
      <div className="work__list">
        {projects.map((p, i) => <ProjectCard project={p} index={i} key={p.id} />)}
      </div>
    </section>
  )
}
