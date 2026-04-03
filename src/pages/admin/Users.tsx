import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Shield, User, Users as UsersIcon, Package, Key, X, Fingerprint } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Users() {
  const currentUser = useAuthStore(state => state.user);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ _id: '', username: '', password: '', role: 'Employee' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const response = await (window as any).api.users.getUsers();
    if (response.success) {
      setUsers(response.users);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let payload = { ...formData };
    
    if (!payload._id && !payload.password) {
        setError("Security credentials (password) are required for new accounts");
        return;
    }

    let result;
    if (payload._id) {
      result = await (window as any).api.users.updateUser(payload._id, payload);
    } else {
      result = await (window as any).api.users.addUser(payload);
    }

    if (result.success) {
        setShowModal(false);
        loadUsers();
    } else {
        setError(result.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser.id) {
        alert("Security Override Denied: You cannot delete your own active Admin account!");
        return;
    }
    if (confirm("Are you sure you want to permanently revoke access for this user?")) {
      await (window as any).api.users.deleteUser(id);
      loadUsers();
    }
  };

  const openModal = (user?: any) => {
    setError(null);
    if (user) {
      setFormData({ _id: user._id, username: user.username, password: '', role: user.role || 'Employee' });
    } else {
      setFormData({ _id: '', username: '', password: '', role: 'Employee' });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-4">
            Personnel <span className="text-blue-500">Registry</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <Fingerprint size={14} className="text-blue-500"/> System Authorization & Access Control
          </p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} className="mr-2" /> Register Personnel
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee UID</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Privilege Level</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6 font-mono text-[11px] font-bold text-slate-500 uppercase">
                   #{u._id.toString().slice(-8)}
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-black">
                       {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      {u.username}
                      {currentUser.id === u._id && (
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">Current Admin</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center w-max gap-2 border ${
                    u.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                    u.role === 'Stock Manager' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {u.role === 'Admin' ? <Shield size={12}/> : u.role === 'Stock Manager' ? <Package size={12}/> : <User size={12}/>}
                    {u.role || 'Employee'}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => openModal(u)} className="p-2.5 bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-xl transition-all cursor-pointer border border-transparent hover:border-blue-500/30">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(u._id)} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/30">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4">
          <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {formData._id ? 'Update' : 'Register'} <span className="text-blue-500">Personnel</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-6 text-[11px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-2xl uppercase tracking-wider animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Handle</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold" placeholder="e.g. j.doe"/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {formData._id ? 'Reset Security Key (optional)' : 'Security Key'}
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="password" placeholder={formData._id ? "Leave empty to keep current" : "••••••••"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-bold"/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Authorization Protocol</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-bold appearance-none cursor-pointer">
                    <option value="Employee" className="bg-slate-900">Employee (Cashier)</option>
                    <option value="Stock Manager" className="bg-slate-900">Stock Manager</option>
                    <option value="Admin" className="bg-slate-900">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 rounded-2xl transition-all cursor-pointer">Abort</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-900/20 transition-all active:scale-95 cursor-pointer">
                  Commit Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}