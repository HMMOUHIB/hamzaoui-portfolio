import About from './components/About'
import Atmosphere from './components/Atmosphere'
import MotionIntro from './components/MotionIntro'
import ThemeToggle from './components/ThemeToggle'
import Arsenal from './components/Arsenal'
import Contact from './components/Contact'
import Evolution from './components/Evolution'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Mind from './components/Mind'
import Navigation from './components/Navigation'
import NextWorld from './components/NextWorld'
import Projects from './components/Projects'
import SmoothScroll from './components/SmoothScroll'
import Ribbon from './components/Ribbon'
import { ribbons } from './data/ribbons'

export default function App() {
  return (
    <>
      <Atmosphere />
      <ThemeToggle />
      <SmoothScroll>
        <MotionIntro />
        <a className="skip-link" href="#origin">Skip to content</a>
        <Navigation />
        <main>
          <Hero />
          <About />
          <Mind />
          <Arsenal />
          <Ribbon items={ribbons.afterArsenal} />
          <Projects />
          <Evolution />
          <NextWorld />
          <Ribbon items={ribbons.beforeContact} />
          <Contact />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  )
}