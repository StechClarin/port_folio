import React, { useState, useEffect } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useLanguage } from '../context/LanguageContext';

const BinaryRain = ({ className }) => {
  const binaryString = '0.1'.repeat(500); 
  return (
    <div
      className={`absolute top-0 bottom-0 w-[240px] overflow-hidden opacity-35 select-none pointer-events-none ${className}`}
    >
      <div className="text-violet-500 font-mono text-xs break-all animate-matrix flex flex-col">
        <div>{binaryString}{binaryString}{binaryString}{binaryString}</div>
        <div>{binaryString}{binaryString}{binaryString}{binaryString}</div>
      </div>
    </div>
  );
};

const Skills = () => {
  const { skills, loading } = usePortfolioData();
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPaused, setIsPaused] = useState(false);

  // Define translatable category titles
  const categoryTitles = {
    fr: {
      languages: 'Langages',
      frameworks: 'Frameworks',
      tools: 'DevOps & Outils',
      technicalSkills: 'Compétences Techniques',
    },
    en: {
      languages: 'Languages',
      frameworks: 'Frameworks',
      tools: 'DevOps & Tools',
      technicalSkills: 'Technical Skills',
    },
  };

  const categories = [
    { title: categoryTitles[language].languages, items: skills?.languages || [] },
    { title: categoryTitles[language].frameworks, items: skills?.frameworks || [] },
    { title: categoryTitles[language].tools, items: skills?.tools || [] },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!isMobile || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isMobile, isPaused, categories.length]);

  if (loading) return null;

  const handleTouchStart = (e) => {
    setIsPaused(true);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentIndex((prev) => (prev + 1) % categories.length);
      else setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
    }
  };

  return (
    <section id="skills" className="py-20 relative overflow-hidden bg-[#0a0a0a]">
      <BinaryRain className="left-8 md:left-10" />
      <BinaryRain className="right-8 md:right-10" />

      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-white mb-12 tracking-wider [text-shadow:0_0_25px_#7C3AED,0_0_10px_#4C1D95]">
          {language === 'fr' ? 'Compétences' : 'Technical'} <span className="text-violet-500">{language === 'fr' ? 'Techniques' : 'Skills'}</span>
        </h2>

        {isMobile ? (
          <div 
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden">
               <div 
                 className="flex transition-transform duration-500 ease-out"
                 style={{ transform: `translateX(-${currentIndex * 100}%)` }}
               >
                 {categories.map((cat, i) => (
                   <div key={i} className="w-full flex-shrink-0 px-4">
                     <div className="bg-gray-800/40 p-8 rounded-[2.5rem] backdrop-blur-md border border-violet-500/20 shadow-2xl min-h-[320px] flex flex-col items-center justify-center">
                        <h3 className="text-2xl font-black text-violet-400 mb-8 uppercase tracking-widest text-center border-b border-violet-500/20 pb-4 w-full">
                          {cat.title}
                        </h3>
                        <div className="flex flex-wrap justify-center gap-3">
                          {cat.items.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-violet-900/40 text-violet-100 rounded-full text-xs font-bold border border-violet-500/30 shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-3 mt-10">
              {categories.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === i ? 'w-10 bg-violet-600 shadow-[0_0_15px_#7c3aed]' : 'w-4 bg-white/10'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {categories.map((cat, i) => (
              <div key={i} className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-violet-500/20 shadow-lg hover:shadow-violet-500/20 transition-all duration-300 group">
                <h3 className="text-2xl font-bold text-violet-400 mb-6 text-center border-b border-violet-500/20 pb-4 group-hover:text-white transition-colors">
                  {cat.title}
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {cat.items.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-violet-900/40 text-violet-200 rounded-full text-sm border border-violet-500/30 hover:bg-violet-800/60 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
