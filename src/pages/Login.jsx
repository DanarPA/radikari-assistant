import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login({ onLoginSuccess }) {

  const handleSuccess = async (credentialResponse) => {
    try {
      // Kirim Token ke Backend FastAPI untuk verifikasi
      const response = await fetch('http://127.0.0.1:8000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Kirim data user (email, name, role) ke App.jsx
        // App.jsx akan otomatis mengganti layar ke Dashboard/Chat tanpa perlu router
        onLoginSuccess(data.user);
      } else {
        alert("Login Gagal: Domain email tidak diizinkan.");
      }
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] backdrop-blur-xl text-center">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            Radikari <span className="text-red-600">Assistant</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-4">
            Authorized Personnel Only
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 py-4">
          <p className="text-sm text-slate-400">Silakan login menggunakan akun Google Workspace kantor Anda.</p>
          
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Login Failed')}
            useOneTap
            theme="filled_black"
            shape="pill"
          />
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            Secure Node Gateway v1.0
          </p>
        </div>
      </div>
    </div>
  );
}