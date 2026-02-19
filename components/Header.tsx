import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SearchIcon, MenuIcon } from './Icons';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  currentVersion: string;
  versions: string[];
  onVersionChange: (v: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, currentVersion, versions, onVersionChange }) => {
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVersionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#181b1f] border-b border-gray-800 z-50 flex items-center">
      {/* Logo Section - Aligned with Sidebar */}
      <div className="flex items-center gap-4 h-full px-4 lg:px-6 lg:w-72 flex-shrink-0 lg:border-r lg:border-gray-800">
        <button className="lg:hidden text-gray-400 hover:text-white" onClick={onToggleMobileMenu}>
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          {/* LOGO IMAGE */}
          <img
            src="/fct.png"
            alt="Forensic Cybertech"
            className="h-12 w-auto object-contain"
          />
          {/* Text */}
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-white tracking-wide">FORENSIC</span>
            <span className="text-sm font-bold text-[#0078e7] tracking-wider">CYBERTECH</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex items-center h-full px-4 lg:px-6">
        <nav className="hidden lg:flex items-center h-full mr-auto">
          <a
            href="#"
            className="text-[#0078e7] border-b-[3px] border-[#0078e7] h-full flex items-center px-4 text-[15px] font-semibold tracking-wide bg-[#181b1f]"
          >
            Documentation
          </a>
        </nav>

        <div className="flex items-center gap-4 ml-auto">
          {/* Version Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsVersionOpen(!isVersionOpen)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium transition-all
                ${isVersionOpen
                  ? 'border-yellow-400 text-yellow-400 bg-gray-800'
                  : 'border-gray-600 text-gray-300 hover:border-gray-400 bg-[#25282e]'}
              `}
            >
              <span className="capitalize">{currentVersion}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {isVersionOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-[#25282e] border border-gray-600 rounded shadow-xl max-h-80 overflow-y-auto">
                {versions.map((v) => (
                  <div
                    key={v}
                    className={`px-4 py-2 cursor-pointer text-sm ${v === currentVersion ? 'text-yellow-400' : 'text-gray-300 hover:bg-[#0078e7] hover:text-white'}`}
                    onClick={() => {
                      onVersionChange(v);
                      setIsVersionOpen(false);
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Utilities */}
          <div className="hidden lg:flex items-center gap-3 text-gray-400 pl-4 border-l border-gray-700">
            <SearchIcon className="w-5 h-5 cursor-pointer hover:text-white" />
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;