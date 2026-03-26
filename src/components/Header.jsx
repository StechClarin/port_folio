import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
    const { language } = useLanguage();
    const sections = [
        { id: 'projects', label: language === 'fr' ? 'Projets' : 'Projects' },
        { id: 'experience', label: language === 'fr' ? 'Expérience' : 'Experience' },
        { id: 'skills', label: language === 'fr' ? 'Compétences' : 'Skills' },
        { id: 'education', label: language === 'fr' ? 'Formation' : 'Education' },
        { id: 'about', label: language === 'fr' ? 'À propos' : 'About' },
        { id: 'contact', label: language === 'fr' ? 'Contact' : 'Contact' },
    ];

  return (
    <header className="relative py-16 md:py-32 text-center overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>

      <div className="relative z-10 px-6">
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-widest [text-shadow:0_0_30px_rgba(124,58,237,0.5)]">
          STECH <span className="text-violet-500">CLARIN</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium uppercase tracking-[0.3em] mb-4">
          {language === 'fr' ? 'Développeur Full Stack & Ingénieur DevOps' : 'Full Stack Developer & DevOps Engineer'}
        </p>
        
        {/* Badge Navigation for Mobile and Desktop */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4 max-w-3xl mx-auto">
          {sections.map(section => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-4 py-2 md:px-6 md:py-2.5 bg-[#111] border border-white/5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-violet-400 hover:text-white transition-all shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:border-violet-500/50 hover:-translate-y-1"
            >
              {section.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
