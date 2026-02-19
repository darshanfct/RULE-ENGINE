import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import DocContent from './components/DocContent';
import { TocItem, NavItem } from './types';

// Simple helper to find item in tree
const findItemById = (items: NavItem[], id: string): NavItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);
  const [navTree, setNavTree] = useState<Record<string, NavItem[]>>({});
  const [currentVersion, setCurrentVersion] = useState('');
  const [currentView, setCurrentView] = useState('');
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch docs structure
  useEffect(() => {
    // Fetch static JSON instead of API
    fetch('navTree.json')
      .then(res => res.json())
      .then(data => {
        setVersions(data.versions);
        setNavTree(data.navTree);

        // Handle initial load / hash
        const hash = window.location.hash.slice(1); // remove #
        let foundVersion = '';
        let foundView = '';

        if (hash) {
          // Find version for this ID
          for (const v of data.versions) {
            const items = data.navTree[v];
            if (findItemById(items, hash)) {
              foundVersion = v;
              foundView = hash;
              break;
            }
          }
        }

        if (foundVersion && foundView) {
          setCurrentVersion(foundVersion);
          setCurrentView(foundView);
        } else if (data.versions.length > 0) {
          setCurrentVersion(data.versions[0]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch docs structure:", err);
        setIsLoading(false);
      });
  }, []);

  // Sync state to hash
  useEffect(() => {
    if (currentView) {
      window.location.hash = currentView;
    }
  }, [currentView]);

  // Handle hash changes (back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && hash !== currentView) {
        // Find version for this ID
        for (const v of versions) {
          const items = navTree[v];
          if (items && findItemById(items, hash)) {
            if (v !== currentVersion) setCurrentVersion(v);
            setCurrentView(hash);
            break;
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [versions, navTree, currentView, currentVersion]);


  // Ensure currentView exists in the new version when switching
  useEffect(() => {
    if (!currentVersion || !navTree[currentVersion]) return;

    // Check if currentView is still valid in this version (unlikely if we switched versions manually, 
    // likely we want to reset or keep if ID exists)
    // If we switched version via UI, we usually want to go to root of that version or similar page.
    // But here, if we change version, we might want to check if the ID exists (e.g. same page different version).

    // Logic: if currentView is NOT in new version, go to first item.
    const navItems = navTree[currentVersion];
    const item = findItemById(navItems, currentView);

    if (!item && navItems && navItems.length > 0) {
      setCurrentView(navItems[0].id);
    }
  }, [currentVersion, navTree]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#25282e] flex items-center justify-center text-white">Loading documentation...</div>;
  }

  return (
    <div className="min-h-screen bg-[#25282e] flex flex-col font-sans">
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        currentVersion={currentVersion}
        versions={versions}
        onVersionChange={setCurrentVersion}
      />

      <div className="flex flex-1 pt-16 relative">
        {/* Left Sidebar */}
        <div className="w-0 lg:w-72 flex-shrink-0">
          <LeftSidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            currentView={currentView}
            currentVersion={currentVersion}
            navTree={navTree}
            onNavigate={(id) => {
              setCurrentView(id);
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          />
        </div>

        {/* Main Content Area */}
        <DocContent
          currentView={currentView}
          currentVersion={currentVersion}
          navTree={navTree}
          onNavigate={setCurrentView}
          onUpdateToc={setTocItems}
        />

        {/* Right Sidebar */}
        <div className="hidden xl:block w-64 flex-shrink-0 z-10">
          <RightSidebar items={tocItems} />
        </div>
      </div>
    </div>
  );
};

export default App;