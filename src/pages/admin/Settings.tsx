import React, { useState, useEffect } from 'react';

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
    if (sn.value) setStoreName(sn.value);
    if (tr.value) setTaxRate(tr.value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await (window as any).api.settings.setSetting('storeName', storeName);
    await (window as any).api.settings.setSetting('taxRate', taxRate);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-1">Configure global application preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Store Information</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Store Name</label>
                <input 
                  type="text" 
                  value={storeName} 
                  onChange={e => setStoreName(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                  placeholder="Store Name" 
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Financial Setup</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Default Tax Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={taxRate} 
                  onChange={e => setTaxRate(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                  placeholder="0.0" 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              {saved && <span className="text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg text-sm">Settings saved successfully!</span>}
            </div>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm cursor-pointer">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
