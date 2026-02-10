import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import {
  EffectCoverflow,
  EffectFade,
  Pagination,
  Autoplay,
} from 'swiper/modules';
import { LayoutGrid, List, Loader2 } from 'lucide-react';

import { usePortfolioData } from '../hooks/usePortfolioData';

const Projects = () => {
  const { projects, loading } = usePortfolioData();
  const [isGridView, setIsGridView] = useState(false);

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-theme-primary flex justify-center items-center">
        <Loader2 className="animate-spin text-violet-500" size={48} />
      </section>
    );
  }

  // Filter out non-featured if needed or just show all. Admin has 'is_featured' flag.
  // For now show all, maybe sort by display_order (handled in hook)

  return (
    <section
      id="projects"
      className="relative py-20 bg-theme-primary overflow-hidden transition-colors duration-300"
    >
      {/* Halo violet doux */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-theme-primary tracking-wider [text-shadow:0_0_25px_#7C3AED,0_0_10px_#4C1D95]">
            My Projects
          </h2>
          <button
            onClick={() => setIsGridView(!isGridView)}
            className="p-3 bg-theme-secondary rounded-full hover:bg-violet-700 transition-colors shadow-lg border border-violet-500/30 group"
            title={isGridView ? 'View as Carousel' : 'View as Grid'}
          >
            {isGridView ? (
              <LayoutGrid className="text-violet-400 group-hover:text-white" size={24} />
            ) : (
              <List className="text-violet-400 group-hover:text-white" size={24} />
            )}
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p>Projects coming soon...</p>
          </div>
        ) : isGridView ? (
          /* --- Grid View --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id || index}
                className="group bg-theme-secondary/40 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden flex flex-col hover:-translate-y-3 transition-all duration-500 border border-white/10 hover:border-violet-500/30 hover:shadow-violet-500/20"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={project.image_url || 'https://via.placeholder.com/800x400/7C3AED/FFFFFF?text=Project'}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <h3 className="text-xl font-bold text-white tracking-wide [text-shadow:0_4px_12px_rgba(0,0,0,0.5)] group-hover:text-violet-300 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-theme-secondary text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(project.technologies || []).map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-violet-500/10 text-violet-300 rounded-full text-xs font-medium border border-violet-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-auto pt-4 border-t border-gray-700/50">
                    <a
                      href={project.demo_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-center py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-violet-500/25 ${!project.demo_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Demo
                    </a>
                    {/* Assuming project_url was intended for 'Detail View' but effectively redundant with Demo/Repo in this layout, or maybe it is the same as Demo? Keeping logic consistent with previous code */}
                    <a
                      href={project.project_url || '#'}
                      className="flex items-center justify-center py-2.5 bg-theme-primary hover:bg-theme-secondary text-theme-primary rounded-xl text-sm font-medium transition-all border border-gray-700 hover:border-gray-600"
                    >
                      Voir
                    </a>
                    <a
                      href={project.repo_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-center py-2.5 bg-transparent hover:bg-gray-800/50 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-all border border-gray-700/50 hover:border-gray-600 ${!project.repo_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Code
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* --- Desktop View: 3D Coverflow --- */}
            <div className="hidden md:block">
              <Swiper
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView="auto"
                loop={projects.length > 2} // Only loop if enough items
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                coverflowEffect={{
                  rotate: 45,
                  stretch: 0,
                  depth: 120,
                  modifier: 1.2,
                  slideShadows: true,
                }}
                pagination={{ clickable: true }}
                modules={[EffectCoverflow, Pagination, Autoplay]}
                className="mySwiper"
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
              >
                {projects.map((project, index) => (
                  <SwiperSlide
                    key={project.id || index}
                    className="transition-transform duration-500"
                  >
                    <div className="group bg-theme-secondary/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden h-[36rem] flex flex-col hover:shadow-[0_20px_40px_rgba(124,58,237,0.15)] hover:border-violet-500/40 border border-white/5 transition-all duration-500">
                      <div className="relative h-1/2 overflow-hidden">
                        <img
                          src={project.image_url || 'https://via.placeholder.com/800x400/7C3AED/FFFFFF?text=Project'}
                          alt={project.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-violet-300 border border-violet-500/30">
                          {(project.technologies && project.technologies[0]) || 'Dev'}
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow relative -mt-12 bg-gradient-to-b from-transparent to-theme-secondary/90">
                        <div className="bg-theme-secondary/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/5 mb-6 transform -translate-y-6 group-hover:-translate-y-8 transition-transform duration-500">
                          <h3 className="text-2xl font-bold text-theme-primary mb-2 tracking-wide group-hover:text-violet-400 transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-theme-secondary text-sm leading-relaxed line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-2 mb-8 justify-center">
                            {(project.technologies || []).map((tech, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded-full text-xs font-medium border border-gray-700 group-hover:border-violet-500/30 transition-colors"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <a
                              href={project.demo_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-violet-300 transition-all transform hover:-translate-y-1 shadow-lg ${!project.demo_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              Demo
                            </a>
                            <a
                              href={project.project_url || '#'}
                              className="flex items-center justify-center py-3 bg-gray-700/50 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all transform hover:-translate-y-1 border border-white/10"
                            >
                              Voir
                            </a>
                            <a
                              href={project.repo_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center py-3 bg-transparent text-white rounded-xl font-semibold hover:bg-white/10 transition-all border border-white/20 hover:border-white/40 ${!project.repo_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              Github
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* --- Mobile View: Static Card with Dynamic Content (Fade Effect) --- */}
            <div className="block md:hidden">
              <div className="relative h-[40rem] w-full bg-theme-secondary/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
                {/* Static Frame Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50 z-20"></div>

                <Swiper
                  effect="fade"
                  fadeEffect={{ crossFade: true }}
                  grabCursor={true}
                  loop={projects.length > 1}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  modules={[EffectFade, Pagination, Autoplay]}
                  className="h-full w-full"
                >
                  {projects.map((project, index) => (
                    <SwiperSlide
                      key={project.id || index}
                      className="h-full flex flex-col bg-theme-primary"
                    >
                      {/* Top Half: Image */}
                      <div className="relative h-1/2 overflow-hidden">
                        <img
                          src={project.image_url || 'https://via.placeholder.com/800x400/7C3AED/FFFFFF?text=Project'}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-violet-300 border border-violet-500/30 z-10">
                          {(project.technologies && project.technologies[0]) || 'Dev'}
                        </div>
                      </div>

                      {/* Bottom Half: Content */}
                      <div className="h-1/2 p-6 flex flex-col relative bg-theme-secondary">
                        {/* Floating Card for Title */}
                        <div className="bg-theme-secondary/80 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-white/5 -mt-16 relative z-10 mb-4">
                          <h3 className="text-2xl font-bold text-theme-primary mb-2 tracking-wide">
                            {project.title}
                          </h3>
                          <p className="text-theme-secondary text-sm leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                        </div>

                        <div className="mt-auto">
                          {/* Tech Stack */}
                          <div className="flex flex-wrap gap-2 mb-6 justify-center">
                            {(project.technologies || []).slice(0, 3).map((tech, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-theme-secondary/50 text-theme-secondary rounded-full text-xs font-medium border border-gray-700"
                              >
                                {tech}
                              </span>
                            ))}
                            {(project.technologies || []).length > 3 && (
                              <span className="px-2 py-1 text-gray-400 text-xs">
                                +{(project.technologies || []).length - 3}
                              </span>
                            )}
                          </div>

                          {/* Buttons */}
                          <div className="grid grid-cols-3 gap-3">
                            <a
                              href={project.demo_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center py-2.5 bg-violet-600 text-white rounded-lg font-bold text-sm shadow-lg ${!project.demo_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              Demo
                            </a>
                            <a
                              href={project.project_url || '#'}
                              className="flex items-center justify-center py-2.5 bg-gray-800 text-white rounded-lg font-semibold text-sm border border-gray-700"
                            >
                              Voir
                            </a>
                            <a
                              href={project.repo_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center py-2.5 bg-transparent text-gray-300 rounded-lg font-semibold text-sm border border-gray-700 ${!project.repo_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              Code
                            </a>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Projects;
