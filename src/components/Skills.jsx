import React from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';

const BinaryRain = ({ className }) => {
  const binaryString = '0.1'.repeat(500); // Generates a long string of 10s
  return (
    <div
      className={`absolute top-0 bottom-0 w-[240px] overflow-hidden opacity-35 select-none pointer-events-none ${className}`}
    >
      <div className="text-violet-500 font-mono text-xs break-all animate-matrix flex flex-col">
        {/* First Copy */}
        <div>
          {binaryString}
          {binaryString}
          {binaryString}
          {binaryString}
        </div>
        {/* Second Copy (Identical for loop) */}
        <div>
          {binaryString}
          {binaryString}
          {binaryString}
          {binaryString}
        </div>
      </div>
    </div>
  );
};

const Skills = () => {
  const { skills, loading } = usePortfolioData();

  if (loading) return null;

  return (
    <section id="skills" className="relative py-20 overflow-hidden">
      {/* Matrix Animation Columns */}
      <BinaryRain className="left-8 md:left-10" />
      <BinaryRain className="right-8 md:right-10" />

      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-white mb-8 md:mb-12 tracking-wider [text-shadow:0_0_25px_#7C3AED,0_0_10px_#4C1D95]">
          Technical Skills
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Languages */}
          <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-violet-500/20 shadow-lg hover:shadow-violet-500/20 transition-all duration-300">
            <h3 className="text-2xl font-bold text-violet-400 mb-6 text-center border-b border-violet-500/20 pb-4">
              Languages
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {(skills.languages || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-violet-900/40 text-violet-200 rounded-full text-sm border border-violet-500/30 hover:bg-violet-800/60 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Frameworks */}
          <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-violet-500/20 shadow-lg hover:shadow-violet-500/20 transition-all duration-300">
            <h3 className="text-2xl font-bold text-violet-400 mb-6 text-center border-b border-violet-500/20 pb-4">
              Frameworks
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {(skills.frameworks || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-violet-900/40 text-violet-200 rounded-full text-sm border border-violet-500/30 hover:bg-violet-800/60 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* DevOps & Tools */}
          <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-violet-500/20 shadow-lg hover:shadow-violet-500/20 transition-all duration-300">
            <h3 className="text-2xl font-bold text-violet-400 mb-6 text-center border-b border-violet-500/20 pb-4">
              DevOps & Tools
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {(skills.tools || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-violet-900/40 text-violet-200 rounded-full text-sm border border-violet-500/30 hover:bg-violet-800/60 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
