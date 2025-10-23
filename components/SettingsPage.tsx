import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { useAppContext } from '../context/AppContext';
import { saveMemories } from '../services/memoryService';

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-soft mb-8 animate-fadeIn">
        <h2 className="text-2xl font-bold font-hero-serif text-gray-800 mb-4 border-b pb-2">{title}</h2>
        <div>{children}</div>
    </div>
);

const SettingsPage: React.FC = () => {
  const { setShowNavToggle, navigateWithTransition } = useAppContext();
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setShowNavToggle(true);
  }, [setShowNavToggle]);

  const handleResetMemories = async () => {
    if (window.confirm("Are you sure you want to permanently delete ALL memories? This action cannot be undone.")) {
      setIsResetting(true);
      try {
        // Step 1: Overwrite the cloud data with an empty array.
        // This permanently removes all post objects, which include the message, author name, and photo.
        await saveMemories([]);

        // Step 2: Explicitly clear local cache and signal a reset via sessionStorage.
        // This prevents a race condition where the memories page might load old, cached
        // data before the cloud update is fully propagated.
        localStorage.setItem('memoriesCache', '[]');
        sessionStorage.setItem('memoriesReset', 'true');
        
        alert("All memories have been successfully cleared. Redirecting to the Memory Wall...");
        
        // Step 3: Navigate back to the memory wall to show the result of the empty wall.
        navigateWithTransition('/memories');
      } catch (error) {
        console.error("Failed to reset memories:", error);
        alert("Could not clear memories from the server. Please try again.");
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        <section className="text-left max-w-4xl mx-auto w-full">
          <div className="animate-fadeIn mb-12">
            <h1 className="font-accent text-4xl sm:text-5xl text-gray-800 text-center">Settings</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mt-2">
              Customize your experience.
            </p>
          </div>
          
          <SettingsSection title="Home Page Settings">
            <p className="text-gray-500">No settings available for this page yet.</p>
          </SettingsSection>

          <SettingsSection title="Memory Lane Settings">
            <div>
              <p className="text-gray-600 mb-4">
                This will permanently delete all memories from the Memory Wall for everyone. This action cannot be undone.
              </p>
              <button
                onClick={handleResetMemories}
                disabled={isResetting}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Resetting...' : 'Reset All Memories'}
              </button>
            </div>
          </SettingsSection>

          <SettingsSection title="Terminal Settings">
             <p className="text-gray-500">No settings available for this page yet.</p>
          </SettingsSection>
        </section>
      </div>
    </Layout>
  );
};

export default SettingsPage;