import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Inventory from './Inventory';
import Settings from './Settings';
import Transactions from './Transactions';
import Users from './Users';
import Reports from './Reports';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, Package, Settings as SettingsIcon, History, Users as UsersIcon, BarChart3, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function AdminLayout() {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper to check active route for styling
  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }: { to: string, icon: any, children: React.ReactNode }) => (
    <Link 
      to={to} 
      className={`flex items-center px-6 py-4 mx-4 my-1 rounded-2xl transition-all duration-300 group ${
        isActive(to) 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className={`mr-4 transition-transform duration-300 ${isActive(to) ? 'scale-110' : 'group-hover:scale-110'}`} size={20} />
      <span className="text-xs font-black uppercase tracking-[0.15em]">{children}</span>
    </Link>
  );

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* SIDEBAR: GLASS PANEL */}
      <aside className="w-72 bg-slate-950/40 backdrop-blur-2xl border-r border-white/10 flex flex-col relative z-20">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">PC <span className="text-blue-500">LK</span></h2>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-11">Control Center</p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavLink to="/admin" icon={Package}>Inventory</NavLink>
          
          {['Admin', 'Stock Manager'].includes(user?.role || '') && (
            <>
              <NavLink to="/admin/transactions" icon={History}>Transactions</NavLink>
              <NavLink to="/admin/reports" icon={BarChart3}>Analytics</NavLink>
            </>
          )}
          
          {user?.role === 'Admin' && (
            <>
              <div className="mx-8 my-6 h-[1px] bg-white/5 relative">
                <span className="absolute inset-y-0 left-0 -top-2 px-2 bg-[#121b2e] text-[8px] font-black text-slate-600 uppercase tracking-widest">System</span>
              </div>
              <NavLink to="/admin/users" icon={UsersIcon}>Personnel</NavLink>
              <NavLink to="/admin/settings" icon={SettingsIcon}>Preferences</NavLink>
            </>
          )}
        </nav>

        {/* User Profile Summary */}
        <div className="p-6 m-4 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs">
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">{user?.username || 'Administrator'}</p>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{user?.role || 'Root'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 group cursor-pointer"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Header Bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Management Console</span>
            <span className="text-slate-700 mx-2">/</span>
            <span className="text-xs font-black text-white uppercase tracking-widest">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Server: Linked
            </span>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Inventory />} />
              {['Admin', 'Stock Manager'].includes(user?.role || '') && (
                <>
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/reports" element={<Reports />} />
                </>
              )}
              {user?.role === 'Admin' && (
                <>
                  <Route path="/users" element={<Users />} />
                  <Route path="/settings" element={<Settings />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}