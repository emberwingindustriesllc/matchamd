import React from 'react';
import { Award, Star, Target, Zap, Trophy, Shield, BookOpen, Users } from 'lucide-react';

const badgeConfig = {
  'ecfmg_certified': { icon: Shield, color: 'from-emerald-500 to-teal-500', label: 'ECFMG Certified' },
  'step1_passed': { icon: Target, color: 'from-blue-500 to-indigo-500', label: 'Step 1 Passed' },
  'step2_passed': { icon: Target, color: 'from-purple-500 to-pink-500', label: 'Step 2 Passed' },
  'matched': { icon: Trophy, color: 'from-amber-500 to-orange-500', label: 'Matched!' },
  'mentor': { icon: Users, color: 'from-rose-500 to-pink-500', label: 'Verified Mentor' },
  'contributor': { icon: Star, color: 'from-cyan-500 to-blue-500', label: 'Top Contributor' },
  'first_post': { icon: BookOpen, color: 'from-green-500 to-emerald-500', label: 'First Post' },
  'streak_7': { icon: Zap, color: 'from-yellow-500 to-amber-500', label: '7-Day Streak' },
  'default': { icon: Award, color: 'from-slate-500 to-slate-600', label: 'Achievement' }
};

export default function BadgeIcon({ type, size = 'md', showLabel = false }) {
  const config = badgeConfig[type] || badgeConfig.default;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
        <Icon className={`${iconSizes[size]} text-white`} />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
          {config.label}
        </span>
      )}
    </div>
  );
}