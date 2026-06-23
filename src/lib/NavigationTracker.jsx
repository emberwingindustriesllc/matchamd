import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { pagesConfig } from '@/pages.config';

/**
 * NavigationTracker - Tracks page views for analytics
 * Can be extended to send to Supabase, analytics providers, etc.
 */
export default function NavigationTracker() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { Pages, mainPage } = pagesConfig;
  const mainPageKey = mainPage ?? Object.keys(Pages)[0];

  useEffect(() => {
    // Extract page name from pathname
    const pathname = location.pathname;
    let pageName;

    if (pathname === '/' || pathname === '') {
      pageName = mainPageKey;
    } else {
      // Remove leading slash and get the first segment
      const pathSegment = pathname.replace(/^\//, '').split('/')[0];

      // Try case-insensitive lookup in Pages config
      const pageKeys = Object.keys(Pages);
      const matchedKey = pageKeys.find(
        key => key.toLowerCase() === pathSegment.toLowerCase()
      );

      pageName = matchedKey || pathSegment;
    }

    // Track page view (only for authenticated users)
    if (isAuthenticated && pageName && user) {
      trackPageView(pageName, user.id);
    }
  }, [location, isAuthenticated, Pages, mainPageKey, user]);

  return null;
}

/**
 * Track a page view event
 * @param {string} pageName - The page identifier
 * @param {string} userId - The authenticated user ID
 */
async function trackPageView(pageName, userId) {
  try {
    // Option 1: Local storage for client-side analytics
    const pageViews = JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
    pageViews.push({
      page: pageName,
      timestamp: new Date().toISOString(),
      userId,
    });
    // Keep last 100 page views
    if (pageViews.length > 100) pageViews.shift();
    localStorage.setItem('matchamd_page_views', JSON.stringify(pageViews));

    // Option 2: Send to Supabase (uncomment when table exists)
    // const { supabase } = await import('@/api/supabaseClient');
    // await supabase.from('page_views').insert({
    //   user_id: userId,
    //   page_name: pageName,
    //   viewed_at: new Date().toISOString(),
    // });

    // Option 3: Send to external analytics (GA, Mixpanel, etc.)
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', 'page_view', { page_title: pageName });
    // }

    console.debug('[NavigationTracker] Page view:', pageName);
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.warn('[NavigationTracker] Failed to track page view:', error);
  }
}

/**
 * Get stored page views for debugging
 */
export function getPageViews() {
  return JSON.parse(localStorage.getItem('matchamd_page_views') || '[]');
}

/**
 * Clear stored page views
 */
export function clearPageViews() {
  localStorage.removeItem('matchamd_page_views');
}