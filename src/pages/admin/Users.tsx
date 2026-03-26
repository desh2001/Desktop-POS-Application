import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Shield, User, Users as UsersIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Users() {
  const currentUser = useAuthStore(state => state.user);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ _id: '', username: '', password: '', role: 'Worker' });
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
    
    // Validate empty passwords safely on creation
    if (!payload._id && !payload.password) {
       setError("Password is required for new accounts");
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
       alert("You cannot delete your own active Admin account!");
       return;
    }
    if (confirm("Are you sure you want to permanently delete this user?")) {
      await (window as any).api.users.deleteUser(id);
      loadUsers();
    }
  };

  const openModal = (user?: any) => {
    setError(null);
    if (user) {
      setFormData({ _id: user._id, username: user.username, password: '', role: user.role || 'Worker' });
    } else {
      setFormData({ _id: '', username: '', password: '', role: 'Worker' });
    }
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <UsersIcon size={26} className="text-primary-600"/> User Management
        </h1>
        <button onClick={() => openModal()} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center font-bold shadow-md">
          <Plus size={18} className="mr-2" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="p-4 uppercase text-xs font-black tracking-widest">Employee ID</th>
              <th className="p-4 uppercase text-xs font-black tracking-widest">Username</th>
              <th className="p-4 uppercase text-xs font-black tracking-widest">Privilege Role</th>
              <th className="p-4 text-center uppercase text-xs font-black tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-500 font-mono text-sm uppercase">#{u._id.toString().slice(-8)}</td>
                <td className="p-4 font-bold text-slate-800 text-md">{u.username} {currentUser.id === u._id && <span className="text-[10px] ml-2 text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest flex items-center w-max gap-1.5 ${u.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role === 'Admin' ? <Shield size={12}/> : <User size={12}/>}
                    {u.role || 'Worker'}
                  </span>
                </td>
                <td className="p-4 flex justify-center space-x-4">
                  <button onClick={() => openModal(u)} className="text-primary-500 hover:text-primary-700"><Edit size={18} strokeWidth={2.5}/></button>
                  <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} strokeWidth={2.5}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-6 text-slate-800">{formData._id ? 'Edit Employee Account' : 'Register New Employee'}</h2>
            
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">System Username</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none shadow-sm"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                   {formData._id ? 'Reset Password (optional)' : 'Secure Password'}
                </label>
                <input type="password" placeholder={formData._id ? "Leave blank to keep current" : ""} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none shadow-sm"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Authorization Level</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none shadow-sm cursor-pointer">
                  <option value="Worker">Cashier / Worker</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-md active:scale-95 transition-all">Saves Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
