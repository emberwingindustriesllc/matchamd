import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

export default function ProgressRocket({ completedCount, totalCount }) {
  const percentage = (completedCount / totalCount) * 100;
  const rocketY = 80 - (percentage * 0.7); // Rocket moves from bottom to top

  return (
    <div className="relative w-full h-72 bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 rounded-2xl overflow-hidden">
      {/* Stars background */}
      {[...Array(20)].map((_, idx) => (
        <motion.div
          key={idx}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Planets/Milestones */}
      {[...Array(5)].map((_, idx) => {
        const milestoneReached = (idx + 1) <= Math.floor((completedCount / totalCount) * 5);
        return (
          <motion.div
            key={idx}
            className={`absolute w-8 h-8 rounded-full ${
              milestoneReached 
                ? 'bg-gradient-to-br from-purple-400 to-pink-500' 
                : 'bg-slate-700'
            }`}
            style={{
              right: `${10 + (idx % 2) * 15}%`,
              top: `${20 + idx * 15}%`
            }}
            initial={{ scale: 0 }}
            animate={{ 
              scale: milestoneReached ? [1, 1.2, 1] : 0.8,
              rotate: milestoneReached ? 360 : 0
            }}
            transition={{
              scale: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              },
              rotate: {
                duration: 1,
                delay: idx * 0.2
              }
            }}
          >
            {milestoneReached && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Rocket */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        initial={{ y: '80%' }}
        animate={{ y: `${rocketY}%` }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
        style={{ y: `${rocketY}%` }}
      >
        <div className="relative">
          {/* Flame trail */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6"
            animate={{
              height: [20, 30, 20],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity
            }}
          >
            <div className="w-full h-full bg-gradient-to-b from-orange-500 via-red-500 to-transparent rounded-t-full blur-sm" />
          </motion.div>

          {/* Rocket body */}
          <svg width="60" height="80" viewBox="0 0 60 80" className="relative z-10">
            {/* Body */}
            <path
              d="M 30 10 L 20 60 L 20 70 L 30 75 L 40 70 L 40 60 Z"
              fill="#6366f1"
              stroke="#4f46e5"
              strokeWidth="2"
            />
            {/* Nose cone */}
            <path
              d="M 30 0 L 20 20 L 40 20 Z"
              fill="#818cf8"
            />
            {/* Window */}
            <circle cx="30" cy="30" r="8" fill="#ddd6fe" />
            <circle cx="30" cy="30" r="5" fill="#312e81" />
            {/* Fins */}
            <path d="M 20 50 L 10 70 L 20 65 Z" fill="#4f46e5" />
            <path d="M 40 50 L 50 70 L 40 65 Z" fill="#4f46e5" />
            
            {/* Sparkles when complete */}
            {percentage === 100 && (
              <>
                <motion.circle
                  cx="15"
                  cy="15"
                  r="2"
                  fill="#fbbf24"
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.circle
                  cx="45"
                  cy="20"
                  r="2"
                  fill="#fbbf24"
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
          </svg>
        </div>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-0 right-0 px-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-300">Launch Progress</span>
          <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {percentage === 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-2 text-amber-400 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Liftoff Complete!
          </motion.div>
        )}
      </div>
    </div>
  );
}