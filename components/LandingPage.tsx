import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAppContext } from '../context/AppContext';

const LandingPage: React.FC = () => {
  const { navigateWithTransition } = useAppContext();
  const [step, setStep] = useState(0); // 0: initial, 1: first line, 2: second line, 3: button

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 500); // Show first line
    const timer2 = setTimeout(() => setStep(2), 4500); // Show main heading (500ms + 4000ms delay)
    const timer3 = setTimeout(() => setStep(3), 6000); // Show button (4500ms + 1500ms)

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white/60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-soft">
          <div className="flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] w-full max-w-md mx-auto">
            <p
              className={`text-gray-600 mb-8 text-xl transition-opacity duration-1000 ease-in-out ${
                step >= 1 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              It's not a website for wishes, it's...
            </p>

            <h1
              className={`font-accent text-4xl sm:text-6xl text-gray-800 mb-10 transition-all duration-1000 ease-in-out ${
                step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              How You Make the World Feel
            </h1>

            <div
              className={`transition-opacity duration-1000 ease-in-out ${
                step >= 3 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={() => navigateWithTransition('/memories')}
                className="rounded-full px-8 py-3 bg-[#a1a5ff] text-white font-semibold shadow-lg hover:scale-105 hover:bg-opacity-90 transition-all duration-300"
              >
                Let’s Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;