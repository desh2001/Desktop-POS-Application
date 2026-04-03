import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { KeyRound, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import logoSvg from '../assets/logo icon.svg';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!(window as any).api) throw new Error("IPC context bridge (window.api) is completely missing! Preload script failed.");
      if (!(window as any).api.auth) throw new Error("Auth API is missing from the bridge.");

      const response = await (window as any).api.auth.login({ username, password });
      
      if (response.success) {
        login(response.user);
        navigate(['Admin', 'Stock Manager'].includes(response.user.role) ? '/admin' : '/cashier');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      console.error(err);
      setError("System Exception: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
      
      {/* MODERN DYNAMIC BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-25"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[160px]"></div>

      {/* MAIN GLASS CONTAINER */}
      <div className="relative z-10 w-full max-w-[1000px] h-[650px] flex m-4 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-md bg-white/5">
        
        {/* LEFT SIDE: BRANDING (Modern Blur) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 bg-gradient-to-br from-white/5 to-transparent border-r border-white/10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-500 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000"></div>
            <img src={logoSvg} alt="Company Logo" className="relative w-48 h-auto mb-8 drop-shadow-2xl transition-transform duration-700 hover:scale-105" />
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tracking-tighter mb-2 uppercase">PC ZONE</h1>
          <p className="text-blue-400 font-medium tracking-[0.3em] text-xs uppercase opacity-80">{import.meta.env.VITE_STORE_MOTTO || "The Master's Choice"}</p>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-16 bg-slate-950/40">
          
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
               <ShieldCheck className="text-blue-500 w-5 h-5" />
               <span className="text-blue-500 font-bold text-xs uppercase tracking-widest">Secure Access</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-sm">Please enter your system credentials.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-xs font-semibold backdrop-blur-md animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Passkey</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all mt-6 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verifying...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Decoration */}
          <div className="mt-auto pt-8 flex justify-center">
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Terminal Version 2.0.4</p>
          </div>
        </div>

      </div>
    </div>
  );
}