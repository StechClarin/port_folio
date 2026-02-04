import React from 'react';

const Header = () => {
  return (
    <header className="relative py-32 text-center overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>

      <div className="relative z-10">
        <h1 className="text-6xl md:text-7xl font-extrabold text-purple-300 tracking-widest [text-shadow:0_0_30px_#7C3AED,0_0_10px_#4C1D95]">
          STECH CLARIN
        </h1>
        <p className="text-2xl mt-6 text-purple-600">
          Full Stack Developer & DevOps Engineer
        </p>
        <div className="mt-10 flex justify-center gap-8 text-lg">
          <a href="#projects" className="text-violet-400 hover:text-white transition-all hover:scale-110">
            Mes Projets
          </a>
          <a href="#about" className="text-violet-400 hover:text-white transition-all hover:scale-110">
            À propos
          </a>
          <a href="#contact" className="text-violet-400 hover:text-white transition-all hover:scale-110">
            Contact
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
