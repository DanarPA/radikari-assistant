import React, { useState, useEffect } from 'react';

// --- UI COMPONENTS ---
import Sidebar from './components/Sidebar';
import UserHeader from './components/UserHeader';
import ChatAssistant from './components/ChatAssistant';
import MonitoringDashboard from './components/MonitoringDashboard';

// --- APPROVAL COMPONENTS ---
import AuditTable from './components/ApprovalDashboard/AuditTable';
import FilterBar from './components/ApprovalDashboard/FilterBar';
import StatsCards from './components/ApprovalDashboard/StatsCards';

// --- PAGES ---
import Login from './pages/Login'; 
import HRDashboard from './pages/HRDashboard'; 
import FinanceDashboard from './pages/FinanceDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';

export default function App() {
  // 1. STATE USER (Persistent via LocalStorage)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('radikari_user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 

  // 2. STATE THEME (Persistent via LocalStorage)
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('radikari_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [allLogs, setAllLogs] = useState([]);

  // SINKRONISASI TEMA KE ROOT HTML
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('radikari_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('radikari_theme', 'light');
    }
  }, [isDark]);

  // FETCH DATA UNTUK APPROVAL LOGS
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/approval-logs');
        if (response.ok) {
          const data = await response.json();
          setAllLogs(data.data || data); 
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };
    if (user) fetchLogs();
  }, [user]);

  // HANDLE ACTION APPROVE/REJECT
  const handleProcessAction = async (id, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/approval-logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }), 
      });
      if (response.ok) {
        setAllLogs(prev => prev.map(log => log.id === id ? { ...log, status: newStatus } : log));
        setSelectedLog(null);
      }
    } catch (error) {
      console.error("Action Error:", error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('radikari_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setActiveMenu('dashboard');
    localStorage.removeItem('radikari_user');
  };

  // LOGIC RENDERING CONTENT
  const renderContent = () => {
    if (user?.role === 'SUPER_ADMIN' && activeMenu === 'dashboard') {
      return <AdminDashboard allLogs={allLogs} user={user} />;
    }
    
    if (user?.role === 'SUPER_ADMIN' && activeMenu === 'user-management') {
      return <UserManagement user={user} />;
    }

    if (activeMenu.toLowerCase().includes('approval')) {
      return (
        <ApprovalDashboardPage 
          allLogs={allLogs} 
          handleProcessAction={handleProcessAction} 
          selectedLog={selectedLog}
          setSelectedLog={setSelectedLog}
        />
      );
    }
    
    switch (activeMenu) {
      case 'dashboard': return <MonitoringDashboard user={user} />;
      case 'hr': return <HRDashboard />;
      case 'finance': return <FinanceDashboard />;
      case 'marketing': return <MarketingDashboard />;
      case 'ai-assistant': 
        return <ChatAssistant user={user} activeMenu={activeMenu} />;
      default: return <MonitoringDashboard user={user} />;
    }
  };    

  if (!user) return <Login onLoginSuccess={handleLogin} />;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 overflow-hidden font-sans transition-colors duration-500">
      
      <Sidebar 
        userRole={user.role} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* GLOBAL HEADER */}
        <header className="px-8 py-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/90 dark:bg-[#020617]/80 backdrop-blur-2xl z-40 shrink-0 shadow-sm dark:shadow-none transition-all">
          <div className="flex flex-col">
            <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tighter leading-tight italic">
              {activeMenu.replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                System Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
            >
              {isDark ? (
                <svg className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600 group-hover:-rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <div className="h-8 w-[1.5px] bg-slate-200 dark:bg-white/10 rotate-[15deg] opacity-60" />
            <UserHeader user={user} onLogout={handleLogout} />
          </div>
        </header>

        {/* MAIN CONTENT CONTAINER - FIX POSISI CHAT DI SINI */}
        <div className={`flex-1 relative z-10 ${
          activeMenu === 'ai-assistant' ? 'overflow-hidden p-0' : 'overflow-y-auto p-8'
        }`}>
          {/* h-full w-full memastikan ChatAssistant bisa nempel ke lantai layar */}
          <div className={activeMenu === 'ai-assistant' ? "h-full w-full" : "max-w-7xl mx-auto"}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-PAGE: APPROVAL DASHBOARD PAGE ---
function ApprovalDashboardPage({ allLogs, handleProcessAction, selectedLog, setSelectedLog }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredLogs = allLogs.filter((log) => {
    const logId = log.id ? String(log.id).toLowerCase() : "";
    const logUser = log.user ? log.user.toLowerCase() : "";
    const matchesSearch = logId.includes(searchQuery.toLowerCase()) || logUser.includes(searchQuery.toLowerCase());
    let matchesStatus = statusFilter === "All" || statusFilter === "Semua Status" 
      ? true 
      : log.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const dashboardStats = [
    { title: "Total Logs", value: allLogs.length.toString(), icon: "Activity", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { title: "Pending Review", value: allLogs.filter(l => l.status?.toLowerCase() === 'pending').length.toString(), icon: "Clock", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
    { title: "System Health", value: "99.9%", icon: "ShieldCheck", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <StatsCards stats={dashboardStats} />
      
      <FilterBar 
        currentFilter={statusFilter}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onFilterChange={(e) => setStatusFilter(e.target.value)}
        onRefresh={() => { setSearchQuery(""); setStatusFilter("All"); }}
      />
      
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl dark:shadow-none backdrop-blur-md transition-all">
        <AuditTable 
          data={filteredLogs} 
          onResolve={(id) => handleProcessAction(id, 'Resolved')}
          onReject={(id) => handleProcessAction(id, 'Rejected')}
          onViewDetails={(log) => setSelectedLog(log)}
        />
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 transform animate-in zoom-in-95 duration-200 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase italic">Review Details</h3>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">✕</button>
            </div>
            
            <div className="space-y-5">
               <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-inner">
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] mb-1">Tracking ID</p>
                  <p className="text-slate-900 dark:text-slate-100 font-mono text-sm font-bold">#{selectedLog.id}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest mb-2 px-1">Request Summary</p>
                  <p className="bg-white dark:bg-blue-500/5 border border-slate-200 dark:border-blue-500/20 p-6 rounded-2xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed shadow-sm">
                    {selectedLog.request}
                  </p>
               </div>
               <div className="flex gap-3 pt-4">
                  {selectedLog.status?.toLowerCase() === "pending" ? (
                    <>
                      <button onClick={() => handleProcessAction(selectedLog.id, 'Rejected')} className="flex-1 py-4 rounded-2xl border-2 border-rose-500 text-rose-500 font-black hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-xs uppercase tracking-widest">Reject</button>
                      <button onClick={() => handleProcessAction(selectedLog.id, 'Resolved')} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all text-xs uppercase tracking-widest">Approve</button>
                    </>
                  ) : (
                    <div className={`w-full py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest border ${
                      selectedLog.status?.toLowerCase() === 'resolved' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'
                    }`}>
                      Status: {selectedLog.status}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}