import React, { useState, useEffect } from 'react';
import { Save, Globe, Percent, Store, Settings as SettingsIcon, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const [storeName, setStoreName] = useState('My POS');
  const [taxRate, setTaxRate] = useState('0');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const sn = await (window as any).api.settings.getSetting('storeName');
    const tr = await (window as any).api.settings.getSetting('taxRate');
    if (sn?.value) setStoreName(sn.value);
    if (tr?.value) setTaxRate(tr.value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await (window as any).api.settings.setSetting('storeName', storeName);
    await (window as any).api.settings.setSetting('taxRate', taxRate);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-4">
            System <span className="text-blue-500">Core</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <SettingsIcon size={14} className="text-blue-500"/> Global Application Configuration
          </p>
        </div>
      </div>

      {/* MAIN CONFIGURATION PANEL */}
      <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="bg-white/[0.02] p-6 border-b border-white/5">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-500" /> Administrative Parameters
          </h2>
        </div>

        <form onSubmit={handleSave} className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Store Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                  <Store size={20} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Brand Identity</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal Alias (Store Name)</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={storeName} 
                    onChange={e => setStoreName(e.target.value)} 
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-700" 
                    placeholder="Enter Store Name" 
                  />
                </div>
              </div>
            </div>

            {/* Financial Setup */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Percent size={20} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Revenue Protocols</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Taxation Index (%)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black group-focus-within:text-emerald-500 transition-colors">%</div>
                  <input 
                    type="number" 
                    step="0.1"
                    value={taxRate} 
                    onChange={e => setTaxRate(e.target.value)} 
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold" 
                    placeholder="0.0" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Footer */}
          <div className="pt-8 mt-4 border-t border-white/5 flex items-center justify-between">
            <div className="h-10 flex items-center">
              {saved && (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                  <CheckCircle size={16} /> Data Commited
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95 cursor-pointer"
            >
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              Push Changes
            </button>
          </div>
        </form>
      </div>

      {/* SYSTEM INFO DECORATION */}
      <div className="flex justify-center opacity-30">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">System Core v2.0.4 • Local Interface</p>
      </div>
    </div>
  );
}