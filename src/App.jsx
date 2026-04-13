import React, { useState } from 'react';

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
  
  // State untuk menyimpan data log yang sedang dilihat detailnya (Modal)
  const [selectedLog, setSelectedLog] = useState(null);

  // 1. STATE DATA UTAMA
  const [allLogs, setAllLogs] = useState([
    { 
      id: "8821", 
      action: "System Validation", 
      category: "Security", 
      user: "IT SUPPORT ADMIN", 
      status: "Pending",
      request: "Pending approval for HR access request.",
      aiResponse: "Risk level: Low. Proceed with standard verification.",
      time: "Just now"
    },
    { 
      id: "8825", 
      action: "Database Migration", 
      category: "Infrastructure", 
      user: "DATABASE ENG", 
      status: "Resolved",
      request: "Request to migrate legacy data to production server.",
      aiResponse: "Backup detected. Safe to proceed.",
      time: "10 mins ago"
    },
    { 
      id: "8902", 
      action: "Firewall Policy Update", 
      category: "Network", 
      user: "NETWORK SEC", 
      status: "Rejected",
      request: "Opening port 8080 for external untrusted traffic.",
      aiResponse: "High Risk! Potential vulnerability detected.",
      time: "1 hour ago"
    }
  ]);

  const handleProcessAction = (id, newStatus) => {
    setAllLogs(prevLogs => prevLogs.map(log => 
      log.id === id ? { ...log, status: newStatus } : log
    ));
    setSelectedLog(null); // Tutup modal setelah melakukan aksi
  };

  const handleLogout = () => {
    setUser(null);
    setActiveMenu('dashboard');
  };

  /**
   * Komponen Internal: ApprovalDashboard
   */
  const ApprovalDashboard = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Logika Filtering
    const filteredLogs = allLogs.filter((log) => {
      const matchesSearch = log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.user.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = false;
      if (statusFilter === "All" || statusFilter === "Semua Status") {
        matchesStatus = true;
      } else if (statusFilter === "Success" || statusFilter === "Resolved") {
        matchesStatus = log.status === "Resolved" || log.status === "Success";
      } else {
        matchesStatus = log.status.toLowerCase() === statusFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    });

    const dashboardStats = [
      { title: "Total Logs", value: allLogs.length.toString(), icon: "Activity", color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { title: "Pending Review", value: allLogs.filter(l => l.status === 'Pending').length.toString(), icon: "Clock", color: "text-amber-400", bg: "bg-amber-500/10" },
      { title: "Secured Nodes", value: "100%", icon: "ShieldCheck", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    ];

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <StatsCards stats={dashboardStats} />
        
        <FilterBar 
          currentFilter={statusFilter}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onFilterChange={(e) => setStatusFilter(e.target.value)}
          onRefresh={() => {
            setSearchQuery("");
            setStatusFilter("All");
          }}
        />
        
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <AuditTable 
            data={filteredLogs} 
            onResolve={(id) => handleProcessAction(id, 'Resolved')}
            onReject={(id) => handleProcessAction(id, 'Rejected')}
            onViewDetails={(log) => setSelectedLog(log)} // Membuka modal detail
          />
        </div>

        {/* --- MODAL REVIEW REQUEST (DETAILS) --- */}
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white tracking-tight">Review Request</h3>
                  <button 
                    onClick={() => setSelectedLog(null)} 
                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.2em] mb-1">Tracking ID</p>
                    <p className="text-slate-200 font-mono">#{selectedLog.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-2">Request Description</p>
                    <div className="bg-indigo-600/20 border border-indigo-500/20 p-4 rounded-2xl">
                      <p className="text-indigo-100 text-sm leading-relaxed">{selectedLog.request}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mb-2">AI System Analysis</p>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <p className="text-slate-300 text-sm italic">"{selectedLog.aiResponse}"</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  {/* KONDISI: Hanya tampilkan tombol jika statusnya masih Pending */}
                  {selectedLog.status === "Pending" ? (
                    <>
                      <button 
                        onClick={() => handleProcessAction(selectedLog.id, 'Rejected')}
                        className="flex-1 py-3.5 rounded-xl border border-rose-500/30 text-rose-500 text-sm font-bold hover:bg-rose-500/10 transition-all"
                      >
                        Reject Access
                      </button>
                      <button 
                        onClick={() => handleProcessAction(selectedLog.id, 'Resolved')}
                        className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        Approve & Deploy
                      </button>
                    </>
                  ) : (
                    /* Tampilan jika status sudah diputuskan (Resolved/Rejected) */
                    <div className="w-full py-4 px-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <p className="text-slate-400 text-sm font-medium italic">
                        This request has been <span className={`${selectedLog.status === 'Rejected' ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>{selectedLog.status}</span>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeMenu.endsWith('-approval')) return <ApprovalDashboard />;
    switch (activeMenu) {
      case 'dashboard': return <MonitoringDashboard user={user} />;
      case 'hr': return <HRDashboard />;
      case 'finance': return <FinanceDashboard />;
      case 'marketing': return <MarketingDashboard />;
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
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#020617]/80 backdrop-blur-xl z-40">
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
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          {renderContent()}
        </div>
        <ChatAssistant user={user} />
        <div className="absolute top-0 right-0 -z-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      </main>
    </div>
  );
}