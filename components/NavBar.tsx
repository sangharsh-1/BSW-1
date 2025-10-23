import React from 'react';
import { useAppContext } from '../context/AppContext';

interface NavItemProps {
  icon: string;
  label: string;
  path: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path }) => {
  const { navigateWithTransition } = useAppContext();
  return (
    <button
      onClick={() => navigateWithTransition(path)}
      className="w-full flex items-center p-3 text-left text-gray-700 rounded-lg hover:bg-gray-200/50 transition-colors duration-200"
    >
      <span className="text-xl mr-4">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};


const NavBar: React.FC = () => {
    const { isNavOpen, toggleNav } = useAppContext();

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleNav}
            />

            {/* Sidebar */}
            <nav className={`fixed top-0 left-0 h-full w-72 bg-white/70 backdrop-blur-xl shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-5">
                    {/* Profile Section */}
                    <div className="flex items-center mb-10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a1a5ff] to-[#dbe7ff] flex items-center justify-center text-white font-bold text-xl shadow-inner">
                            K
                        </div>
                        <div className="ml-4">
                            <p className="font-semibold text-gray-800">Kirti's</p>
                            <p className="text-sm text-gray-600">Digital World</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-2">
                        <NavItem icon="🏠" label="Home" path="/" />
                        <NavItem icon="📸" label="Memory Wall" path="/memories" />
                        <NavItem icon="⚙️" label="Settings" path="/settings" />
                    </div>
                </div>

                <div className="absolute bottom-5 left-5 text-xs text-gray-500">
                    <p>A Birthday Surprise</p>
                </div>
            </nav>
        </>
    );
};

export default NavBar;