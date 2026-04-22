import React, { useState, useEffect, useCallback } from 'react';

export default function UserManagement({ user }) {
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ email: '', name: '', role: 'STAFF', division: 'HR' });
  const [isLoading, setIsLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = usersList.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: selectedRole,
      division: selectedRole === 'SUPER_ADMIN' ? 'IT' : prev.division
    }));
  };

  const handleEditClick = (targetUser) => {
    setEditingUserId(targetUser.id);
    setFormData({
      email: targetUser.email || '',
      name: targetUser.name || '',
      role: targetUser.role || 'STAFF',
      division: targetUser.division || 'HR'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setFormData({ email: '', name: '', role: 'STAFF', division: 'HR' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { ...formData, admin_id: user.email || user.username };
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
        cancelEdit();
        fetchUsers();
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
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter transition-colors">
            User <span className="text-red-600">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase tracking-[0.3em] mt-1">
            Identity & Access Control Center
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Total: {usersList.length} Accounts
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* --- KOLOM KIRI: FORM --- */}
        <div className="xl:col-span-1 h-fit bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md sticky top-6">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {editingUserId ? "Update Privilege" : "Grant New Access"}
              </h3>
            </div>
            {editingUserId && (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                <span className="text-[8px] font-bold text-amber-600 dark:text-amber-500 uppercase">Edit Mode</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input 
                type="text" required placeholder="e.g. Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={editingUserId !== null}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-sm disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Workspace</label>
              <input 
                type="email" required placeholder="e.g. budi@radikari.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={editingUserId !== null}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-sm disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Role</label>
                <select 
                  value={formData.role} onChange={handleRoleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
                >
                  <option value="STAFF">Staff</option>
                  <option value="SPV">Supervisor</option>
                  <option value="SUPER_ADMIN">Admin IT</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Divisi</label>
                <select 
                  value={formData.division}
                  onChange={(e) => setFormData({...formData, division: e.target.value})}
                  disabled={formData.role === 'SUPER_ADMIN'} 
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-sm disabled:opacity-40"
                >
                  <option value="HR">HR</option>
                  <option value="FINANCE">Finance</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="IT">IT</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                type="submit" disabled={isLoading}
                className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
              >
                {isLoading ? 'Processing...' : (editingUserId ? 'Confirm Update' : 'Initialize Account')}
              </button>
              
              {editingUserId && (
                <button 
                  type="button" onClick={cancelEdit}
                  className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancel Operation
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- KOLOM KANAN: DAFTAR USER --- */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900/40 p-2 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md">
            <div className="pl-4 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by name or email identity..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-0 py-4 pr-4 placeholder:text-slate-400"
            />
          </div>

          <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Division</th>
                    <th className="px-8 py-6">Privilege</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">{u.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">{u.email}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                            {u.division}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            u.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                            u.role === 'SPV' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' :
                            'bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-500 dark:border-white/10'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => handleEditClick(u)}
                            disabled={u.username === 'Admin'}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-0"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                        Zero subjects found in database.
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