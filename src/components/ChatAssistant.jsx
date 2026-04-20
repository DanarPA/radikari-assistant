import React, { useState, useEffect, useRef } from 'react';

export default function ChatAssistant({ user, activeMenu }) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const userRole = user?.role || 'GUEST';
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([
    { text: `Halo ${firstName}! Ada yang bisa dibantu hari ini?`, isBot: true }
  ]);
  const [input, setInput] = useState("");

  // Refs untuk radar Auto-Polling
  const lastHistoryCount = useRef(0);
  const isFirstLoad = useRef(true);

  // 1. Auto-Scroll ke pesan terbaru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. RADAR TAK KASAT MATA (Auto-Polling setiap 5 detik)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/approval-history');
        const data = await res.json();
        
        if (data.status === 'success') {
          const divisiStr = activeMenu ? activeMenu.toLowerCase() : "hr";
          
          // Ambil history khusus divisi user ini saja
          const myDivisiHistory = data.data.filter(
            log => log.category?.toLowerCase() === divisiStr
          );

          if (isFirstLoad.current) {
             // Set hitungan awal saat komponen pertama kali dimuat
             lastHistoryCount.current = myDivisiHistory.length;
             isFirstLoad.current = false;
             return;
          }

          // Jika jumlah history bertambah, artinya SPV baru saja memproses antrean!
          if (myDivisiHistory.length > lastHistoryCount.current) {
             const newItemsCount = myDivisiHistory.length - lastHistoryCount.current;
             // Karena query backend diurutkan DESC (terbaru di atas), kita ambil N item pertama
             const newLogs = myDivisiHistory.slice(0, newItemsCount);
             
             newLogs.forEach(log => {
               const isApproved = log.status.toLowerCase() === 'approved';
               const statusIcon = isApproved ? '✅' : '❌';
               const statusText = log.status.toUpperCase();
               
               // Munculkan chat bubble baru otomatis!
               setMessages(prev => [...prev, { 
                 text: `${statusIcon} [NOTIFIKASI SISTEM]\nPermintaan aksi '${log.action}' Anda telah di-${statusText} oleh Supervisor.\n\nDetail Request:\n"${log.request}"${isApproved ? '\n\nSistem sedang menyiapkan dokumen/eksekusi akhir Anda...' : ''}`, 
                 isBot: true 
               }]);
             });

             // Update hitungan radar ke jumlah terbaru
             lastHistoryCount.current = myDivisiHistory.length;
          }
        }
      } catch (err) {
        // Abaikan error (silent fail) agar UI tidak terganggu jika terjadi network glitch
      }
    }, 5000); // Polling berjalan setiap 5000 ms (5 detik)

    // Bersihkan interval jika user berpindah halaman/divisi
    return () => clearInterval(pollInterval);
  }, [activeMenu]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessages([...messages, { text: `📁 Menyiapkan file: ${file.name}`, isBot: false }]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput("");

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: userMessage,
          // GANTI BARIS INI: Paksa nilainya menjadi "hr" untuk testing
          divisi: "hr", 
          user_id: userRole,
          history: messages.slice(-6).map(m => ({
            role: m.isBot ? "assistant" : "user",
            content: m.text
          }))
        })
      });

      if (!response.ok) throw new Error('Backend Error');

      const data = await response.json();
      const botReply = data.reply || "Maaf, tidak ada respons dari sistem.";
      
      setMessages(prev => [...prev, { text: botReply, isBot: true }]);

    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "❌ Koneksi ke Backend terputus. Pastikan server FastAPI (port 8000) sudah berjalan!", 
        isBot: true 
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden">
      
      {/* AREA PESAN */}
      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300`}>
            <div className={`max-w-[75%] p-5 text-sm leading-relaxed ${
              m.isBot 
                ? 'bg-slate-800/40 text-slate-200 border border-white/5 rounded-2xl rounded-tl-none backdrop-blur-md whitespace-pre-wrap' 
                : 'bg-red-600 text-white font-bold rounded-2xl rounded-tr-none shadow-lg shadow-red-900/20'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* AREA INPUT */}
      <div className="shrink-0 p-8 border-t border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <form onSubmit={handleSend} className="max-w-6xl mx-auto flex items-center gap-4">
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
          />

          <button 
            type="button"
            onClick={handleUploadClick}
            className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ada kendala apa, Bro?"
            className="flex-1 bg-[#020617] border border-white/10 rounded-xl py-5 px-6 text-sm focus:outline-none focus:border-red-600 text-white shadow-inner"
          />

          <button type="submit" className="bg-red-600 hover:bg-red-700 w-14 h-14 rounded-xl flex items-center justify-center text-white transition-transform active:scale-95 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[9px] text-slate-500 mt-4 font-bold uppercase tracking-[0.4em]">
          RADIKARI INTELLIGENCE NODE ACTIVE
        </p>
      </div>
    </div>
  );
}