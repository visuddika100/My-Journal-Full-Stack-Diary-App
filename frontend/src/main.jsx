import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#fffdf7',
            color: '#1a1208',
            border: '1px solid #e8d8c0',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#3a8c7a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e04a4a', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)