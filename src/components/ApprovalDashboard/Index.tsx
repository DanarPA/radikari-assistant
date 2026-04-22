import React from 'react';
import StatsCards from './StatsCards';
import FilterBar from './FilterBar';
import AuditTable from './AuditTable';

const ApprovalDashboard = ({ user }) => {
  // 1. LOGIKA PEMBATASAN AKSES
  // Staff tidak bisa (position must be SPV)
  // Super_Admin tidak bisa (role must not be Super_Admin)
  const canApprove = user?.position === 'SPV' && user?.role !== 'Super_Admin';

  return (
    <div className="space-y-6">
      {/* Bagian Atas: Statistik */}
      {/* Kita kirim canApprove jika StatsCards perlu menampilkan data sensitif khusus SPV */}
      <StatsCards canApprove={canApprove} />

      {/* Bagian Tengah: Filter & Pencarian */}
      <FilterBar />

      {/* Bagian Bawah: Tabel Data */}
      <div className="rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
        {/* 2. OPER DATA KE AUDIT TABLE */}
        {/* AuditTable sekarang tahu apakah dia harus memunculkan tombol aksi atau tidak */}
        <AuditTable canApprove={canApprove} user={user} />
      </div>
      
      {/* Visual Indicator untuk Testing (Optional - Bisa dihapus nanti) */}
      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest opacity-50 px-2">
        Access Level: {canApprove ? 'Full Control (SPV)' : 'Read Only Mode'}
      </div>
    </div>
  );
};

export default ApprovalDashboard;