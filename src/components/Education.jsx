import React from 'react';
import { GraduationCap } from 'lucide-react';
import { usePortfolioData } from '../hooks/usePortfolioData';

const Education = () => {
  const { education, loading } = usePortfolioData();

  if (loading) return null;

  return (
    <section id="education" className="relative py-20">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="relative flex justify-center items-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-wider [text-shadow:0_0_25px_#7C3AED,0_0_10px_#4C1D95] text-center">
            Education
          </h2>
          <GraduationCap className="absolute right-0 md:right-20 top-0 w-12 h-12 text-violet-500 animate-bounce" />
        </div>
        <div className="mt-8 relative">
          <div className="border-l-2 border-purple-800/40 absolute h-full top-0 left-1/2 hidden md:block"></div>

          {education.map((edu, index) => (
            <div
              key={edu.id || index}
              className={`mb-8 flex flex-col md:flex-row justify-between items-center w-full ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
            >
              <div className="order-1 w-full md:w-5/12 hidden md:block"></div>
              <div className="z-20 flex items-center order-1 bg-purple-700 shadow-[0_0_20px_rgba(124,58,237,0.8)] w-8 h-8 rounded-full mb-4 md:mb-0 hidden md:flex">
                <h1 className="mx-auto font-semibold text-lg text-white">
                  {index + 1}
                </h1>
              </div>
              <div className="order-1 bg-gray-800 rounded-lg shadow-[0_0_30px_rgba(124,58,237,0.3)] border border-purple-800/40 w-full md:w-5/12 px-6 py-4 transform hover:scale-105 transition-transform duration-300">
                <h3 className="mb-3 font-bold text-violet-400 text-xl flex justify-between items-start">
                  {edu.degree}
                  <span className="md:hidden text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full border border-purple-700/50">
                    #{index + 1}
                  </span>
                </h3>
                <p className="text-sm leading-snug tracking-wide text-gray-300 text-opacity-100">
                  {edu.school} | {edu.location} | {edu.year}
                </p>
              </div>
            </div>
          ))}

          {education.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              Aucune formation ajoutée pour le moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Education;
