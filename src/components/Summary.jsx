import React from 'react';


const Summary = () => {
  // Note: Admin Profile Edit is not yet implemented in this iteration, 
  // so we might fallback to static or use a placeholder if profile is null.
  // However, we didn't implement ProfileManager yet, so this will likely be empty if we rely only on DB.
  // For now, let's just make it prepared for it, but fallback to a default text if needed 
  // OR we can leave it static for now as ProfileManager wasn't in the immediate list (Projects/Exp/Skills were priority).

  // For this task, I'll keep it static as I haven't implemented ProfileManager CRUD yet.
  // But I'll leave a comment.

  return (
    <section
      id="summary"
      className="relative py-20 bg-gray-800/50 border-t border-violet-700/20"
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#7C3AED_0%,_transparent_70%)] blur-3xl"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h2 className="text-5xl font-extrabold text-center text-white mb-12 tracking-wider [text-shadow:0_0_25px_#7C3AED,0_0_10px_#4C1D95]">
          Professional Summary
        </h2>
        <p className="text-xl text-gray-200 leading-relaxed text-center">
          As a Full Stack Developer and DevOps specialist, I bring a robust
          skill set in Python, Django, and React, complemented by secondary
          expertise in Laravel and Angular. My proficiency extends to Docker and
          GitLab CI for streamlined CI/CD pipelines, and I have a strong command
          of both REST and GraphQL APIs. With a Master's degree in Software
          Engineering and a background in software architecture, I am adept at
          designing and implementing scalable, high-performance applications.
        </p>
      </div>
    </section>
  );
};

export default Summary;
