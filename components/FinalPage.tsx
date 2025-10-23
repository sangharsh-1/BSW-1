import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAppContext } from '../context/AppContext';

const messages = [
  "Any day by itself is just another ordinary day — another date on the calendar, another sunrise and sunset.",
  "Festivals, birthdays, celebrations… none of them are born special.",
  "We’re the ones who give them meaning — we set the rhythm, create the laughter, paint the joy within the lines we draw.",
  "And today, just like that, we’ve decided your day won’t be ordinary.",
  "Because this one belongs to you — the reason behind so many smiles, the one who makes even simple days feel worth remembering.",
  "And for that — you deserve every good thing this life has to offer.",
  "This is a gift from me, and from all of us who were lucky enough to know you.",
  "Happy Birthday, Kirti."
];


const FinalPage: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const { setShowNavToggle } = useAppContext();

  useEffect(() => {
    setShowNavToggle(true);
    // Initial delay before first message after page load
    const introTimer = setTimeout(() => {
        setCurrentMessageIndex(0);
    }, 1500);

    return () => clearTimeout(introTimer);
  }, [setShowNavToggle]);

  useEffect(() => {
    if (currentMessageIndex >= 0 && currentMessageIndex < messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prevIndex => prevIndex + 1);
      }, 3500); // Delay between lines
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex]);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="bg-white/60 backdrop-blur-xl p-10 sm:p-16 rounded-3xl shadow-soft animate-fadeIn max-w-3xl w-full">
          <h1 className="font-accent text-4xl sm:text-5xl text-gray-800 mb-10 animate-fadeIn" style={{ animationDelay: '500ms' }}>
            Krish's Wish, Unlocked.
          </h1>
          
          <div className="space-y-8">
            {messages.map((message, index) => (
              <p
                key={index}
                className={`font-accent text-3xl sm:text-4xl leading-relaxed text-gray-700 transition-opacity duration-1000 ease-in-out ${currentMessageIndex >= index ? 'opacity-100' : 'opacity-0'}`}
                style={{textShadow: '0 0 10px rgba(0,0,0,0.1)'}}
              >
                {message}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FinalPage;