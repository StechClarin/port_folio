import React from 'react';

import { portfolioData } from '../data/portfolio';

const About = () => {
  const { about } = portfolioData;
  const { bio, education, resumeUrl, photoUrl } = about;

  return (
    <section id="about" className="relative py-20 bg-gray-800/40 border-t border-violet-800/10">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center text-white mb-8 md:mb-12 tracking-wider [text-shadow:0_0_25px_#7C3AED,0_0_10px_#4C1D95]">À Propos de Moi</h2>

        <div className="flex flex-col md:flex-row items-center md:space-x-12">

          {/* Bloc de Gauche : Photo de Profil */}
          <div className="md:w-1/3 flex justify-center mb-8 md:mb-0">
            <img
              src={photoUrl}
              alt="Votre Photo de Profil"
              className="rounded-full w-64 h-64 object-cover border-4 border-violet-700 shadow-[0_0_40px_rgba(124,58,237,0.6)]"
            />
          </div>

          {/* Bloc de Droite : Texte et Infos */}
          <div className="md:w-2/3 bg-gray-800 p-8 rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.3)] border border-violet-800/40">
            <div className="space-y-6 text-gray-200">
              <p className="text-lg leading-relaxed">
                {bio}
              </p>

              <div className="mt-6">
                <h3 className="text-2xl font-bold text-white mb-4">Parcours & Formation</h3>
                <ul className="list-disc list-inside text-gray-200 space-y-2">
                  {education.map((edu, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-violet-400 mr-2 mt-1">•</span>
                      <span>{edu.degree} - <span className="font-semibold">{edu.school}</span> ({edu.year})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex justify-center md:justify-start"> {/* Centre le bouton sur mobile, aligne à gauche sur desktop */}
                <a
                  href={resumeUrl}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-violet-700 to-violet-500 text-white text-lg font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Télécharger mon CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
