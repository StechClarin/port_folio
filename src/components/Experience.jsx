import React, { useState, useEffect, useRef } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Experience = () => {
  const { experience, loading } = usePortfolioData();
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const touchStartRef = useRef(0);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    if (!experience) return;
    setCurrentIndex((prev) => (prev + 1) % experience.length);
  };

  const handlePrev = () => {
    if (!experience) return;
    setCurrentIndex((prev) => (prev - 1 + experience.length) % experience.length);
  };

  // Autoplay
  useEffect(() => {
    if (!isMobile || isPaused || !experience || experience.length === 0) return;
    const interval = setInterval(handleNext, 4000);
    return () => clearInterval(interval);
  }, [isMobile, isPaused, experience?.length]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  if (loading || !experience) return null;

  return (
    <section
      id="experience"
      className="relative py-20 bg-theme-secondary/50 backdrop-blur-sm border-t border-violet-800/20 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-white mb-8 md:mb-12 tracking-wider [text-shadow:0_0_25px_#7C3AED,0_0_10px_#4C1D95]">
          {language === 'fr' ? 'Expérience Professionnelle' : 'Professional Experience'}
        </h2>

        {isMobile ? (
          <div 
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {experience.map((exp, index) => (
                  <div key={exp.id || index} className="w-full flex-shrink-0 px-2">
                    <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.2)] border border-violet-800/30 min-h-[320px] flex flex-col justify-center">
                      <h3 className="text-2xl font-black text-violet-400 mb-2">{exp.role}</h3>
                      <div className="text-white font-bold text-lg mb-1">{exp.company}</div>
                      <div className="text-violet-500/70 text-sm font-black uppercase tracking-widest mb-6">{exp.period}</div>
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {experience.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-8 bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'w-2 bg-gray-700'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div
                key={exp.id || index}
                className="group bg-gray-800/40 p-10 rounded-3xl shadow-xl border border-violet-800/20 hover:border-violet-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(124,58,237,0.1)]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white group-hover:text-violet-400 transition-colors">
                      {exp.role}
                    </h3>
                    <div className="text-gray-400 font-bold text-xl mt-1">{exp.company}</div>
                  </div>
                  <div className="px-4 py-2 bg-violet-500/10 rounded-full border border-violet-500/20 text-violet-400 text-xs font-black tracking-widest uppercase">
                    {exp.period}
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}

            {experience.length === 0 && (
              <div className="text-center text-gray-400 py-12 italic">
                Aucune expérience ajoutée pour le moment.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
