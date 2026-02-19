import React, { useState, useEffect } from 'react';
import { SearchIcon, ChevronDownIcon } from './Icons';
import { NavItem } from '../types';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  currentVersion: string;
  navTree: Record<string, NavItem[]>;
  onNavigate: (id: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onClose, currentView, currentVersion, navTree, onNavigate }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const navItems = navTree[currentVersion] || [];

  // Auto-expand the parent of current view on load or view change
  useEffect(() => {
    navItems.forEach(item => {
      if (item.children && item.children.some(child => child.id === currentView)) {
        setExpandedItems(prev => new Set(prev).add(item.id));
      }
    });
  }, [currentView, navItems]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = item.id === currentView;
    const isParentOfActive = item.children?.some(c => c.id === currentView);
    
    // Style classes based on depth and state
    // Use fixed padding for content, indentation is handled by the nested ul
    const contentPadding = 'px-4 pl-3'; 
    
    // Parent Active State
    const activeParentClass = (hasChildren && (isActive || isExpanded || isParentOfActive)) 
      ? 'bg-[#0078e7] text-white' 
      : 'text-gray-300 hover:text-white hover:bg-[#2c3038]';
      
    // Child Active State
    const activeChildClass = (!hasChildren && isActive)
      ? 'text-[#0078e7] font-medium'
      : 'text-gray-400 hover:text-gray-200';

    const baseClass = hasChildren ? activeParentClass : activeChildClass;

    return (
      <li key={item.id}>
        <div 
          className={`
            group flex items-center justify-between py-2 text-[14px] leading-6 cursor-pointer transition-colors relative
            ${baseClass} ${contentPadding}
            ${depth > 0 && isActive ? 'border-r-2 border-[#0078e7]' : ''}
          `}
          onClick={(e) => {
            // If it has children, user might want to navigate to index OR toggle.
            // Requirement says "all folders have one documents... which represents that folders main md file"
            // So we navigate AND toggle if it's not open.
            if (hasChildren) {
              if (!isExpanded) toggleExpand(item.id, e);
              onNavigate(item.id);
            } else {
              onNavigate(item.id);
            }
          }}
        >
          {/* Horizontal connector for tree view (only for children) */}
          {depth > 0 && (
            <div className="absolute left-0 top-1/2 w-3 h-px bg-gray-700 -translate-y-1/2"></div>
          )}
          
          <span className="break-words whitespace-normal pr-6">{item.label}</span>
          
          {hasChildren && (
            <span 
              className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} p-1 absolute right-2 top-2`}
              onClick={(e) => toggleExpand(item.id, e)} // Separate click for arrow to just toggle
            >
               <ChevronDownIcon className="w-4 h-4 opacity-70" />
            </span>
          )}
        </div>

        {/* Recursive Children Rendering */}
        {hasChildren && isExpanded && (
          <ul className="ml-5 border-l border-gray-700">
            {item.children!.map(child => renderNavItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-16 bottom-0 left-0 w-72 bg-[#1f2227] border-r border-gray-800 overflow-y-auto z-40 transition-transform duration-300 ease-in-out scrollbar-thin scrollbar-thumb-gray-600
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 sticky top-0 bg-[#1f2227] z-10 border-b border-gray-800">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-white text-gray-900 rounded pl-3 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078e7]"
            />
            <SearchIcon className="absolute right-3 top-2 w-4 h-4 text-[#0078e7]" />
          </div>
        </div>

        <nav className="py-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => renderNavItem(item))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default LeftSidebar;