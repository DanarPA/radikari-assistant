import React from 'react';
import StatsCards from '../components/ApprovalDashboard/StatsCards';
// MATIKAN SEMENTARA KARENA FILENYA BELUM ADA:
// import ActivityLog from '../components/ActivityLog';

export default function AdminDashboard({ allLogs, user }) {
  const adminStats = [
    { title: "Total Users", value: "24", icon: "Users", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { title: "Global Approvals", value: allLogs.length.toString(), icon: "CheckCircle", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "System Alerts", value: "0", icon: "Shield", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
          Super Admin Command Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase tracking-widest mt-1">
          Monitoring all divisions in real-time
        </p>
      </header>

      <StatsCards stats={adminStats} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl dark:shadow-black/20 backdrop-blur-md">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Division Performance Overview</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full animate-pulse font-bold border border-emerald-500/20">
                LIVE MONITORING
              </span>
            </div>
            
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-transparent shadow-inner">
               <p className="text-slate-400 dark:text-slate-500 text-sm italic font-medium">
                  [ Map Monitoring atau Chart Performa Divisi di sini ]
               </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="shadow-2xl dark:shadow-none rounded-3xl">
            {/* MATIKAN SEMENTARA */}
            {/* <ActivityLog /> */}
            <div className="p-6 text-center text-slate-500 text-sm border border-dashed border-slate-300 dark:border-white/10 rounded-2xl">
               Activity Log Pending
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}