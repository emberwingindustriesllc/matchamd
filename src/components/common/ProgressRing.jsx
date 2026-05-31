import React from 'react';

export default function ProgressRing({ progress = 0, size = 120, strokeWidth = 8, className = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Dynamically calculate font sizes based on circle size
  const numberClass = size < 90 ? 'text-base font-extrabold' : 'text-2xl font-black';
  const pctClass = size < 90 ? 'text-[8px] font-bold' : 'text-xs font-extrabold';
  const labelClass = 'text-[8px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-0.5';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90 filter drop-shadow-[0_2px_6px_rgba(var(--color-primary),0.15)] dark:drop-shadow-[0_2px_8px_rgba(var(--color-primary),0.3)]"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="url(#progressGradient)"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--color-primary))" />
            <stop offset="100%" stopColor="#85a31a" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Inner Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
        <span className={`text-slate-800 dark:text-white flex items-baseline tracking-tighter ${numberClass}`}>
          {Math.round(progress)}
          <span className={`opacity-80 ml-0.5 ${pctClass}`}>%</span>
        </span>
        {size >= 100 && (
          <span className={labelClass}>
            Match
          </span>
        )}
      </div>
    </div>
  );
}