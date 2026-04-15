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

export default function App() {
  const [user, setUser] = useState(null); 
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  // 1. STATE UNTUK DATA API
  const [allLogs, setAllLogs] = useState([]);

  // 2. PULL DATA DARI BACKEND SAAT APLIKASI DIMUAT
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/approval-logs');
        if (response.ok) {
          const data = await response.json();
          setAllLogs(data);
        }
      } catch (error) {
        console.error("Gagal menarik data dari Backend:", error);
      }
    };

    // Hanya tarik data jika user sudah login (opsional, tapi lebih efisien)
    if (user) {
      fetchLogs();
    }
  }, [user]);

  // 3. PUSH UPDATE KE BACKEND SAAT TOMBOL DITEKAN
  const handleProcessAction = async (id, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/approval-logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }), 
      });

      if (response.ok) {
        // Update UI secara lokal agar responsif tanpa perlu reload halaman
        setAllLogs(prev => prev.map(log => log.id === id ? { ...log, status: newStatus } : log));
        setSelectedLog(null);
      } else {
        alert("Gagal memproses aksi. Periksa koneksi ke database.");
      }
    } catch (error) {
      console.error("Error saat memproses aksi:", error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveMenu('dashboard');
  };

  // --- LOGIC RENDER CONTENT ---
  const renderContent = () => {
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

  if (!user) return <Login onLogin={(userData) => setUser(userData)} />;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        userRole={user.role} activeMenu={activeMenu} setActiveMenu={setActiveMenu} 
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#020617]/80 backdrop-blur-xl z-40 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-black uppercase italic text-white tracking-tighter leading-none">
              {activeMenu.replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.3em]">SECURE NODE ACTIVE</p>
            </div>
          </div>
          <UserHeader user={user} onLogout={handleLogout} />
        </header>

        <div className={`flex-1 relative z-10 custom-scrollbar ${
          activeMenu === 'ai-assistant' ? 'overflow-hidden p-0' : 'overflow-y-auto p-8'
        }`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

/**
 * KOMPONEN TERPISAH: ApprovalDashboardPage
 */
function ApprovalDashboardPage({ allLogs, handleProcessAction, selectedLog, setSelectedLog }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredLogs = allLogs.filter((log) => {
    // Memastikan id dan user tidak undefined/null sebelum di-lowercase
    const logId = log.id ? String(log.id).toLowerCase() : "";
    const logUser = log.user ? log.user.toLowerCase() : "";
    
    const matchesSearch = logId.includes(searchQuery.toLowerCase()) || logUser.includes(searchQuery.toLowerCase());
    
    let matchesStatus = statusFilter === "All" || statusFilter === "Semua Status" 
      ? true 
      : (statusFilter === "Success" || statusFilter === "Resolved")
        ? (log.status === "Resolved" || log.status === "Success" || log.status === "resolved")
        : log.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const dashboardStats = [
    { title: "Total Logs", value: allLogs.length.toString(), icon: "Activity", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { title: "Pending Review", value: allLogs.filter(l => l.status?.toLowerCase() === 'pending').length.toString(), icon: "Clock", color: "text-amber-400", bg: "bg-amber-500/10" },
    { title: "Secured Nodes", value: "100%", icon: "ShieldCheck", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <StatsCards stats={dashboardStats} />
      <FilterBar 
        currentFilter={statusFilter}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onFilterChange={(e) => setStatusFilter(e.target.value)}
        onRefresh={() => { setSearchQuery(""); setStatusFilter("All"); }}
      />
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <AuditTable 
          data={filteredLogs} 
          onResolve={(id) => handleProcessAction(id, 'Resolved')}
          onReject={(id) => handleProcessAction(id, 'Rejected')}
          onViewDetails={(log) => setSelectedLog(log)}
        />
      </div>

      {/* MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Review Request</h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="space-y-6">
               <div>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Tracking ID</p>
                  <p className="text-slate-200 font-mono">#{selectedLog.id}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Description</p>
                  <p className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl text-slate-300 text-sm">{selectedLog.request}</p>
               </div>
               <div className="flex gap-3 mt-8">
                  {selectedLog.status?.toLowerCase() === "pending" ? (
                    <>
                      <button onClick={() => handleProcessAction(selectedLog.id, 'Rejected')} className="flex-1 py-3.5 rounded-xl border border-rose-500/30 text-rose-500 font-bold hover:bg-rose-500/10 transition-all">Reject</button>
                      <button onClick={() => handleProcessAction(selectedLog.id, 'Resolved')} className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all">Approve</button>
                    </>
                  ) : (
                    <div className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-center text-slate-400 italic">Request {selectedLog.status}</div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}