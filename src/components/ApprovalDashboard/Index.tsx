import React from 'react';
import StatsCards from './StatsCards';
import FilterBar from './FilterBar';
import AuditTable from './AuditTable';

const ApprovalDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Bagian Atas: Statistik */}
      <StatsCards />

      {/* Bagian Tengah: Filter & Pencarian */}
      <FilterBar />

      {/* Bagian Bawah: Tabel Data */}
      <div className="rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <AuditTable />
      </div>
    </div>
  );
};

export default ApprovalDashboard;