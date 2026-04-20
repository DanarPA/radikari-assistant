import React, { useState, useEffect } from 'react';

export default function MarketingDashboard() {
  // 1. State penampung data
  const [approvalLogs, setApprovalLogs] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk mengontrol tab
  const [activeTab, setActiveTab] = useState('pending'); 

  // 2. Fungsi untuk menarik data dari FastAPI (Filter Khusus Marketing)
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      const resPending = await fetch('http://127.0.0.1:8000/api/approval-logs');
      const dataPending = await resPending.json();
      if (dataPending.status === 'success') {
        // Hanya ambil data yang divisinya 'Marketing'
        const marketingPending = dataPending.data.filter(log => log.category?.toLowerCase() === 'marketing');
        setApprovalLogs(marketingPending);
      }

      const resHistory = await fetch('http://127.0.0.1:8000/api/approval-history');
      const dataHistory = await resHistory.json();
      if (dataHistory.status === 'success') {
        // Hanya ambil data history yang divisinya 'Marketing'
        const marketingHistory = dataHistory.data.filter(log => log.category?.toLowerCase() === 'marketing');
        setHistoryLogs(marketingHistory);
      }

    } catch (error) {
      console.error("Gagal mengambil data log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 3. Fungsi untuk mengeksekusi aksi
  const handleApprovalAction = async (id, actionStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/approval-logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionStatus })
      });

      if (response.ok) {
        fetchLogs();
      }
    } catch (error) {
      console.error(`Gagal melakukan ${actionStatus}:`, error);
    }
  };

  // 4. Update data statis (Disesuaikan untuk Marketing)
  const stats = [
    { label: 'Total Campaigns', value: '38', color: 'text-white' },
    { label: 'Active Channels', value: '6', color: 'text-emerald-500' },
    { label: 'Pending Approval', value: approvalLogs.length.toString(), color: 'text-purple-500' },
  ];

  const displayedLogs = activeTab === 'pending' ? approvalLogs : historyLogs;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Marketing <span className="text-purple-500">Operations</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">
            Centralized Campaign Management System
          </p>
        </div>

        <button 
          onClick={fetchLogs} 
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Data
        </button>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:border-purple-500/30 transition-all group">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-4xl font-black tracking-tighter ${stat.color} group-hover:scale-105 transition-transform`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="bg-slate-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
            {activeTab === 'pending' ? 'Pending Campaign Requests' : 'Campaign History Logs'}
          </h3>
          
          <div className="flex gap-2">
             <button 
                onClick={() => setActiveTab('pending')}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${activeTab === 'pending' ? 'bg-purple-500 animate-pulse scale-125' : 'bg-slate-700 hover:bg-slate-500'}`}
                title="View Pending Approvals"
             />
             <button 
                onClick={() => setActiveTab('history')}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${activeTab === 'history' ? 'bg-purple-500 animate-pulse scale-125' : 'bg-slate-700 hover:bg-slate-500'}`}
                title="View Action History"
             />
          </div>
        </div>
        
        <div className="p-2 transition-all duration-300">
          {isLoading ? (
            <div className="p-10 text-center text-slate-500 text-sm animate-pulse">Scanning campaigns...</div>
          ) : displayedLogs.length === 0 ? (
            <div className="p-10 text-center">
              <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-4 border border-white/5">
                 <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <h4 className="text-white font-bold text-sm">
                {activeTab === 'pending' ? 'Campaigns Clear' : 'No History Found'}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto uppercase tracking-tighter">
                {activeTab === 'pending' 
                  ? 'No pending campaign requests. All strategies are deployed.' 
                  : 'There are no previously processed campaign requests in the database.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {displayedLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${
                        activeTab === 'pending' 
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.time.split('.')[0]}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono mt-2 line-clamp-2 bg-[#020617] p-2 rounded border border-white/5">
                      {log.request}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2 italic">
                      AI Reasoning: "{log.aiResponse}"
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 items-center">
                    {activeTab === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleApprovalAction(log.id, 'Rejected')}
                          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApprovalAction(log.id, 'Approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(5,150,105,0.4)] transition-all active:scale-95"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                        log.status === 'Approved' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
                      }`}>
                        {log.status}
                      </span>
                    )}
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