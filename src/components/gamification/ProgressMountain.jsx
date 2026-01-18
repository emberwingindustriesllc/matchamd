import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flag } from 'lucide-react';

export default function ProgressMountain({ completedCount, totalCount }) {
  const percentage = (completedCount / totalCount) * 100;
  const segments = 5;
  const completedSegments = Math.floor((completedCount / totalCount) * segments);

  return (
    <div className="relative w-full h-64 flex items-end justify-center">
      {/* Mountain SVG */}
      <svg viewBox="0 0 300 200" className="w-full h-full">
        {/* Base Mountain - Gray */}
        <path
          d="M 0 200 L 75 100 L 150 50 L 225 100 L 300 200 Z"
          fill="#e2e8f0"
          className="dark:fill-slate-700"
        />

        {/* Progress Mountain - Gradient */}
        <defs>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <clipPath id="progressClip">
            <rect x="0" y={200 - (200 * percentage / 100)} width="300" height={200 * percentage / 100} />
          </clipPath>
        </defs>
        <path
          d="M 0 200 L 75 100 L 150 50 L 225 100 L 300 200 Z"
          fill="url(#mountainGradient)"
          clipPath="url(#progressClip)"
        />

        {/* Checkpoint Flags */}
        {[...Array(segments + 1)].map((_, idx) => {
          const y = 200 - (idx * 37.5);
          const isReached = idx <= completedSegments;
          return (
            <g key={idx}>
              <motion.circle
                cx="150"
                cy={y}
                r="6"
                fill={isReached ? '#10b981' : '#cbd5e1'}
                initial={{ scale: 0 }}
                animate={{ scale: isReached ? 1 : 0.6 }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
              />
              {idx === segments && (
                <motion.g
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ 
                    scale: isReached ? 1 : 0.6,
                    rotate: 0
                  }}
                  transition={{ delay: 0.5, type: 'spring', bounce: 0.6 }}
                >
                  <Flag
                    x="143"
                    y="30"
                    className={`w-5 h-5 ${isReached ? 'text-amber-500' : 'text-slate-400'}`}
                  />
                </motion.g>
              )}
            </g>
          );
        })}

        {/* Climber */}
        <motion.g
          initial={{ y: 200 }}
          animate={{ y: 200 - (200 * percentage / 100) }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <circle cx="150" cy="0" r="8" fill="#6366f1" />
          <path d="M 150 8 L 150 24" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
          <path d="M 150 14 L 144 20" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
          <path d="M 150 14 L 156 20" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
          <path d="M 150 24 L 144 34" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
          <path d="M 150 24 L 156 34" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
      </svg>

      {/* Stats */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center px-4 pb-2">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {completedCount}/{totalCount} completed
        </div>
        {percentage === 100 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            className="flex items-center gap-1 text-amber-600 dark:text-amber-500"
          >
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold">Summit!</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}