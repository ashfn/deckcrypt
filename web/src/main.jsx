import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <div className="h-screen bg-[#24273a">
    <StrictMode>
      <App />
    </StrictMode>
  </div>

)
