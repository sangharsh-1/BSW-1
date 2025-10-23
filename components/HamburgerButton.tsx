import React from 'react';
import { useAppContext } from '../context/AppContext';

const HamburgerButton: React.FC = () => {
  const { isNavOpen, toggleNav } = useAppContext();

  return (
    <button
      onClick={toggleNav}
      className="fixed top-5 left-5 z-[60] bg-white/50 backdrop-blur-sm text-gray-800 rounded-full w-14 h-14 flex flex-col items-center justify-center gap-[6px] shadow-lg hover:scale-110 transition-all duration-300"
      aria-label="Toggle Navigation"
      aria-expanded={isNavOpen}
    >
      <div
        className={`w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${
          isNavOpen ? 'rotate-45 translate-y-[4.5px]' : ''
        }`}
      />
      <div
        className={`w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${
          isNavOpen ? 'opacity-0' : ''
        }`}
      />
      <div
        className={`w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${
          isNavOpen ? '-rotate-45 -translate-y-[4.5px]' : ''
        }`}
      />
    </button>
  );
};

export default HamburgerButton;