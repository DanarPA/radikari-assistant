"use client";
import { useState } from "react";
import Image from "next/image";
import { Activity, Search, RefreshCw } from "lucide-react";

// Import Komponen Baru
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AuditTable } from "@/components/dashboard/AuditTable";
import { FilterBar } from "@/components/dashboard/FilterBar";

import { auditData as initialData, statsOverview } from "./data-logs";

export default function AuditPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [logs, setLogs] = useState(initialData);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const filteredData = logs.filter((log) => {
    const searchContent = searchQuery.toLowerCase();
    const matchesSearch =
      log.id.toLowerCase().includes(searchContent) ||
      log.user.toLowerCase().includes(searchContent);
    const matchesStatus = statusFilter === "All" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fungsi untuk mengubah status log
  const handleResolve = (id: string) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === id ? { ...log, status: "Success" } : log,
      ),
    );
  };

  const pendingCount = logs.filter((log) => log.status === "Pending").length;
  const totalCount = logs.length;

  const dynamicStats = statsOverview.map((stat) => {
    if (stat.title === "Pending Approval")
      return { ...stat, value: pendingCount.toString() };
    if (stat.title === "Total Logs")
      return { ...stat, value: totalCount.toString() };
    return stat;
  });

  const handleReject = (id: string) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === id ? { ...log, status: "Rejected" } : log,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
              <Image
                src="/radikari-logo.png"
                alt="LOGO"
                width={40}
                height={40}
                className="rounded-full border-2 border-indigo-100 shadow-sm"
              />
              RADIKARI FE OPS
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Monitoring internal system & AI approvals for RADIKARI
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border shadow-sm border-slate-200">
            <Activity className="text-green-500 animate-pulse" size={18} />
            <span className="text-sm font-semibold text-slate-700">
              System: Operational
            </span>
          </div>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <StatsCards stats={dynamicStats} />

        <AuditTable
          data={filteredData}
          searchQuery={searchQuery}
          onResolve={handleResolve}
          onReject={handleReject}
        />
        {/* FOOTER */}
        <p className="text-center text-slate-400 text-xs mt-10 uppercase tracking-[0.2em] font-medium">
          Frontend Ops Dashboard • Built with Next.js & Shadcn UI
        </p>
      </div>
    </div>
  );
}
