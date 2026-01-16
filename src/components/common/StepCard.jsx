import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StepCard({ 
  step, 
  title, 
  description, 
  status = 'not_started', 
  onClick,
  deadline,
  isLocked = false 
}) {
  const statusConfig = {
    completed: { 
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <Check className="w-5 h-5 text-emerald-600" />,
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
    },
    in_progress: {
      bg: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />,
      badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
    },
    not_started: {
      bg: 'bg-white dark:bg-slate-800/50',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />,
      badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.01 }}
      whileTap={{ scale: isLocked ? 1 : 0.99 }}
      onClick={isLocked ? undefined : onClick}
      className={cn(
        'relative p-5 rounded-2xl border-2 transition-all',
        config.bg,
        config.border,
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
          {isLocked ? <Lock className="w-4 h-4 text-slate-400" /> : step}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-800 dark:text-white truncate">{title}</h3>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.badge)}>
              {status === 'completed' ? 'Complete' : status === 'in_progress' ? 'In Progress' : 'To Do'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{description}</p>
          
          {deadline && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Deadline: {deadline}</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {config.icon}
          {!isLocked && <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>
      </div>
    </motion.div>
  );
}