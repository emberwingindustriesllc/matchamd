import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Flower } from 'lucide-react';

export default function ProgressTree({ completedCount, totalCount }) {
  const percentage = (completedCount / totalCount) * 100;
  
  // Generate leaves based on completion
  const maxLeaves = 12;
  const visibleLeaves = Math.floor((completedCount / totalCount) * maxLeaves);
  
  const leafPositions = [
    { x: 40, y: 30, rotate: -20 },
    { x: 60, y: 25, rotate: 10 },
    { x: 45, y: 45, rotate: -30 },
    { x: 55, y: 50, rotate: 15 },
    { x: 35, y: 60, rotate: -15 },
    { x: 65, y: 55, rotate: 20 },
    { x: 50, y: 70, rotate: 0 },
    { x: 30, y: 75, rotate: -25 },
    { x: 70, y: 70, rotate: 25 },
    { x: 45, y: 85, rotate: -10 },
    { x: 55, y: 90, rotate: 10 },
    { x: 50, y: 15, rotate: 0 }
  ];

  return (
    <div className="relative w-full h-72 flex items-end justify-center">
      <svg viewBox="0 0 100 120" className="w-full h-full">
        {/* Trunk */}
        <motion.rect
          x="45"
          y="60"
          width="10"
          height="60"
          rx="2"
          fill="#78716c"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: 'bottom' }}
          transition={{ duration: 0.5 }}
        />

        {/* Leaves */}
        {leafPositions.map((pos, idx) => (
          <motion.g
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: idx < visibleLeaves ? 1 : 0,
              opacity: idx < visibleLeaves ? 1 : 0
            }}
            transition={{ delay: idx * 0.15, type: 'spring', bounce: 0.6 }}
          >
            <circle
              cx={pos.x}
              cy={pos.y}
              r="6"
              fill="#22c55e"
              transform={`rotate(${pos.rotate} ${pos.x} ${pos.y})`}
            />
            <ellipse
              cx={pos.x}
              cy={pos.y}
              rx="4"
              ry="6"
              fill="#16a34a"
              transform={`rotate(${pos.rotate} ${pos.x} ${pos.y})`}
            />
          </motion.g>
        ))}

        {/* Flowers at completion */}
        {percentage === 100 && (
          <>
            {[{x: 50, y: 10}, {x: 40, y: 20}, {x: 60, y: 18}].map((pos, idx) => (
              <motion.g
                key={`flower-${idx}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.5 + idx * 0.1, type: 'spring', bounce: 0.6 }}
              >
                {/* Petals */}
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <ellipse
                    key={i}
                    cx={pos.x}
                    cy={pos.y}
                    rx="2.5"
                    ry="4"
                    fill="#ec4899"
                    transform={`rotate(${angle} ${pos.x} ${pos.y})`}
                  />
                ))}
                {/* Center */}
                <circle cx={pos.x} cy={pos.y} r="1.5" fill="#fbbf24" />
              </motion.g>
            ))}
          </>
        )}
      </svg>

      {/* Stats */}
      <div className="absolute bottom-0 left-0 right-0 text-center pb-2">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {visibleLeaves}/{maxLeaves} leaves grown
        </div>
        {percentage === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-pink-600 dark:text-pink-400 font-medium mt-1"
          >
            🌸 Your tree is blooming!
          </motion.div>
        )}
      </div>
    </div>
  );
}