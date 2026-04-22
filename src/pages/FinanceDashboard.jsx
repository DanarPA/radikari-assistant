import React, { useState, useEffect } from 'react';

export default function FinanceDashboard() {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/approval-history');
      const result = await response.json();

      if (result.status === 'success') {
        const financeHistory = result.data.filter(log => 
          log.category?.toLowerCase() === 'finance'
        );
        setHistoryLogs(financeHistory);
      }
    } catch (error) {
      console.error("Gagal mengambil data log transaksi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const stats = [
    { label: 'Total Accounts', value: '45', color: 'text-slate-900 dark:text-white' },
    { label: 'Active Ledger', value: '12', color: 'text-emerald-600 dark:text-emerald-500' },
    { label: 'Audited Transactions', value: historyLogs.length.toString(), color: 'text-amber-600 dark:text-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors">
            Finance <span className="text-amber-600 dark:text-amber-500">Operations</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">
            Centralized Financial Management System
          </p>
        </div>

        <button 
          onClick={fetchLogs} 
          className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none uppercase tracking-widest flex items-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Ledger
        </button>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-[2rem] hover:border-amber-500/30 transition-all group shadow-xl shadow-slate-200/40 dark:shadow-none">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-4xl font-black tracking-tighter ${stat.color} group-hover:scale-105 transition-transform`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* 3. MAIN CONTENT AREA (History) */}
      <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-none transition-all">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-between items-center">
          <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
            Transaction History Logs
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Financial Audit Active</span>
          </div>
        </div>
        
        <div className="p-2">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400 font-mono tracking-widest animate-pulse">SYNCHRONIZING LEDGER...</div>
          ) : historyLogs.length === 0 ? (
            <div className="p-10 text-center">
              <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-800/50 mb-4 border border-slate-200 dark:border-white/5">
                 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase italic">Ledger Empty</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto uppercase tracking-tighter">
                No processed transactions found.
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
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{log.time?.split('.')[0]}</span>
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
                      log.status?.toLowerCase() === 'approved' || log.status?.toLowerCase() === 'resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 shadow-sm shadow-emerald-200/20' 
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 shadow-sm shadow-rose-200/20'
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