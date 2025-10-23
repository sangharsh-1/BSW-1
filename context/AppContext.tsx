import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Fix: Define content shape for the About Me page
interface AboutMeContent {
  nature: string[];
  music: string;
  food: string[];
  poetry: string[];
  art: string[];
  likes: string;
  movies: string[];
  tvShows: string[];
}

// Fix: Define initial content for the About Me page
const initialAboutMeContent: AboutMeContent = {
    nature: ['Loves sunsets', 'Enjoys long walks', 'Fascinated by stars'],
    music: 'Taylor Swift, The Weeknd, and anything with a good beat.',
    food: ['Spicy ramen', 'Chocolate lava cake', 'Sushi', 'Mangoes', 'Pizza'],
    poetry: ['Rumi', 'Mary Oliver'],
    art: ['Van Gogh', 'Studio Ghibli films', 'Digital painting', 'Photography'],
    likes: 'Taking photos of clouds and flowers.',
    movies: ['Your Name', 'Spirited Away'],
    tvShows: ['Friends', 'The Office'],
};

const ABOUT_ME_STORAGE_KEY = 'aboutMeContent';

interface AppContextType {
  navigateWithTransition: (path: string) => void;
  isFading: boolean;
  isNavOpen: boolean;
  toggleNav: () => void;
  showNavToggle: boolean;
  setShowNavToggle: (show: boolean) => void;
  // Fix: Add properties for About Me page content management
  aboutMeContent: AboutMeContent;
  setAboutMeContent: React.Dispatch<React.SetStateAction<AboutMeContent>>;
  saveAboutMeContent: () => void;
  resetAboutMeContent: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFading, setIsFading] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showNavToggle, setShowNavToggle] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fix: Add state for About Me content, loading from localStorage
  const [aboutMeContent, setAboutMeContent] = useState<AboutMeContent>(() => {
    try {
      const storedContent = localStorage.getItem(ABOUT_ME_STORAGE_KEY);
      return storedContent ? JSON.parse(storedContent) : initialAboutMeContent;
    } catch (error) {
      console.error('Error reading aboutMeContent from localStorage', error);
      return initialAboutMeContent;
    }
  });

  useEffect(() => {
    if (isFading) {
      const timer = setTimeout(() => setIsFading(false), 50); 
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const toggleNav = useCallback(() => {
    setIsNavOpen(prev => !prev);
  }, []);

  const navigateWithTransition = useCallback((path: string) => {
    if (location.pathname === path) {
        if (isNavOpen) setIsNavOpen(false);
        return;
    }
    
    if (isNavOpen) {
        setIsNavOpen(false);
        setTimeout(() => {
             setIsFading(true);
             setTimeout(() => navigate(path), 600);
        }, 300);
    } else {
        setIsFading(true);
        setTimeout(() => navigate(path), 600);
    }

  }, [navigate, isNavOpen, location.pathname]);
  
  // Fix: Implement functions to save and reset About Me content
  const saveAboutMeContent = useCallback(() => {
    try {
      localStorage.setItem(ABOUT_ME_STORAGE_KEY, JSON.stringify(aboutMeContent));
      alert('Content saved!');
    } catch (error) {
      console.error('Error saving aboutMeContent to localStorage', error);
      alert('Failed to save content.');
    }
  }, [aboutMeContent]);

  const resetAboutMeContent = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the content to its default state?')) {
      setAboutMeContent(initialAboutMeContent);
      localStorage.removeItem(ABOUT_ME_STORAGE_KEY);
      alert('Content has been reset.');
    }
  }, []);

  const value = { 
    navigateWithTransition, 
    isFading,
    isNavOpen,
    toggleNav,
    showNavToggle,
    setShowNavToggle,
    // Fix: Provide new state and functions through the context
    aboutMeContent,
    setAboutMeContent,
    saveAboutMeContent,
    resetAboutMeContent,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};