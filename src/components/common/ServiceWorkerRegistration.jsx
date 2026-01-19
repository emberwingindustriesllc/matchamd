import { useEffect } from 'react';
import { toast } from 'sonner';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                toast.info('New version available!', {
                  description: 'Refresh to get the latest updates',
                  action: {
                    label: 'Refresh',
                    onClick: () => window.location.reload()
                  },
                  duration: 10000
                });
              }
            });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle connection status
      const updateOnlineStatus = () => {
        if (navigator.onLine) {
          toast.success('Back online!', {
            description: 'Your connection has been restored'
          });
        } else {
          toast.warning('You are offline', {
            description: 'Some features may be limited'
          });
        }
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }
  }, []);

  return null;
}