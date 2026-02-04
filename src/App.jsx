import React from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Summary from './components/Summary';
import Education from './components/Education';
import About from './components/About';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="relative min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
      <ScrollToTop />
      {/* Navbar : fixée en haut avec z-index élevé */}
      <Navbar />

      {/* Wrapper général avec padding-top pour passer sous la Navbar */}
      <div className="pt-20 relative z-10">
        {/* Section Header avec accent violet */}
        <section className="bg-gradient-to-b from-violet-700/10 to-gray-900 transition-colors duration-700">
          <Header />
        </section>

        <main className="space-y-24">
          <section id="projects" className="relative z-10">
            <Projects />
          </section>

          <section id="experience" className="relative z-10 bg-gray-800/50 backdrop-blur-sm border-t border-violet-800/20">
            <Experience />
          </section>

          <section id="skills" className="relative z-10">
            <Skills />
          </section>

          <section id="summary" className="relative z-10 bg-gray-800/50 border-t border-violet-700/20">
            <Summary />
          </section>

          <section id="education" className="relative z-10">
            <Education />
          </section>

          <section id="about" className="relative z-10 bg-gray-800/40 border-t border-violet-800/10">
            <About />
          </section>
        </main>

        <footer className="mt-24 bg-gray-900 border-t border-violet-800/20">
          <Footer />
        </footer>
      </div>

      {/* Gradient décoratif animé (effet "glow" violet subtil) */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.1),_transparent_70%)] animate-pulse-slow"></div>
    </div>
  );
}

export default App;
