import React, { useState, useEffect } from 'react';

// --- UI COMPONENTS ---
import Sidebar from './components/Sidebar';
import UserHeader from './components/UserHeader';
import ChatAssistant from './components/ChatAssistant';
import MonitoringDashboard from './components/MonitoringDashboard';
// import { ThemeToggle } from './components/ThemeToggle'; // <- Masih dimatikan sementara

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
import UserManagement from './pages/UserManagement'; // <- IMPORT HALAMAN BARU DI SINI

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('radikari_user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 
  
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [allLogs, setAllLogs] = useState([]);

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

  const renderContent = () => {
    // TAMPILAN DASHBOARD SUPER ADMIN
    if (user?.role === 'SUPER_ADMIN' && activeMenu === 'dashboard') {
      return <AdminDashboard allLogs={allLogs} user={user} />;
    }
    
    // TAMPILAN USER MANAGEMENT (KHUSUS SUPER ADMIN)
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
        return (
          <div className="h-full w-full animate-in fade-in duration-500">
             <ChatAssistant user={user} activeMenu={activeMenu} />
          </div>
        );
      default: return <MonitoringDashboard user={user} />;
    }
  };    

  if (!user) return <Login onLoginSuccess={handleLogin} />;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#020617] text-slate-900 dark:text-slate-200 overflow-hidden font-sans transition-colors duration-500">
      <Sidebar 
        userRole={user.role} activeMenu={activeMenu} setActiveMenu={setActiveMenu} 
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="px-8 py-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/90 dark:bg-[#020617]/80 backdrop-blur-2xl z-40 shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
          <div className="flex flex-col">
            <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tighter leading-tight italic">
              {activeMenu.replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
              <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                System Active
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner flex items-center justify-center">
               {/* <ThemeToggle /> */}
            </div>

            <div className="h-8 w-[1.5px] bg-slate-200 dark:bg-white/10 rotate-[15deg] opacity-60" />
            
            <div className="hover:scale-[1.02] active:scale-95 transition-transform duration-200">
               <UserHeader user={user} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        <div className={`flex-1 relative z-10 custom-scrollbar ${
          activeMenu === 'ai-assistant' ? 'overflow-hidden p-0' : 'overflow-y-auto p-8'
        }`}>
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

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
      
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-2xl dark:shadow-black/20 backdrop-blur-md">
        <AuditTable 
          data={filteredLogs} 
          onResolve={(id) => handleProcessAction(id, 'Resolved')}
          onReject={(id) => handleProcessAction(id, 'Rejected')}
          onViewDetails={(log) => setSelectedLog(log)}
        />
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] p-8 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Review Details</h3>
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
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
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