import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    const dismissed = localStorage.getItem('disclaimer_dismissed');
    return !dismissed;
  });

  const handleDismiss = () => {
    localStorage.setItem('disclaimer_dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-40 px-4"
        >
          <div className="max-w-lg mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-900 dark:text-amber-100 mb-2">
                  <strong>Informational Only:</strong> This app provides educational guidance, not medical, legal, or immigration advice.
                </p>
                <Link 
                  to={createPageUrl('Legal')}
                  className="text-xs text-amber-700 dark:text-amber-300 underline hover:no-underline"
                >
                  Read full disclaimer
                </Link>
              </div>
              <button
                onClick={handleDismiss}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}