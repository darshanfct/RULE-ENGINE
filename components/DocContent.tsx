import React, { useEffect, useState, useMemo, useRef } from 'react';
import { HomeIcon } from './Icons';
import { NavItem, TocItem } from '../types';

declare global {
  interface Window {
    marked: {
      parse: (text: string) => string;
    };
  }
}

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

interface DocContentProps {
  currentView: string;
  currentVersion: string;
  navTree: Record<string, NavItem[]>;
  onNavigate: (id: string) => void;
  onUpdateToc: (items: TocItem[]) => void;
}

const DocContent: React.FC<DocContentProps> = ({ currentView, currentVersion, navTree, onNavigate, onUpdateToc }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [debugStrategies, setDebugStrategies] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeItem = useMemo(() => {
    const items = navTree[currentVersion] || [];
    return findItemById(items, currentView);
  }, [currentView, currentVersion, navTree]);

  // Fetching Logic
  useEffect(() => {
    if (!activeItem) return;

    const fetchContent = async () => {
      setIsLoading(true);
      setError(false);
      setContent('');
      setDebugStrategies([]);
      onUpdateToc([]); // Clear TOC while loading
      
      const cleanPath = activeItem.path.replace(/^\/+/, '');
      // Path already includes project/version from server (e.g. RULE-ENGINE/latest/...)
      const versionedPath = cleanPath;

      const strategies = [
        `/docs/${versionedPath}`,
        `docs/${versionedPath}`,
        `/public/docs/${versionedPath}`,
        `public/docs/${versionedPath}`,
        `../docs/${versionedPath}`,
        `../public/docs/${versionedPath}`
      ];

      for (const path of strategies) {
        try {
          let response = await fetch(path);
          if (!response.ok) {
             response = await fetch(`${path}?t=${Date.now()}`);
          }

          if (response.ok) {
            const text = await response.text();
            
            if (text.trim().toLowerCase().startsWith('<!doctype html') || text.trim().toLowerCase().startsWith('<html')) {
               continue;
            }

            if (window.marked) {
              const rawHtml = window.marked.parse(text);

              // Process HTML to inject IDs and classes BEFORE render
              // This ensures IDs persist through React re-renders and are available immediately
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = rawHtml;

              const headings = tempDiv.querySelectorAll('h1, h2, h3');
              const newToc: TocItem[] = [];
              const idCounts: Record<string, number> = {};

              headings.forEach((heading, index) => {
                const textContent = heading.textContent || '';
                // Create a URL-friendly ID
                let baseId = textContent
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '');
                
                if (!baseId) baseId = `section-${index}`;
                
                let uniqueId = baseId;
                if (baseId in idCounts) {
                  idCounts[baseId]++;
                  uniqueId = `${baseId}-${idCounts[baseId]}`;
                } else {
                  idCounts[baseId] = 0;
                }

                // Inject ID and scroll-margin
                heading.id = uniqueId;
                // Add scroll-margin-top to account for fixed header (h-16 = 64px, so 112px is safe)
                heading.classList.add('scroll-mt-28');

                newToc.push({
                  id: uniqueId,
                  label: textContent,
                  level: parseInt(heading.tagName.substring(1)),
                  active: false
                });
              });

              setContent(tempDiv.innerHTML);
              onUpdateToc(newToc);
            } else {
              setContent(text);
            }
            setIsLoading(false);
            return;
          }
        } catch (err) {
          // ignore
        }
      }

      console.error(`Failed to load doc for ${activeItem.id}. Paths tried:`, strategies);
      setDebugStrategies(strategies);
      setError(true);
      setIsLoading(false);
    };

    fetchContent();
  }, [activeItem, currentVersion, onUpdateToc]);

  return (
    <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 xl:pr-72">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-400 mb-6">
          <a 
            href="#" 
            onClick={(e) => { 
                e.preventDefault(); 
                const items = navTree[currentVersion] || [];
                if (items.length > 0) {
                    onNavigate(items[0].id); 
                }
            }} 
            className="hover:text-[#0078e7] transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-300 capitalize">{currentVersion}</span>
          <span className="mx-2">/</span>
          {/* Find parent project if possible, or just show active item label */}
          <span className="text-[#0078e7]">{activeItem?.label || '...'}</span>
        </nav>

        {/* Title Banner */}
        <div className="bg-gradient-to-r from-[#0078e7] to-[#2d9bf0] rounded-lg p-6 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-light tracking-wide">{activeItem?.label || 'Loading...'}</h1>
        </div>

        {/* Content Body */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0078e7]"></div>
            </div>
          ) : error ? (
            <div className="py-10 text-gray-500 italic border-l-4 border-gray-700 pl-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Documentation Not Found</h3>
              <p className="mb-4">Could not load the documentation file.</p>
              
              <div className="text-xs font-mono bg-gray-800 p-4 rounded text-gray-400 overflow-x-auto">
                <p className="mb-2 text-white">Target ID: {activeItem?.id}</p>
                <p className="mb-2">We tried to fetch the following paths:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {debugStrategies.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div 
              ref={contentRef}
              className="prose prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: content }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'A') {
                  const href = (target as HTMLAnchorElement).getAttribute('href');
                  if (href && !href.startsWith('http') && !href.startsWith('#')) {
                     e.preventDefault();
                     const parts = href.split('/');
                     const lastPart = parts[parts.length - 1];
                     const id = lastPart.replace('.md', '').replace(/^\d+\./, ''); 
                     onNavigate(id);
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default DocContent;