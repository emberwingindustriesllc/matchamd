import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration';

export default function Layout({ children, currentPageName }) {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <LanguageProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <ServiceWorkerRegistration />
            <OfflineIndicator />
            <DisclaimerBanner />
          <style>{`
          :root {
            --color-primary: 103 45% 21%; /* Deep Matcha */
            --color-secondary: 79 47% 51%; /* Logo Green */
            --color-accent: 180 36% 74%; /* Mint MD+ */
          }
          
          .dark {
            color-scheme: dark;
          }
          
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 0);
          }
          
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 0);
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
            50% { transform: translateY(-10px); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          /* Gradient text */
          .gradient-text {
            background: linear-gradient(135deg, hsl(103 45% 21%) 0%, hsl(79 47% 51%) 50%, hsl(180 36% 74%) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Glass effect */
          .glass {
            background: rgba(var(--color-secondary), 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(var(--color-primary), 0.2);
          }
          
          /* Smooth page transitions */
          main {
            animation: fadeIn 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          {children}
        </div>
        </ErrorBoundary>
        </ThemeProvider>
        </LanguageProvider>
        </QueryClientProvider>
        );
        }