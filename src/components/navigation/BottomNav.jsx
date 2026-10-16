import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, User, ShieldAlert, Building2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/i18n/LanguageContext';

const navItemsConfig = [
  { icon: Home, key: 'home', fallbackLabel: 'Home', page: 'Dashboard' },
  { icon: Building2, key: 'programs', fallbackLabel: 'Programs', page: 'IMGPrograms' },
  { icon: ShieldAlert, key: 'scamShield', fallbackLabel: 'Scam Shield', page: 'ScamShield', isShield: true },
  { icon: BookOpen, key: 'guides', fallbackLabel: 'Guides', page: 'Guides' },
  { icon: Users, key: 'community', fallbackLabel: 'Community', page: 'Community' },
  { icon: User, key: 'profile', fallbackLabel: 'Profile', page: 'Profile' }
];

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/90 safe-area-bottom pb-safe"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-1.5">
        {navItemsConfig.map((item) => {
          const translated = t(`nav.${item.key}`);
          const label = translated && !translated.startsWith('nav.') ? translated : item.fallbackLabel;
          const url = createPageUrl(item.page);
          const isActive =
            location.pathname.toLowerCase() === url.toLowerCase() ||
            (item.page === 'Dashboard' && location.pathname === '/');
          
          return (
            <Link
              key={item.page}
              to={url}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 max-w-[76px] h-14 rounded-2xl transition-colors',
                isActive 
                  ? item.isShield
                    ? 'text-[#F43F5E] dark:text-[#FB7185]'
                    : 'text-[#10B981] dark:text-[#4ADE80]' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className={cn(
                    'absolute inset-0 rounded-2xl border',
                    item.isShield
                      ? 'bg-[#F43F5E]/10 dark:bg-[#F43F5E]/20 border-[#F43F5E]/30'
                      : 'bg-[#10B981]/10 dark:bg-[#10B981]/20 border-[#10B981]/30'
                  )}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn('w-5 h-5 relative z-10', isActive && 'stroke-[2.5px]')} />
              <span className={cn('text-[10px] mt-1 relative z-10 font-medium truncate max-w-full px-1', isActive && 'font-bold')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}