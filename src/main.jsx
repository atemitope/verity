import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SharedProfile from './components/SharedProfile'
import './index.css'

// A private share link (/share/:token) is a standalone, read-only page —
// resolved here, before the normal App/state machinery ever mounts.
const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)\/?$/)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {shareMatch ? <SharedProfile token={shareMatch[1]} /> : <App />}
  </React.StrictMode>
)
