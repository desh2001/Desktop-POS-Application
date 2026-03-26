import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Inventory from './Inventory';
import Settings from './Settings';
import Transactions from './Transactions';
import Users from './Users';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, Package, Settings as SettingsIcon, History, Users as UsersIcon } from 'lucide-react';

export default function AdminLayout() {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 border-r border-slate-200 flex flex-col items-center py-8">
        <h2 className="text-xl font-bold mb-8 text-white">Admin Dashboard</h2>
        <nav className="w-full">
          <Link to="/admin" className="flex items-center px-6 py-3 border-b border-t border-slate-700 hover:bg-slate-800 text-white font-medium">
            <Package className="mr-3" size={20} />
            Inventory
          </Link>
          <Link to="/admin/transactions" className="flex items-center px-6 py-3 border-b border-slate-700 hover:bg-slate-800 text-white font-medium">
            <History className="mr-3" size={20} />
            Transactions
          </Link>
          <Link to="/admin/users" className="flex items-center px-6 py-3 border-b border-slate-700 hover:bg-slate-800 text-white font-medium">
            <UsersIcon className="mr-3" size={20} />
            Users
          </Link>
          <Link to="/admin/settings" className="flex items-center px-6 py-3 border-b border-slate-700 hover:bg-slate-800 text-white font-medium">
            <SettingsIcon className="mr-3" size={20} />
            Settings
          </Link>
        </nav>
        <div className="mt-auto w-full">
          <button onClick={handleLogout} className="flex w-full items-center px-6 py-3 hover:bg-red-500 text-red-400 hover:text-white font-medium mt-auto transition-colors">
            <LogOut className="mr-3" size={20} />
            Logout
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Inventory />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
