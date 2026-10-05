import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Automatically forward legacy Vercel URLs to the official domain while preserving tokens and parameters
if (typeof window !== 'undefined' && window.location.hostname.includes('paulfinchpediatrics')) {
  window.location.replace(`https://matchamd.com${window.location.pathname}${window.location.search}${window.location.hash}`);
}

// A new deploy changes every hashed chunk filename. A tab still running the
// previous build will fail to fetch a page chunk on navigation, which surfaces
// as a dead "Something went wrong" screen. Vite raises `vite:preloadError` for
// exactly this; a single reload picks up the new build.
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    if (sessionStorage.getItem('matchamd:chunk-reload')) return;
    sessionStorage.setItem('matchamd:chunk-reload', '1');
    event.preventDefault();
    window.location.reload();
  });
  // Clear the guard once the app is actually running on the fresh build.
  window.addEventListener('load', () => {
    sessionStorage.removeItem('matchamd:chunk-reload');
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
