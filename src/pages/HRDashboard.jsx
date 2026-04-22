import React, { useState, useEffect } from 'react';
import StatsCards from '../components/ApprovalDashboard/StatsCards.tsx';

export default function HRDashboard() {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/approval-logs/history');
      const data = await response.json();

      // Filter data khusus kategori HR atau AI Assistant
      const hrHistory = data.filter(log => 
        log.category?.toLowerCase().includes('hr') || log.category?.toLowerCase().includes('ai-assistant')
      );
      setHistoryLogs(hrHistory);
    } catch (error) {
      console.error("Gagal mengambil data log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // --- LOGIKA STATISTIK DINAMIS ---
  const totalLogs = historyLogs.length;
  
  const pendingCount = historyLogs.filter(
    log => log.status?.toLowerCase() === 'pending'
  ).length;

  const acceptCount = historyLogs.filter(
    log => log.status?.toLowerCase() === 'approved' || log.status?.toLowerCase() === 'accepted'
  ).length;

  const statsData = [
    { 
      title: 'Total Logs', 
      value: totalLogs.toString(), 
      icon: 'Activity', 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10' 
    },
    { 
      title: 'Pending Review', 
      value: pendingCount.toString(), 
      icon: 'Clock', 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10' 
    },
    { 
      title: 'Accept Review', 
      value: acceptCount.toString(), 
      icon: 'ShieldCheck', 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors">
            Human Resources <span className="text-red-600">Operations</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">
            Centralized Personnel Management System
          </p>
        </div>

        <button 
          onClick={fetchLogs} 
          className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none uppercase tracking-widest flex items-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* 2. STATS CARDS SECTION (MENGGANTIKAN GRID LAMA) */}
      <StatsCards stats={statsData} />

      {/* 3. MAIN CONTENT AREA (Action History Logs) */}
      <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-between items-center">
          <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
            Action History Logs
          </h3>
          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600 uppercase">Read-Only Mode</span>
        </div>
        
        <div className="p-2">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm animate-pulse font-mono uppercase tracking-widest">Scanning database...</div>
          ) : historyLogs.length === 0 ? (
            <div className="p-10 text-center">
              <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-800/50 mb-4 border border-slate-200 dark:border-white/5">
                 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase">No Records Found</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto uppercase tracking-tighter">
                The personnel activity log is currently empty.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {historyLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {log.time?.split('.')[0] || 'N/A'}
                      </span>
                    </div>
                    {/* REQUEST BOX */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono mt-2 line-clamp-2 bg-slate-50 dark:bg-[#020617] p-2 rounded border border-slate-200 dark:border-white/5 transition-colors">
                      {log.request}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
                      AI Reasoning: "{log.aiResponse}"
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 items-center">
                    <span className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      log.status?.toLowerCase() === 'approved' 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}