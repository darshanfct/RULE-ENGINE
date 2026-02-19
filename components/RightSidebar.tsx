import React, { useState, useEffect } from 'react';
import { TocItem } from '../types';

interface RightSidebarProps {
  items: TocItem[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ items }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Determine which section is currently active based on scroll position
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        // Adjust rootMargin to trigger activity when the element is near the top of the viewport
        // -100px from top accounts for header
        rootMargin: '-100px 0px -60% 0px' 
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // scrollIntoView with behavior: 'smooth' works reliably with the scroll-margin-top 
      // set on the target elements in DocContent.
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Update URL hash without jumping
      history.pushState(null, '', `#${id}`);
      
      // Manually set active ID immediately for feedback
      setActiveId(id);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block fixed top-16 bottom-0 right-0 w-64 p-6 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 tracking-wide uppercase">On this page</h3>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-700"></div>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="relative pl-4">
               {/* Active indicator bar */}
               {activeId === item.id && (
                 <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-[#0078e7] -ml-[1px]"></div>
               )}
              <a 
                href={`#${item.id}`}
                onClick={(e) => handleScrollTo(e, item.id)}
                className={`
                  block text-[13px] leading-5 transition-colors duration-200 cursor-pointer
                  ${activeId === item.id ? 'text-[#0078e7] font-medium' : 'text-gray-400 hover:text-gray-200'}
                  ${item.level > 2 ? 'pl-3' : ''}
                `}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-800">
         <button className="flex items-center gap-2 text-[#0078e7] text-sm hover:underline">
            <span className="bg-[#0078e7] text-white p-1 rounded">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </span>
            Contact us
         </button>
      </div>
    </aside>
  );
};

export default RightSidebar;