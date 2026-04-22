import React, { useState, useEffect, useRef } from 'react';

export default function ChatAssistant({ user }) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([
    { text: `Halo ${firstName}! Ada kendala sistem atau butuh bantuan apa hari ini?`, isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `Gue udah catet laporan lo soal "${userMessage}". Tim IT bakal langsung cek status servernya.`, 
        isBot: true 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    // Perubahan 1: Background pakai slate-50 (Light) dan dark:#020617 (Dark)
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#020617] transition-all duration-500 overflow-hidden border-l border-slate-200 dark:border-white/5">
      
      {/* --- 1. CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide space-y-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${m.isBot ? 'justify-start' : 'justify-end'}`}
            >
              {m.isBot && (
                <div className="w-8 h-8 rounded-lg bg-red-600/10 dark:bg-red-600/20 border border-red-600/20 dark:border-red-600/30 flex items-center justify-center shrink-0 mb-1">
                  <span className="text-[10px] font-black text-red-600 dark:text-red-500">AI</span>
                </div>
              )}

              {/* Perubahan 2: Warna gelembung bot (Putih di light mode, Slate gelap di dark mode) */}
              <div className={`group relative max-w-[85%] lg:max-w-[70%] p-5 text-sm leading-relaxed border transition-all duration-300 ${
                m.isBot 
                  ? 'bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-none shadow-sm dark:shadow-none backdrop-blur-xl hover:border-slate-300 dark:hover:border-white/10' 
                  : 'bg-red-600 text-white border-transparent rounded-2xl rounded-tr-none shadow-xl shadow-red-600/20 hover:bg-red-700'
              }`}>
                {m.text}
                
                <span className="absolute -bottom-5 left-0 text-[8px] font-bold text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                  Delivered • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse ml-11">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
              </span>
              Processing...
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* --- 2. INPUT AREA --- */}
      {/* Perubahan 3: Background input area mengikuti tema */}
      <div className="shrink-0 p-6 lg:p-10 border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center gap-4">
            
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center group"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Perubahan 4: Input field (Slate-100 di light mode) */}
            <div className="flex-1">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-4 lg:py-5 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/50 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium shadow-inner"
              />
            </div>

            <button 
              type="submit" 
              disabled={!input.trim()}
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white flex items-center justify-center shadow-lg shadow-red-600/20 active:scale-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>

          {/* Footer Label */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent"></div>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.5em]">
              Radikari <span className="text-red-600/50 dark:text-red-900/50">Neural Link</span> Active
            </p>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent"></div>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) setMessages(prev => [...prev, { text: `📁 Attached: ${file.name}`, isBot: false }]);
        }} 
      />
    </div>
  );
}