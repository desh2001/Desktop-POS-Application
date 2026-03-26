import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Inventory from './Inventory';
import Settings from './Settings';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, Package, Settings as SettingsIcon } from 'lucide-react';

export default function AdminLayout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="" className="flex items-center gap-3 px-4 py-3 text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <Package size={20} className="text-primary-600" />
            <span className="font-medium">Inventory</span>
          </Link>
          <Link to="settings" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
            <SettingsIcon size={20} className="text-slate-500" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer font-medium">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-50/50">
        <Routes>
          <Route path="/" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
