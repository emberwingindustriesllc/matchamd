import React from 'react';
import { Moon, Sun, Search, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 safe-area-top">
      <div className="flex items-center justify-between h-16 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {logo ? (
            <div className="h-8 w-auto flex items-center">
              <img src={logo} alt="Logo" className="h-full object-contain" />
            </div>
          ) : (
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearch}
              className="rounded-xl"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {rightContent}
        </div>
      </div>
    </header>
  );
}