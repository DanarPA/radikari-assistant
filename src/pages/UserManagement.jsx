import React, { useState, useEffect, useCallback } from 'react';

export default function UserManagement({ user }) {
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State Form
  const [formData, setFormData] = useState({ email: '', name: '', role: 'STAFF', division: 'HR' });
  const [isLoading, setIsLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null); // Null = Mode Register, Ada ID = Mode Update

  // Fungsi untuk menarik data user dari backend
  const fetchUsers = useCallback(async () => {
    try {
      const adminId = user.email || user.username;
      const response = await fetch(`http://127.0.0.1:8000/api/users?admin_id=${adminId}`);
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setUsersList(data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    }
  }, [user]);

  // Panggil fetchUsers saat komponen pertama kali dimuat
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Logika Filter Pencarian
  const filteredUsers = usersList.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Kunci form divisi jika role Super Admin
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: selectedRole,
      division: selectedRole === 'SUPER_ADMIN' ? 'IT' : prev.division
    }));
  };

  // Klik tombol Edit di tabel
  const handleEditClick = (targetUser) => {
    setEditingUserId(targetUser.id);
    setFormData({
      email: targetUser.email || '',
      name: targetUser.name || '',
      role: targetUser.role || 'STAFF',
      division: targetUser.division || 'HR'
    });
    // Scroll otomatis ke form (opsional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Batalkan Edit
  const cancelEdit = () => {
    setEditingUserId(null);
    setFormData({ email: '', name: '', role: 'STAFF', division: 'HR' });
  };

  // Submit Form (Bisa untuk Register atau Update tergantung state editingUserId)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      admin_id: user.email || user.username 
    };

    const url = editingUserId 
      ? `http://127.0.0.1:8000/api/users/${editingUserId}` 
      : 'http://127.0.0.1:8000/api/users/register';
      
    const method = editingUserId ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        alert(data.message);
        cancelEdit(); // Reset form
        fetchUsers(); // Refresh tabel
      } else {
        alert(`Gagal: ${data.detail}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      <header>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
          User Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase tracking-widest mt-1">
          Identity & Access Control Center
        </p>
      </header>

      {/* GRID LAYOUT: KIRI (FORM), KANAN (TABEL) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* --- KOLOM KIRI: FORM --- */}
        <div className="xl:col-span-1 h-fit bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 rounded-[2rem] p-8 shadow-xl dark:shadow-black/20 backdrop-blur-md sticky top-6">
          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                {editingUserId ? "Update Access" : "Grant Access"}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                {editingUserId ? `Editing User #${editingUserId}` : "New Workspace Account"}
              </p>
            </div>
            {editingUserId && (
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input 
                type="text" required placeholder="e.g. Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={editingUserId !== null} // Kunci nama kalau lagi edit (asumsi nama gak berubah)
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Workspace</label>
              <input 
                type="email" required placeholder="e.g. budi@radikari.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={editingUserId !== null} // Kunci email saat edit (karena email sbg identity utama)
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Jabatan (Privilege)</label>
              <select 
                value={formData.role} onChange={handleRoleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all text-sm appearance-none"
              >
                <option value="STAFF">Staff</option>
                <option value="SPV">Supervisor (SPV)</option>
                <option value="SUPER_ADMIN">Super Admin (Khusus IT)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Divisi</label>
              <select 
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value})}
                disabled={formData.role === 'SUPER_ADMIN'} 
                className={`w-full px-4 py-3 rounded-xl border transition-all text-sm appearance-none ${
                  formData.role === 'SUPER_ADMIN' 
                  ? 'bg-slate-200 dark:bg-slate-800 border-transparent text-slate-500 cursor-not-allowed' 
                  : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30'
                }`}
              >
                <option value="HR">HR</option>
                <option value="FINANCE">Finance</option>
                <option value="MARKETING">Marketing</option>
                <option value="IT">IT</option>
              </select>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                type="submit" disabled={isLoading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
              >
                {isLoading ? 'Processing...' : (editingUserId ? 'Save Changes' : 'Register User')}
              </button>
              
              {editingUserId && (
                <button 
                  type="button" onClick={cancelEdit}
                  className="w-full py-3 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- KOLOM KANAN: DAFTAR USER --- */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Search Bar */}
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900/40 p-2 rounded-[1.5rem] border border-slate-200 dark:border-white/5 shadow-sm backdrop-blur-md">
            <div className="pl-4 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-0 py-3 pr-4"
            />
          </div>

          {/* Tabel Container */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-2xl dark:shadow-black/20 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-5">Identitas</th>
                    <th className="px-6 py-5">Divisi</th>
                    <th className="px-6 py-5">Jabatan</th>
                    <th className="px-6 py-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full text-xs font-semibold">
                            {u.division}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            u.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' :
                            u.role === 'SPV' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' :
                            'bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* Disable tombol edit jika mencoba edit akun Root IT Default agar tidak kacau */}
                          <button 
                            onClick={() => handleEditClick(u)}
                            disabled={u.username === 'Admin'}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Edit Role/Divisi"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">
                        Tidak ada data user yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}