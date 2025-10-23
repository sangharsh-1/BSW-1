import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import MemoriesPage from './components/MemoriesPage';
import TerminalPage from './components/TerminalPage';
import FinalVideoPage from './components/FinalVideoPage';
import SettingsPage from './components/SettingsPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/final-video" element={<FinalVideoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppProvider>
    </HashRouter>
  );
};

export default App;