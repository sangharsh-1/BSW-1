import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Layout from './Layout';

// --- SVG Doodle Components ---
const DoodleIcons = () => (
  <>
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="wobble">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="1" result="warp" />
          <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="2" in="SourceGraphic" in2="warp" />
        </filter>
      </defs>
    </svg>
    <div className="absolute top-[18%] left-[75%]" style={{ filter: 'url(#wobble)' }}>
      <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.2,2.3c0-1.1-0.9-2-2-2s-2,0.9-2,2s0.9,2,2,2S22.2,3.4,22.2,2.3z M29,11.3c0,4.4-3.6,8-8,8s-8-3.6-8-8c0-4.4,3.6-8,8-8S29,6.9,29,11.3z" stroke="#2c2c2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M2,28.3c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S2,29.4,2,28.3z" stroke="#2c2c2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
    <div className="absolute top-[48%] left-[45%] transform -translate-x-1/2 -translate-y-1/2" style={{ filter: 'url(#wobble)' }}>
      <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M42,20H32c-2.2,0-4,1.8-4,4v10c0,2.2,1.8,4,4,4h10c2.2,0,4-1.8,4-4V24C46,21.8,44.2,20,42,20z" stroke="#2c2c2c" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12,2H6C3.8,2,2,3.8,2,6v6c0,2.2,1.8,4,4,4h6c2.2,0,4-1.8,4-4V6C16,3.8,14.2,2,12,2z" stroke="#2c2c2c" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="9" cy="9" r="3" stroke="#2c2c2c" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
    <div className="absolute top-[59%] left-[24%]" style={{ filter: 'url(#wobble)' }}>
       <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2,18c0,0,5-4,10-4s10,4,10,4s5-4,10-4s10,4,10,4v6H2V18z" stroke="#2c2c2c" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M12,14V4c0-2.2-1.8-4-4-4S4,1.8,4,4v10" stroke="#2c2c2c" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
  </>
);

const EditableField = ({ path, index, className, as: Component = 'span' }: { path: string; index?: number; className?: string; as?: 'span' | 'p' | 'div' }) => {
  const { aboutMeContent, setAboutMeContent } = useAppContext();

  const value = index !== undefined ? (aboutMeContent as any)[path][index] : (aboutMeContent as any)[path];

  const handleUpdate = (e: React.FocusEvent<HTMLElement>) => {
    const newValue = e.currentTarget.textContent || '';
    const newContent = JSON.parse(JSON.stringify(aboutMeContent));
    if (index !== undefined) {
      newContent[path][index] = newValue;
    } else {
      newContent[path] = newValue;
    }
    setAboutMeContent(newContent);
  };

  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      onBlur={handleUpdate}
      className={`focus:outline-none focus:bg-yellow-200/50 rounded-sm px-1 -mx-1 ${className}`}
    >
      {value}
    </Component>
  );
};


