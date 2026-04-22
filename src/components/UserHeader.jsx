import React, { useState, useRef, useEffect } from 'react';

export default function UserHeader({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TOMBOL PROFIL UTAMA */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-4 text-right border transition-all px-4 py-2 rounded-2xl group 
          ${isOpen 
            ? 'border-red-600 ring-2 ring-red-600/20 bg-white dark:bg-slate-900/40' 
            : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none'
          }`}
      >
        <div className="hidden sm:flex flex-col">
          <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-tighter leading-none transition-colors">
            {user.name}
          </p>
          <p className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-widest mt-1 text-right italic">
            {user.role}
          </p>
        </div>
        
        {/* AVATAR */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-400 p-[2px]">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white transition-colors">
            {user.name ? user.name.split(' ').map(n => n[0]).join('') : '??'}
          </div>
        </div>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header Dropdown */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Signed in as</p>
            <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">{user.email || 'user@radikari.co.id'}</p>
          </div>

          {/* List Menu */}
          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Settings
            </button>
            
            <div className="my-1 border-t border-slate-100 dark:border-white/5"></div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-600 hover:text-white transition-all group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              SIGN OUT SESSION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}