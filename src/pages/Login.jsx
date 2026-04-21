import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Paksa mode dark aktif pada root element
    document.documentElement.classList.add('dark');
  }, []);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // PERBAIKAN 1: Endpoint disesuaikan ke /api/auth/local
      const response = await fetch('http://127.0.0.1:8000/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();
      
      // PERBAIKAN 2: Pengecekan response.ok dan penangkapan data.detail
      if (response.ok && data.status === 'success') {
        onLoginSuccess(data.user);
      } else {
        alert(data.detail || "Login Gagal: Username atau Password salah.");
      }
    } catch (error) {
      console.error("Manual Auth Error:", error);
      alert("Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        onLoginSuccess(data.user);
      } else {
        alert(`Login Gagal: ${data.detail || "Domain email tidak diizinkan."}`);
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      alert("Gagal terhubung ke server autentikasi.");
    }
  };

  return (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans selection:bg-red-500/30">
      
      {/* BACKGROUND BLOOM EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/[0.07] rounded-full blur-[120px] pointer-events-none" />

      {/* LOGIN CARD */}
      <div className="w-full max-w-[420px] p-10 space-y-8 bg-slate-900/40 border border-white/5 rounded-[3rem] backdrop-blur-2xl shadow-2xl relative z-10 mx-4 transition-all">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            Radikari <span className="text-red-600">Assistant</span>
          </h1>
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.4em]">Identify yourself before continuing</p>
        </div>

        {/* GOOGLE LOGIN SECTION */}
        <div className="flex flex-col items-center gap-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
            theme="filled_black"
            shape="pill"
            width="340"
          />
          
          <div className="flex items-center w-full gap-4 opacity-30 px-2">
            <div className="h-[1px] flex-1 bg-slate-400"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">OR</span>
            <div className="h-[1px] flex-1 bg-slate-400"></div>
          </div>
        </div>

        {/* MANUAL LOGIN FORM */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Username</label>
            <input 
              type="text" 
              placeholder="e.g. admin"
              className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* FOOTER */}
        <div className="pt-4 border-t border-white/5 text-center">
          <p className="text-[8px] font-mono text-slate-400 uppercase tracking-[0.2em] opacity-60">
            Intelligent Terminal v3.0 // Radikari Assistant
          </p>
        </div>
      </div>
    </div>
  );
}