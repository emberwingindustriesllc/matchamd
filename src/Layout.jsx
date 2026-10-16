import React from 'react';
import { useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration';

export default function Layout({ children, currentPageName }) {
  // Key the boundary on the route so a crash on one page does not latch the
  // error screen for every later navigation.
  const { pathname } = useLocation();
  return (
    <QueryClientProvider client={queryClientInstance}>
      <LanguageProvider>
        <ThemeProvider>
          <ErrorBoundary resetKey={pathname}>
            <ServiceWorkerRegistration />
            <OfflineIndicator />
            <DisclaimerBanner />
          <style>{`
          :root {
            --color-primary: 16 185 129; /* #10B981 Electric Matcha */
            --color-secondary: 74 222 128; /* #4ADE80 Matcha Neon */
            --color-accent: 74 222 128; /* #4ADE80 Matcha Neon */
            --color-coral: 244 63 94; /* #F43F5E Coral Red */
            --color-amber: 245 158 11; /* #F59E0B Warm Amber */
          }
          
          .dark {
            color-scheme: dark;
          }
          
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .safe-area-top, .pt-safe {
            padding-top: env(safe-area-inset-top, 0px);
          }
          
          .safe-area-bottom, .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          /* Custom animations */
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          /* Gradient text */
          .gradient-text {
            background: linear-gradient(135deg, #10B981 0%, #4ADE80 50%, #34D399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Glass effect */
          .glass {
            background: rgba(30, 41, 59, 0.78);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(74, 222, 128, 0.22);
          }
          
          /* Smooth page transitions */
          main {
            animation: fadeIn 0.25s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
          {children}
        </div>
        </ErrorBoundary>
        </ThemeProvider>
        </LanguageProvider>
        </QueryClientProvider>
  );
}