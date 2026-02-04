import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-b border-violet-800/20 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="text-white text-2xl font-bold tracking-wider [text-shadow:0_0_15px_rgba(124,58,237,0.5)] cursor-pointer hover:text-violet-400 transition-colors">
            Mon <span className="text-violet-500">Portfolio</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#projects" className="text-gray-300 hover:text-white hover:text-shadow-glow transition-all text-sm font-medium tracking-wide">Projets</a>
            <a href="#experience" className="text-gray-300 hover:text-white hover:text-shadow-glow transition-all text-sm font-medium tracking-wide">Expérience</a>
            <a href="#skills" className="text-gray-300 hover:text-white hover:text-shadow-glow transition-all text-sm font-medium tracking-wide">Compétences</a>
            <a href="#about" className="text-gray-300 hover:text-white hover:text-shadow-glow transition-all text-sm font-medium tracking-wide">À propos</a>
            <a
              href="/path-to-cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-800 text-white rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] text-sm font-semibold tracking-wide border border-violet-500/30"
            >
              CV
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-20 left-0 w-full bg-gray-900/95 backdrop-blur-xl border-b border-violet-800/20 shadow-2xl transition-all duration-300 ease-in-out transform origin-top ${isOpen ? 'opacity-100 scale-y-100 max-h-screen' : 'opacity-0 scale-y-0 max-h-0'
          }`}
      >
        <div className="px-6 py-8 flex flex-col space-y-6">
          <a href="#projects" onClick={toggleMenu} className="text-gray-200 hover:text-violet-400 text-lg font-medium tracking-wide border-b border-gray-800 pb-2">Projets</a>
          <a href="#experience" onClick={toggleMenu} className="text-gray-200 hover:text-violet-400 text-lg font-medium tracking-wide border-b border-gray-800 pb-2">Expérience</a>
          <a href="#skills" onClick={toggleMenu} className="text-gray-200 hover:text-violet-400 text-lg font-medium tracking-wide border-b border-gray-800 pb-2">Compétences</a>
          <a href="#about" onClick={toggleMenu} className="text-gray-200 hover:text-violet-400 text-lg font-medium tracking-wide border-b border-gray-800 pb-2">À propos</a>
          <a
            href="/path-to-cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={toggleMenu}
            className="text-center px-6 py-3 bg-violet-700 text-white rounded-xl font-bold shadow-lg mt-4"
          >
            Télécharger mon CV
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
