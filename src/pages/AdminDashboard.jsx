import React from 'react';
import StatsCards from '../components/ApprovalDashboard/StatsCards';

export default function AdminDashboard({ allLogs, user }) {
  const adminStats = [
    { title: "Total Users", value: "24", icon: "Users", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { title: "Global Approvals", value: allLogs.length.toString(), icon: "CheckCircle", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "System Alerts", value: "0", icon: "Shield", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter transition-colors">
          Super Admin Command Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase tracking-widest mt-1">
          Monitoring all divisions in real-time
        </p>
      </header>

      <StatsCards stats={adminStats} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md transition-all">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                Division Performance Overview
              </h3>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full animate-pulse font-black border border-emerald-200 dark:border-emerald-500/20 tracking-tighter">
                LIVE MONITORING
              </span>
            </div>
            
            {/* Placeholder for Chart/Map */}
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] bg-slate-50/50 dark:bg-black/20 shadow-inner group transition-all">
               <div className="text-center">
                  <p className="text-slate-400 dark:text-slate-500 text-sm italic font-medium group-hover:scale-110 transition-transform duration-500">
                    [ Map Monitoring atau Chart Performa Divisi di sini ]
                  </p>
                  <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-2 font-mono">
                    Ready for Data Integration
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Side Panel (Activity Log) */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none h-full min-h-[200px]">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
              System Events
            </h4>
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-transparent">
               <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 border-slate-200 dark:border-white/10 animate-spin mb-3"></div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 Awaiting Stream
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}