const AboutPage: React.FC = () => {
    const { saveAboutMeContent, resetAboutMeContent, navigateWithTransition, setShowNavToggle } = useAppContext();

    useEffect(() => {
        setShowNavToggle(true);
    }, [setShowNavToggle]);

    return (
        <Layout disableDynamicBg bgOverride="bg-gradient-to-br from-rose-100 to-teal-100">
            <div className="min-h-screen flex items-center justify-center p-4 font-doodle">
                <div className="fixed top-5 right-5 z-20 flex flex-col items-end gap-4">
                    <button
                      onClick={() => navigateWithTransition('/memories')}
                      className="rounded-full px-8 py-3 bg-[#a1a5ff] text-white font-semibold shadow-lg hover:scale-105 hover:bg-opacity-90 transition-all duration-300"
                    >
                      Memory Lane
                    </button>
                    <button onClick={saveAboutMeContent} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors w-full">Save Changes</button>
                    <button onClick={resetAboutMeContent} className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors w-full">Reset</button>
                </div>

                <div className="relative w-full max-w-3xl">
                    {/* Clipboard */}
                    <div className="h-10 bg-gray-400 rounded-t-lg shadow-md relative flex justify-center items-center border-b-2 border-gray-500">
                        <div className="w-24 h-6 bg-gray-600 rounded-md shadow-inner"></div>
                    </div>

                    {/* Paper */}
                    <div className="bg-[#F7F1E3] shadow-lg rounded-b-lg p-10 relative aspect-[1/1.414] overflow-hidden">
                        {/* Ruled Lines */}
                        <div className="absolute inset-0 top-12 pointer-events-none" style={{
                            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, #d1d5db 28px, #d1d5db 29px)',
                            backgroundSize: '100% 29px'
                        }}></div>
                        <div className="relative w-full h-full text-gray-800" style={{ filter: 'url(#wobble)' }}>
                            <DoodleIcons />

                            {/* ABOUT ME Header */}
                            <h1 style={{ fontFamily: "'Patrick Hand', cursive", textShadow: '2px 2px 0 #4B8A88' }} className="text-6xl text-center text-stroke-black absolute top-[2%] left-1/2 -translate-x-1/2">
                               ABOUT ME
                            </h1>

                            {/* Portrait */}
                            <div className="absolute top-[10%] left-[5%] w-32 h-32 border-2 border-black rounded-md p-1">
                                <div className="w-full h-full border border-dashed border-gray-400 flex items-center justify-center">
                                    {/* Simple SVG for girl outline */}
                                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M50 55C63.8071 55 75 43.8071 75 30C75 16.1929 63.8071 5 50 5C36.1929 5 25 16.1929 25 30C25 43.8071 36.1929 55 50 55Z" stroke="#2c2c2c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M20 95C20 74.5887 33.4315 58 50 58C66.5685 58 80 74.5887 80 95" stroke="#2c2c2c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            
                            {/* My Nature */}
                            <div className="absolute top-[18%] left-[45%] w-56">
                                <h3 className="text-2xl font-bold mb-1 text-center" style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>MY NATURE</h3>
                                <ul className="text-lg list-inside list-disc">
                                    <li><EditableField path="nature" index={0} /></li>
                                    <li><EditableField path="nature" index={1} /></li>
                                    <li><EditableField path="nature" index={2} /></li>
                                </ul>
                            </div>
                            
                            {/* Birthday */}
                            <div className="absolute top-[32%] left-[8%]">
                               <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>BIRTHDAY</h3>
                               <div className="w-32 h-32 bg-white border-2 border-black p-2 transform -rotate-6 shadow-md">
                                   <p className="text-center text-2xl font-bold">Oct</p>
                                   <p className="text-center text-6xl font-bold">22</p>
                               </div>
                            </div>

                            {/* Music */}
                            <div className="absolute top-[35%] left-[50%] w-64">
                                <h3 className="text-xl italic mb-1" style={{ fontFamily: "'Caveat', cursive" }}>music</h3>
                                <p className="text-lg"><EditableField path="music" /></p>
                            </div>
                            
                            <h2 className="absolute top-[48%] left-[58%] text-3xl font-bold" style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>THINGS I LIKE</h2>

                            {/* Food */}
                            <div className="absolute top-[55%] left-[8%]">
                                <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>FOOD</h3>
                                <ul className="text-lg list-inside list-disc">
                                    <li><EditableField path="food" index={0} /></li>
                                    <li><EditableField path="food" index={1} /></li>
                                    <li><EditableField path="food" index={2} /></li>
                                    <li><EditableField path="food" index={3} /></li>
                                    <li><EditableField path="food" index={4} /></li>
                                </ul>
                            </div>

                            {/* Poetry */}
                            <div className="absolute top-[80%] left-[8%]">
                                <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>Poetry</h3>
                                <ul className="text-lg list-inside list-disc">
                                    <li><EditableField path="poetry" index={0} /></li>
                                    <li><EditableField path="poetry" index={1} /></li>
                                </ul>
                            </div>

                            {/* Obsessed with Art */}
                            <div className="absolute top-[65%] left-[38%]">
                                <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>Obsessed with Art</h3>
                                 <ul className="text-lg list-inside list-disc">
                                    <li><EditableField path="art" index={0} /></li>
                                    <li><EditableField path="art" index={1} /></li>
                                    <li><EditableField path="art" index={2} /></li>
                                    <li><EditableField path="art" index={3} /></li>
                                </ul>
                            </div>

                            {/* Taking Photos */}
                             <div className="absolute top-[55%] left-[65%] text-center">
                                 <p className="text-lg"><EditableField path="likes" /></p>
                             </div>

                            {/* Movie & TV Shows */}
                            <div className="absolute top-[65%] left-[70%]">
                                <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>MOVIE</h3>
                                 <ul className="text-lg list-inside list-disc">
                                    <li><EditableField path="movies" index={0} /></li>
                                    <li><EditableField path="movies" index={1} /></li>
                                </ul>
                                 <h3 className="text-2xl font-bold mb-1 mt-4" style={{ fontFamily: "'Gloria Hallelujah', cursive" }}>TV Shows</h3>
                                 <ul className="text-lg list-inside list-disc">
                                    <li><EditableField path="tvShows" index={0} /></li>
                                    <li><EditableField path="tvShows" index={1} /></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AboutPage;