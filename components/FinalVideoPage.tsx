import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { useAppContext } from '../context/AppContext';

// The new, heartfelt message
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


const FinalVideoPage: React.FC = () => {
    const { setShowNavToggle } = useAppContext();
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        setShowNavToggle(true);
    }, [setShowNavToggle]);

    const mainMessages = messages.slice(0, -1);
    const birthdayMessage = messages[messages.length - 1];

    return (
        <Layout disableDynamicBg={true}>
            <div className="min-h-screen flex flex-col items-center justify-start pt-20 sm:pt-24 px-4 pb-20">
                <header className="text-center mb-12 animate-fadeIn max-w-4xl mx-auto">
                    <h1 className="font-hero-serif text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                        <span className="block">The Final Chapter</span>
                        <span className="block text-[#a1a5ff]">A Special Message</span>
                    </h1>
                </header>
                
                {/* Message Section */}
                <section className="text-center mb-16 animate-fadeIn max-w-3xl mx-auto" style={{ animationDelay: '300ms' }}>
                    <div className="space-y-8">
                        {mainMessages.map((message, index) => (
                            <p
                                key={index}
                                className="font-accent text-3xl sm:text-4xl leading-relaxed text-gray-700"
                            >
                                {message}
                            </p>
                        ))}
                    </div>
                    <div className="mt-12">
                        <p className="font-accent text-3xl sm:text-4xl leading-relaxed text-gray-700">
                            {birthdayMessage}
                        </p>
                        <hr className="my-8 border-gray-300 max-w-sm mx-auto" />
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Here’s a small gift from my side.<br/>
                            I hope you’ll find it valuable — not for what it is, but for what it means.
                        </p>
                        {!showVideo && (
                            <button
                                onClick={() => setShowVideo(true)}
                                className="mt-8 rounded-full px-8 py-3 bg-[#a1a5ff] text-white font-semibold shadow-lg hover:scale-105 hover:bg-opacity-90 transition-all duration-300 animate-fadeIn"
                            >
                                Show Gift
                            </button>
                        )}
                    </div>
                </section>

                {/* Video Section */}
                {showVideo && (
                    <section className="w-full max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '200ms' }}>
                        <div className="relative bg-black rounded-lg shadow-2xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
                            <iframe
                                src="https://www.youtube.com/embed/wWW6N5n6CBg?autoplay=1"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full"
                            ></iframe>
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
};

export default FinalVideoPage;