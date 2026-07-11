import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, List, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoEthernanos from '../assets/ethernanos-icon.png';
import { useLanguage } from '../context/LanguageContext';

import { usePortfolioData } from '../hooks/usePortfolioData';

const Projects = () => {
  const { projects, loading } = usePortfolioData();
  const { language } = useLanguage();
  const [isGridView, setIsGridView] = useState(false);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const autoplayRef = useRef(null);
  const touchStartRef = useRef(0);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  // Responsive logic
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const ethernanosProject = {
    id: 'static-ethernanos',
    title: 'EtherNanos Hub',
    description: language === 'fr' 
      ? "Système d'exploitation décentralisé pour applications métier. Haute performance, architecture Rust/Tauri et synchronisation temps-réel sécurisée."
      : "Decentralized operating system for business applications. High performance, Rust/Tauri architecture, and secure real-time synchronization.",
    image_url: logoEthernanos,
    technologies: ['Rust', 'Tauri', 'Angular', 'PostgreSQL'],
    project_url: '/',
    demo_url: null,
    repo_url: 'https://github.com/stechclarin/ethernanos-launcher'
  };

  const allProjects = [ethernanosProject, ...(projects || [])];
  const total = allProjects.length;

  const handleNext = () => setCenterIndex((prev) => (prev + 1) % total);
  const handlePrev = () => setCenterIndex((prev) => (prev - 1 + total) % total);

  // Autoplay Loop
  useEffect(() => {
    if (isGridView || isPaused) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }
    autoplayRef.current = setInterval(handleNext, 4000);
    return () => clearInterval(autoplayRef.current);
  }, [isGridView, isPaused, total]);

  if (loading) {
    return (
      <section id="projects" className="py-24 bg-[#0a0a0a] flex justify-center items-center">
        <Loader2 className="animate-spin text-violet-500/50" size={40} />
      </section>
    );
  }

  // --- 5-SLOT STACK ARCHITECTURE ---
  const getSlotStyle = (offset) => {
    const isSmall = windowWidth < 640;
    const baseW = isMobile ? (isSmall ? windowWidth * 0.88 : 350) : (isTablet ? 600 : 720);
    const baseH = isMobile ? (windowWidth < 400 ? 320 : 360) : 450;
    const spacing = isMobile ? (isSmall ? 70 : 100) : 200;

    switch (offset) {
      case 0: // O (Focus)
        return {
          width: `${baseW}px`,
          height: `${baseH}px`,
          left: '50%',
          transform: 'translateX(-50%) scale(1)',
          zIndex: 100,
          opacity: 1,
          filter: 'brightness(1)',
          pointerEvents: 'auto'
        };
      case -1: // B (Left 1)
        return {
          width: `${baseW}px`,
          height: `${baseH}px`,
          left: `calc(50% - ${spacing}px)`,
          transform: 'translateX(-100%) scale(0.75)',
          zIndex: 80,
          opacity: 1,
          filter: 'brightness(0.35)',
          pointerEvents: 'none'
        };
      case 1: // X (Right 1)
        return {
          width: `${baseW}px`,
          height: `${baseH}px`,
          left: `calc(50% + ${spacing}px)`,
          transform: 'translateX(0%) scale(0.75)',
          zIndex: 80,
          opacity: 1,
          filter: 'brightness(0.35)',
          pointerEvents: 'none'
        };
      case -2: // A (Left 2)
        return {
          width: `${baseW}px`,
          height: `${baseH}px`,
          left: 'calc(50% - 360px)',
          transform: 'translateX(-100%) scale(0.55)',
          zIndex: 60,
          opacity: 1,
          filter: 'brightness(0.12)',
          pointerEvents: 'none'
        };
      case 2: // Y (Right 2)
        return {
          width: `${baseW}px`,
          height: `${baseH}px`,
          left: 'calc(50% + 360px)',
          transform: 'translateX(0%) scale(0.55)',
          zIndex: 60,
          opacity: 1,
          filter: 'brightness(0.12)',
          pointerEvents: 'none'
        };
      default:
        return { opacity: 0, pointerEvents: 'none', zIndex: 0 };
    }
  };

  return (
    <section id="projects" className="relative py-2 md:py-4 bg-[#050505] text-white transition-all duration-1000 overflow-hidden">
      
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12 mb-8 md:mb-16 border-b border-white/5 pb-6 md:pb-10">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-7xl font-light tracking-tighter text-white">
              {language === 'fr' ? 'Mes' : 'Selected'} <span className="font-bold text-violet-500">{language === 'fr' ? 'Projets' : 'Works'}</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-xl font-medium max-w-2xl leading-relaxed">
              {language === 'fr' 
                ? "Une sélection de solutions techniques robustes et d'expériences numériques immersives."
                : "A selection of robust technical solutions and immersive digital experiences."}
            </p>
          </div>
          
          <button
            onClick={() => setIsGridView(!isGridView)}
            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#111] border border-white/10 rounded-full hover:border-violet-500/50 transition-all text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white"
          >
            {isGridView ? <List size={16} /> : <LayoutGrid size={16} />}
            {isGridView ? (language === 'fr' ? 'Architecture Carousel' : 'Carousel View') : (language === 'fr' ? 'Architecture Stack' : 'Stack View')}
          </button>
        </div>

        {isGridView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 my-12">
            {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isMobile={isMobile} language={language} />
            ))}
          </div>
        ) : (
          <div 
            className={`relative w-full md:w-[82%] mx-auto ${isMobile ? 'h-[440px]' : 'h-[530px]'} flex flex-col items-center justify-center space-y-12 md:space-y-12 my-6`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className={`relative w-full ${isMobile ? 'h-[320px]' : 'h-[450px]'} flex items-center justify-center`}>
                
                {!isMobile && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:-left-28 md:-right-28 z-[110] pointer-events-none">
                      <button onClick={handlePrev} className="p-3 md:p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all pointer-events-auto" aria-label="Previous">
                          <ChevronLeft size={isMobile ? 24 : 32} strokeWidth={2} />
                      </button>
                      <button onClick={handleNext} className="p-3 md:p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all pointer-events-auto" aria-label="Next">
                          <ChevronRight size={isMobile ? 24 : 32} strokeWidth={2} />
                      </button>
                  </div>
                )}

                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                {allProjects.map((project, index) => {
                    let offset = index - centerIndex;
                    if (offset > total / 2) offset -= total;
                    if (offset < -total / 2) offset += total;

                    if (Math.abs(offset) > 2) return null;

                    const style = getSlotStyle(offset);
                    const isCenter = offset === 0;

                    return (
                    <div
                        key={project.id}
                        className={`absolute transition-all duration-1000 ease-in-out border border-white/10 rounded-[1.5rem] md:rounded-[3rem] bg-[#0d0d0d] overflow-hidden group/item pointer-events-auto ${isCenter ? (isMobile ? 'shadow-[0_40px_80px_rgba(0,0,0,1)]' : 'shadow-[0_80px_160px_rgba(0,0,0,1)]') : 'shadow-2xl'}`}
                        style={style}
                    >
                        <div className="w-full h-full relative z-10">
                           <ProjectSlotContent 
                             project={project} 
                             isCenter={isCenter} 
                             isFeatured={project.id === 'static-ethernanos'} 
                             isMobile={isMobile} 
                             language={language}
                           />
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>

            <div className="flex justify-center w-full px-4 md:px-0 z-[120]" style={{ perspective: '800px' }}>
              <div className="flex items-center gap-2 md:gap-4 py-2 px-4 md:px-6 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl transition-all duration-700 hover:border-violet-500/30 overflow-hidden" style={{ transform: 'rotateX(35deg)' }}>
                {allProjects.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCenterIndex(i)}
                        className={`h-1 transition-all duration-1000 rounded-full relative ${centerIndex === i ? 'w-8 md:w-16 bg-violet-600 shadow-[0_0_25px_rgba(124,58,237,0.7)]' : 'w-3 md:w-6 bg-white/10 hover:bg-white/30'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    >
                        {centerIndex === i && <span className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></span>}
                    </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ProjectSlotContent = ({ project, isCenter, isFeatured, isMobile, language }) => {
  return (
    <div className="grid grid-cols-12 w-full h-full bg-[#0d0d0d]">
        <div className={`col-span-12 md:col-span-5 p-4 md:p-10 lg:p-12 flex flex-col justify-start space-y-3 md:space-y-6 bg-[#0d0d0d] relative z-20`}>
          {isMobile && (
            <div className="w-full h-[80px] mb-2 rounded-xl border border-white/5 overflow-hidden">
               <img 
                 src={project.image_url || null} 
                 alt=""
                 className={`w-full h-full ${isFeatured ? 'object-contain p-2 grayscale-0' : 'object-cover grayscale-[30%]'}`} 
               />
            </div>
          )}
          <div className="space-y-2 md:space-y-4">
                {isFeatured && (
                  <span className="text-amber-500 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1 border border-amber-500/20 rounded-full inline-block mb-2">
                    {language === 'fr' ? 'Coup de Cœur' : 'Featured'}
                  </span>
                )}
                <h3 className={`font-black leading-[1.1] tracking-tighter transition-all duration-700 ${isCenter ? (isMobile ? 'text-lg text-white' : 'text-xl lg:text-2xl text-white') : 'text-lg text-white/20'} ${isFeatured && isCenter ? '!text-amber-400' : ''}`}>
                  {project.title}
                </h3>
          </div>
          
          <div className={`${isMobile ? 'min-h-[40px]' : 'min-h-[100px]'} flex items-start`}>
            <p className={`text-gray-400 text-[10px] md:text-[10px] lg:text-xs line-clamp-2 md:line-clamp-4 leading-relaxed font-medium transition-opacity duration-700 ${isCenter ? 'opacity-100' : 'opacity-0'}`}>
                {language === 'fr' ? project.description : (project.description_en || project.description)}
            </p>
          </div>

          <div className={`flex flex-wrap gap-1.5 md:gap-2.5 transition-all duration-700 ${isCenter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {project.technologies && project.technologies.slice(0, 5).map(t => (
            <span 
                key={t} 
                className={`px-2 py-1 md:px-3.5 md:py-1.5 border border-white/10 rounded-lg text-[7.5px] md:text-[7.5px] text-gray-300 uppercase font-black bg-white/5 tracking-wider transition-all duration-300 pointer-events-auto ${isFeatured ? 'hover:shadow-[3px_3px_9px_rgba(245,158,11,0.35)] hover:border-amber-500/30' : 'hover:shadow-[3px_3px_9px_rgba(139,92,246,0.25)] hover:border-violet-500/30'} hover:-translate-y-0.5`}
            >
                {t}
            </span>
            ))}
          </div>

          {isMobile && (
             <div className={`flex items-center gap-2 mt-auto pt-2 transition-all duration-1000 ${isCenter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <Link to={isFeatured ? "/" : project.project_url} className={`flex-1 text-center py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${isFeatured ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white text-black shadow-lg'}`}>
                    {language === 'fr' ? 'DÉCOUVRIR' : 'DISCOVER'}
                </Link>
                <a href={project.repo_url} className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/50" aria-label="GitHub Repository">
                    <Github size={12} />
                </a>
             </div>
          )}
       </div>

       <div className="hidden md:block col-span-7 relative h-full bg-[#0d0d0d] overflow-hidden">
          <div className="absolute inset-0 z-10 transition-all duration-[2000ms]">
             <img 
               src={project.image_url || null} 
               alt="" 
               className={`w-full h-full transition-opacity duration-1000 ${isCenter ? 'opacity-100' : 'opacity-20 grayscale'} ${isFeatured ? 'object-contain scale-[0.6]' : 'object-cover'}`} 
             />
          </div>
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#0d0d0d] via-transparent to-transparent -ml-[4px]"></div>

          <div className={`absolute bottom-6 md:bottom-10 left-6 right-6 md:left-10 md:right-10 z-30 flex items-center gap-4 md:gap-6 transition-all duration-1000 ${isCenter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
             <Link to={isFeatured ? "/" : project.project_url} className={`flex-1 text-center py-3 md:py-3.5 rounded-full font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all duration-300 ${isFeatured ? 'bg-amber-500 text-black shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:bg-violet-600 hover:text-white hover:shadow-violet-600/40' : 'bg-white text-black hover:bg-violet-600 hover:text-white hover:shadow-violet-600/40 shadow-xl'}`}>
                {language === 'fr' ? 'EXPLORER' : 'EXPLORE'} <ArrowRight className="inline-block ml-1 md:ml-2" size={12} md={14} />
             </Link>
             <a href={project.repo_url} className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white transition-all transform hover:scale-110 shadow-lg group" aria-label="GitHub Repository">
                <Github size={18} className="group-hover:rotate-12 transition-transform" />
             </a>
          </div>
       </div>
    </div>
  );
};

const ProjectCard = ({ project, isMobile, language }) => {
  const isFeatured = project.id === 'static-ethernanos';
  return (
    <div className={`group relative flex flex-col bg-[#111] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-violet-500/30 ${isFeatured ? 'border-amber-500/20' : ''}`}>
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={project.image_url} 
          alt={project.title} 
          className={`w-full h-full transition-transform duration-1000 group-hover:scale-110 ${isFeatured ? 'object-contain p-8 grayscale-0' : 'object-cover grayscale-[30%] group-hover:grayscale-0'}`} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent"></div>
      </div>
      <div className="p-6 md:p-10">
        <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${isFeatured ? 'text-amber-400' : 'text-white'}`}>{project.title}</h3>
        <p className="text-gray-400 text-sm md:text-base line-clamp-2 mb-6 md:mb-8">
          {language === 'fr' ? project.description : (project.description_en || project.description)}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies && project.technologies.slice(0, 3).map(t => (
                <span key={t} className="px-3 py-1 border border-white/5 rounded-lg text-[7px] text-gray-500 uppercase font-black bg-white/5">{t}</span>
            ))}
        </div>
        <div className="flex items-center gap-6">
          <Link to={isFeatured ? "/" : project.project_url} className={`flex-1 text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isFeatured ? 'bg-amber-500 text-black shadow-lg hover:bg-violet-600 hover:text-white' : 'bg-white text-black hover:bg-violet-600 hover:text-white'}`}>
            {language === 'fr' ? 'Découvrir' : 'Explore'}
          </Link>
          <a href={project.repo_url} className="p-3.5 border border-white/5 rounded-2xl text-gray-500 hover:text-white transition-colors" aria-label="GitHub Repository">
            <Github size={22} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Projects;
