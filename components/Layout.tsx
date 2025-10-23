import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import useDynamicBackground from '../hooks/useDynamicBackground';
import HamburgerButton from './HamburgerButton';
import NavBar from './NavBar';

const AnimatedPetals: React.FC = () => {
  const petals = Array.from({ length: 15 });
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {petals.map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}vw`,
            animation: `petal-float ${10 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: Math.random() * 0.5 + 0.2,
            top: '-5vh',
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode; isTerminal?: boolean; disableDynamicBg?: boolean, noScanlines?: boolean, bgOverride?: string }> = ({ children, isTerminal = false, disableDynamicBg = false, noScanlines = false, bgOverride }) => {
  const { isFading, showNavToggle } = useAppContext();
  const [show, setShow] = useState(false);
  
  if (!disableDynamicBg && !isTerminal) {
    useDynamicBackground();
  }

  useEffect(() => {
    // This triggers the fade-in effect on page load/navigation
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const terminalBgClass = isTerminal ? 'bg-[#0b0c10] text-gray-200' : '';
  const backgroundClass = bgOverride || terminalBgClass;
  const transitionClass = isFading || !show ? 'opacity-0' : 'opacity-100';

  return (
    <div className={`min-h-screen relative overflow-hidden ${backgroundClass}`}>
      <NavBar />
      {showNavToggle && <HamburgerButton />}
      {!isTerminal && <AnimatedPetals />}
      {isTerminal && !noScanlines && <div className="scanline"></div>}
      <main className={`relative z-10 transition-opacity duration-500 ease-in-out ${transitionClass}`}>
        {children}
      </main>
      <footer className={`absolute bottom-0 w-full text-center p-4 text-xs z-10 ${isTerminal ? 'text-gray-500' : 'text-gray-400'}`}>
        Created with love by her friends.
      </footer>
    </div>
  );
};

export default Layout;