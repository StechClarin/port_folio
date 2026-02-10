import React from 'react';

const SectionWrapper = ({ id, children, className = '', ...props }) => {
  return (
    <section id={id} className={`relative z-10 ${className}`} {...props}>
      {children}
    </section>
  );
};

export default SectionWrapper;
