import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, List, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ethernanosImg from '../assets/ethernanos.png';

import { usePortfolioData } from '../hooks/usePortfolioData';

const Projects = () => {
  const { projects, loading } = usePortfolioData();
  const [isGridView, setIsGridView] = useState(false);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef(null);

  const ethernanosProject = {
    id: 'static-ethernanos',
    title: 'EtherNanos Hub',
    description: "Système d'exploitation décentralisé pour applications métier. Haute performance, architecture Rust/Tauri et synchronisation temps-réel sécurisée.",
    image_url: ethernanosImg,
    technologies: ['Rust', 'Tauri', 'Angular', 'PostgreSQL', 'C++'],
    project_url: '/ethernanos',
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
    autoplayRef.current = setInterval(handleNext, 9000);
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
    const baseW = 720;
    const baseH = 450;

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
          left: 'calc(50% - 200px)',
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
          left: 'calc(50% + 200px)',
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
    <section id="projects" className="relative py-4 bg-[#050505] text-white transition-all duration-1000 overflow-hidden">
      
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-white">
              Selected <span className="font-bold text-violet-500">Works</span>
            </h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
              Une sélection de solutions techniques robustes et d'expériences numériques immersives.
            </p>
          </div>
          
          <button
            onClick={() => setIsGridView(!isGridView)}
            className="flex items-center gap-3 px-6 py-3 bg-[#141414] border border-white/10 rounded-full hover:bg-white/5 transition-all group shadow-xl"
          >
            <span className="text-xs font-black tracking-widest uppercase">
              {isGridView ? 'Carousel Mode' : 'Stack Mode'}
            </span>
            {isGridView ? <List size={18} /> : <LayoutGrid size={18} />}
          </button>
        </div>

        {isGridView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 my-12">
            {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          /* REDUCED CAROUSEL CONTAINER HEIGHT */
          <div 
            className="relative w-[82%] mx-auto h-[530px] flex flex-col items-center justify-center space-y-12 my-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative w-full h-[450px] flex items-center justify-center">
                
                {/* NAVIGATION (Discreet) */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-[-1.5rem] md:-left-28 md:-right-28 z-[110] pointer-events-none">
                    <button onClick={handlePrev} className="p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all pointer-events-auto">
                        <ChevronLeft size={32} strokeWidth={2} />
                    </button>
                    <button onClick={handleNext} className="p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all pointer-events-auto">
                        <ChevronRight size={32} strokeWidth={2} />
                    </button>
                </div>

                {/* THE 5-SLOT STACK */}
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
                        className={`absolute transition-all duration-1000 ease-in-out border border-white/10 rounded-[3rem] bg-[#0d0d0d] overflow-hidden group/item pointer-events-auto ${isCenter ? 'shadow-[0_80px_160px_rgba(0,0,0,1)]' : 'shadow-2xl'}`}
                        style={style}
                    >
                        <div className="w-full h-full relative z-10">
                           <ProjectSlotContent project={project} isCenter={isCenter} />
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>

            {/* DYNAMIC PROGRESS BAR */}
            <div className="flex items-center gap-6 z-[120]">
                {allProjects.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCenterIndex(i)}
                        className={`h-1.5 transition-all duration-1000 rounded-full relative ${centerIndex === i ? 'w-16 bg-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.5)]' : 'w-6 bg-white/10 hover:bg-white/30'}`}
                    >
                        {centerIndex === i && <span className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></span>}
                    </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// 💎 MODERN STUDIO LAYOUT
const ProjectSlotContent = ({ project, isCenter }) => {
  const isEn = project.id === 'static-ethernanos';
  
  return (
    <div className="grid grid-cols-12 w-full h-full bg-[#0d0d0d]">
       <div className={`col-span-12 md:col-span-5 p-10 lg:p-12 flex flex-col justify-start space-y-6 bg-[#0d0d0d] relative z-20`}>
          <div className="space-y-4">
                {isEn && <span className="text-amber-500 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1 border border-amber-500/20 rounded-full inline-block mb-2">Director's Choice</span>}
                <h3 className={`font-black leading-[1.1] tracking-tighter transition-all duration-700 ${isCenter ? 'text-xl lg:text-2xl text-white' : 'text-lg text-white/20'} ${isEn && isCenter ? '!text-amber-400' : ''}`}>
                {project.title}
                </h3>
          </div>
          
          <div className="min-h-[100px] flex items-start">
            <p className={`text-gray-400 text-[10px] lg:text-xs line-clamp-4 leading-relaxed font-medium transition-opacity duration-700 ${isCenter ? 'opacity-100' : 'opacity-0'}`}>
                {project.description}
            </p>
          </div>

          <div className={`flex flex-wrap gap-2.5 transition-all duration-700 ${isCenter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {project.technologies && project.technologies.slice(0, 5).map(t => (
            <span 
                key={t} 
                className={`px-3.5 py-1.5 border border-white/10 rounded-lg text-[7.5px] text-gray-300 uppercase font-black bg-white/5 tracking-wider transition-all duration-300 pointer-events-auto ${isEn ? 'hover:shadow-[3px_3px_9px_rgba(245,158,11,0.35)] hover:border-amber-500/30' : 'hover:shadow-[3px_3px_9px_rgba(139,92,246,0.25)] hover:border-violet-500/30'} hover:-translate-y-0.5`}
            >
                {t}
            </span>
            ))}
          </div>
       </div>

       <div className="hidden md:block col-span-7 relative h-full bg-[#0d0d0d] overflow-hidden">
          <div className="absolute inset-0 z-10 transition-all duration-[2000ms]">
            <img src={project.image_url} alt="" className={`w-full h-full object-cover transition-opacity duration-1000 ${isCenter ? 'opacity-100' : 'opacity-20 grayscale'}`} />
          </div>
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#0d0d0d] via-transparent to-transparent -ml-[4px]"></div>

          <div className={`absolute bottom-10 left-10 right-10 z-30 flex items-center gap-6 transition-all duration-1000 ${isCenter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
             <Link to={isEn ? "/ethernanos" : project.project_url} className={`flex-1 text-center py-3.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all duration-300 ${isEn ? 'bg-amber-500 text-black shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:bg-violet-600 hover:text-white hover:shadow-violet-600/40' : 'bg-white text-black hover:bg-violet-600 hover:text-white hover:shadow-violet-600/40 shadow-xl'}`}>
                EXPLORER <ArrowRight className="inline-block ml-2" size={14} />
             </Link>
             <a href={project.repo_url} className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white transition-all transform hover:scale-110 shadow-lg group">
                <Github size={18} className="group-hover:rotate-12 transition-transform" />
             </a>
          </div>
       </div>
    </div>
  );
};

const ProjectCard = ({ project }) => {
  const isEn = project.id === 'static-ethernanos';
  return (
    <div className={`group relative flex flex-col bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-violet-500/30 ${isEn ? 'border-amber-500/20' : ''}`}>
      <div className="aspect-video relative overflow-hidden">
        <img src={project.image_url} alt={project.title} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent"></div>
      </div>
      <div className="p-10">
        <h3 className={`text-xl font-bold mb-4 ${isEn ? 'text-amber-400' : 'text-white'}`}>{project.title}</h3>
        <p className="text-gray-400 text-base line-clamp-2 mb-8">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies && project.technologies.slice(0, 3).map(t => (
                <span key={t} className="px-3 py-1 border border-white/5 rounded-lg text-[7px] text-gray-500 uppercase font-black bg-white/5">{t}</span>
            ))}
        </div>
        <div className="flex items-center gap-6">
          <Link to={isEn ? "/ethernanos" : project.project_url} className={`flex-1 text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isEn ? 'bg-amber-500 text-black shadow-lg hover:bg-violet-600 hover:text-white' : 'bg-white text-black hover:bg-violet-600 hover:text-white'}`}>
            Explore
          </Link>
          <a href={project.repo_url} className="p-3.5 border border-white/5 rounded-2xl text-gray-500 hover:text-white transition-colors">
            <Github size={22} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Projects;
