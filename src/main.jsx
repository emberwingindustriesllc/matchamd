import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Automatically forward legacy Vercel URLs to the official domain while preserving tokens and parameters
if (typeof window !== 'undefined' && window.location.hostname.includes('paulfinchpediatrics')) {
  window.location.replace(`https://matchamd.com${window.location.pathname}${window.location.search}${window.location.hash}`);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
