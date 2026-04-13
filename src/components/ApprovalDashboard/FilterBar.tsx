import React from 'react';
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const FilterBar = ({ onSearchChange, onFilterChange, onRefresh, currentFilter }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
      {/* 1. Kolom Search (Kiri) */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search logs by ID or User..."
          onChange={onSearchChange}
          className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      {/* 2. Kolom Filter & Button (Kanan) */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <select
          value={currentFilter}
          onChange={onFilterChange}
          className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none min-w-[140px]"
        >
          <option value="All">Semua Status</option>
          <option value="Pending">Pending</option>
          <option value="Success">Success</option>
          <option value="Rejected">Rejected</option>
        </select>

        <Button 
          onClick={onRefresh}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <RotateCcw size={18} />
          <span className="hidden sm:inline">Refresh Logs</span>
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;