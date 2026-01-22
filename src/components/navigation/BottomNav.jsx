import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, User, Bell } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/i18n/LanguageContext';

const navItemsConfig = [
  { icon: Home, key: 'home', page: 'Dashboard' },
  { icon: BookOpen, key: 'guides', page: 'Guides' },
  { icon: Users, key: 'community', page: 'Community' },
  { icon: Bell, key: 'alerts', page: 'Notifications' },
  { icon: User, key: 'profile', page: 'Profile' }
];

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItemsConfig.map((item) => {
          const label = t(`nav.${item.key}`);
          const url = createPageUrl(item.page);
          const isActive = location.pathname === url || 
                          (item.page === 'Dashboard' && location.pathname === '/');
          
          return (
            <Link
              key={item.page}
              to={url}
              className={cn(
                'relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-colors',
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn('w-5 h-5 relative z-10', isActive && 'stroke-[2.5px]')} />
              <span className={cn('text-[10px] mt-1 relative z-10 font-medium', isActive && 'font-semibold')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}