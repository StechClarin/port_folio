import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const FloatingActions = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Calculate scroll progress
  const calculateScrollProgress = () => {
    const scrollTop = window.pageYOffset;
    const windowHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / windowHeight) * 100;
    setScrollProgress(scrollPercent);

    if (scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top coordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', calculateScrollProgress);
    return () => window.removeEventListener('scroll', calculateScrollProgress);
  }, []);

  const actions = [
    {
      icon: <Mail size={20} />,
      label: 'Email',
      onClick: () => (window.location.href = 'mailto:stechclarin@gmail.com'),
      color: 'bg-violet-600',
      hoverColor: 'hover:bg-violet-700',
      textColor: 'text-white',
    },
    {
      icon: <MessageCircle size={20} />,
      label: 'WhatsApp',
      onClick: () => window.open('https://wa.me/221771483483', '_blank'),
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      textColor: 'text-white',
    },
  ];

  // Circle properties for scroll progress
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 items-center">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-4 items-center"
          >
            {/* Action Buttons */}
            {actions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={action.onClick}
                className={`p-3 rounded-full shadow-lg transition-all duration-300 ${action.color} ${action.hoverColor} ${action.textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500`}
                title={action.label}
                aria-label={action.label}
              >
                {action.icon}
              </motion.button>
            ))}

            {/* Scroll to Top Button with Circular Progress */}
            <div className="relative flex items-center justify-center">
              <svg
                className="transform -rotate-90 w-12 h-12 absolute"
                width="48"
                height="48"
                viewBox="0 0 48 48"
              >
                <circle
                  className="text-gray-300"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="24"
                  cy="24"
                  opacity="0.3"
                />
                <circle
                  className="text-violet-500 transition-all duration-300 ease-in-out"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="24"
                  cy="24"
                />
              </svg>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className="relative z-10 p-2 rounded-full bg-white text-gray-900 shadow-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
                aria-label="Scroll to top"
              >
                <ArrowUp size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActions;
