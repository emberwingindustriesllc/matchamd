import React from 'react';
import { Moon, Sun, Search, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Header({ 
  title, 
  logo = null,
  showBack = false, 
  showSearch = false, 
  onSearch = () => {},
  rightContent = null 
}) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isScamShield = location.pathname.toLowerCase().includes('scamshield') || location.pathname.toLowerCase().includes('scam-shield');

  return (
    <header
      className="sticky top-0 z-40 bg-white/85 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 safe-area-top pt-safe"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between h-16 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl shrink-0 hover:bg-emerald-500/10 hover:text-[#10B981]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {logo ? (
            <div className="h-8 w-auto flex items-center gap-2">
              <img src={logo} alt="MatchaMD Logo" className="h-full object-contain" />
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Matcha<span className="text-[#10B981] dark:text-[#4ADE80]">MD</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg select-none" aria-hidden="true">🍵</span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {title === 'MatchaMD' ? (
                  <>Matcha<span className="text-[#10B981] dark:text-[#4ADE80]">MD</span></>
                ) : (
                  title
                )}
              </h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isScamShield && (
            <button
              type="button"
              onClick={() => navigate(createPageUrl('ScamShield'))}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/25 hover:bg-[#F43F5E]/20 transition-all"
              title="Open Scam Shield & USCE Truth Radar"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Scam Shield</span>
            </button>
          )}

          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearch}
              className="rounded-xl hover:bg-emerald-500/10 hover:text-[#10B981]"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-xl hover:bg-emerald-500/10 hover:text-[#10B981] dark:text-slate-200"
          >
            {isDark ? <Sun className="w-5 h-5 text-[#4ADE80]" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </Button>

          {rightContent}
        </div>
      </div>
    </header>
  );
}