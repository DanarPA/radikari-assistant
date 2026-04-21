import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 1. IMPORT GOOGLE PROVIDER-NYA
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. BUNGKUS APP DENGAN PROVIDER */}
    {/* Masukkan Client ID dari mentormu di sini. Kalau belum ada, isi sembarang teks dulu gak apa-apa biar layarnya muncul */}
    <GoogleOAuthProvider clientId="165884247058-favgat2bm3k71g6sup4gk5uuv3h0offg.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)