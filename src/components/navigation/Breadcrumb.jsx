import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4 overflow-x-auto scrollbar-hide">
      <Link 
        to={createPageUrl('Dashboard')}
        className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 dark:text-white font-medium whitespace-nowrap">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}