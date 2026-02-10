import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Components
import Header from './components/Header';
import Navbar from './components/Navbar';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Summary from './components/Summary';
import Education from './components/Education';
import About from './components/About';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import SectionWrapper from './components/SectionWrapper';

// Admin Components
import Login from './pages/Admin/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import ProjectManager from './pages/Admin/ProjectManager';
import ExperienceManager from './pages/Admin/ExperienceManager';
import EducationManager from './pages/Admin/EducationManager';
import SkillManager from './pages/Admin/SkillManager';
import SocialManager from './pages/Admin/SocialManager';
import MessagesManager from './pages/Admin/MessagesManager';
import ProtectedRoute from './components/ProtectedRoute';

// Public Portfolio Layout
const Portfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="relative min-h-screen bg-theme-primary text-theme-primary overflow-x-hidden transition-colors duration-300">
      <FloatingActions />
      {/* Navbar : fixée en haut avec z-index élevé */}
      <Navbar isOpen={isMenuOpen} toggleMenu={toggleMenu} scrolled={scrolled} />

      {/* Wrapper général avec padding-top pour passer sous la Navbar */}
      <div className="pt-20 relative z-10">
        {/* Section Header avec accent violet */}
        <section className="bg-gradient-to-b from-violet-700/10 to-transparent transition-colors duration-700">
          <Header />
        </section>

        <main className="space-y-24">
          <SectionWrapper id="projects">
            <Projects />
          </SectionWrapper>

          <SectionWrapper
            id="experience"
            className="bg-theme-secondary/50 backdrop-blur-sm border-t border-violet-800/20"
          >
            <Experience />
          </SectionWrapper>

          <SectionWrapper id="skills">
            <Skills />
          </SectionWrapper>

          <SectionWrapper
            id="summary"
            className="bg-theme-secondary/50 border-t border-violet-700/20"
          >
            <Summary />
          </SectionWrapper>

          <SectionWrapper id="education">
            <Education />
          </SectionWrapper>

          <SectionWrapper
            id="about"
            className="bg-theme-secondary/40 border-t border-violet-800/10"
          >
            <About />
          </SectionWrapper>
        </main>

        <footer className="mt-24 bg-theme-primary border-t border-violet-800/20">
          <Footer />
        </footer>
      </div>

      {/* Gradient décoratif animé (effet "glow" violet subtil) */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.1),_transparent_70%)] animate-pulse-slow"></div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Portfolio />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectManager />} />
          <Route path="experience" element={<ExperienceManager />} />
          <Route path="education" element={<EducationManager />} />
          <Route path="skills" element={<SkillManager />} />
          <Route path="socials" element={<SocialManager />} />
          <Route path="messages" element={<MessagesManager />} />
          {/* Add other admin routes here later */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
