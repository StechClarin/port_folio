import React from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';

const Experience = () => {
  const { experience, loading } = usePortfolioData();

  if (loading) return null; // Or a skeleton

  return (
    <section
      id="experience"
      className="relative py-20 bg-theme-secondary/50 backdrop-blur-sm border-t border-violet-800/20"
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-white mb-8 md:mb-12 tracking-wider [text-shadow:0_0_25px_#7C3AED,0_0_10px_#4C1D95]">
          Expérience Professionnelle
        </h2>
        <div className="space-y-8">
          {experience.map((exp, index) => (
            <div
              key={exp.id || index}
              className="bg-gray-800 p-6 rounded-lg shadow-[0_0_30px_rgba(124,58,237,0.3)] border border-violet-800/40"
            >
              <h3 className="text-2xl font-bold text-violet-400">
                {exp.role}
              </h3>
              <div className="text-gray-300 font-semibold text-lg">{exp.company}</div>
              <div className="text-gray-500 text-sm mb-4">{exp.period}</div>
              <p className="text-gray-200 whitespace-pre-wrap">{exp.description}</p>
            </div>
          ))}

          {experience.length === 0 && (
            <div className="text-center text-gray-400">
              Aucune expérience ajoutée pour le moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Experience;
