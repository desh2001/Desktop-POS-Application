import { useState, useEffect } from 'react';
import { History, Receipt, X, PackageOpen, MousePointerClick, ShieldAlert, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Transactions() {
  const user = useAuthStore(state => state.user);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const res = await (window as any).api.sales.getSales();
      if (res.success) setSales(res.sales);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-4">
            Digital <span className="text-blue-500">Ledger</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <Activity size={14} className="text-blue-500"/> System Transaction Log
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MousePointerClick size={12} className="text-blue-500"/> Select row for e-receipt
          </p>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Syncing Database...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference ID</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Timestamp</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Volume</th>
                {user?.role === 'Admin' && <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>}
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sales.map(sale => (
                <tr 
                  key={sale._id} 
                  onClick={() => setSelectedSale(sale)}
                  className="hover:bg-white/[0.03] cursor-pointer transition-all group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Receipt size={16} />
                      </div>
                      <span className="font-mono text-sm font-bold text-white tracking-wider">
                        #{sale._id.toString().slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-black text-blue-400 uppercase tracking-widest">
                      {sale.items.length} Units
                    </span>
                  </td>
                  {user?.role === 'Admin' && (
                    <td className="p-6 text-right">
                      <span className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                        ${sale.total.toFixed(2)}
                      </span>
                    </td>
                  )}
                  <td className="p-6 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        Verified
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 5 : 4} className="p-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <History size={48} className="mb-4 text-slate-400" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Logs Detected</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* RECEIPT MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
                  <Receipt size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">System <span className="text-blue-500">Receipt</span></h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                    <Calendar size={12}/> {new Date(selectedSale.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSale(null)} 
                className="p-3 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-red-500/30"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scanned Items */}
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <PackageOpen size={16} className="text-blue-500"/> Itemized Distribution
                </h3>
                <span className="text-xs font-mono text-blue-500 font-bold opacity-60">ID: #{selectedSale._id.slice(-12).toUpperCase()}</span>
              </div>
              
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset Name</th>
                      <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Qty</th>
                      {user?.role === 'Admin' && (
                        <>
                          <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Unit</th>
                          <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Extended</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedSale.items.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 text-xs font-bold text-white uppercase tracking-wider">{item.name}</td>
                        <td className="p-4 text-xs font-black text-blue-400 text-center">{item.quantity}</td>
                        {user?.role === 'Admin' && (
                          <>
                            <td className="p-4 text-xs text-slate-500 font-bold text-right">${item.price.toFixed(2)}</td>
                            <td className="p-4 text-xs font-black text-white text-right">${(item.price * item.quantity).toFixed(2)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer: Totals */}
            <div className="p-10 bg-slate-900 border-t border-white/10">
              {user?.role === 'Admin' ? (
                <div className="max-w-xs ml-auto space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Base Value</span>
                    <span className="text-slate-300">${selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest pb-3 border-b border-white/10">
                    <span>Service Tax</span>
                    <span className="text-slate-300">${selectedSale.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Total Credits</span>
                    <span className="text-3xl font-black text-white leading-none">
                      <span className="text-sm opacity-30 mr-1">$</span>{selectedSale.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                  <ShieldAlert size={20} className="text-red-500/50 mb-2" />
                  <p className="text-[9px] font-black text-red-500/50 uppercase tracking-[0.2em]">Financial Data Restricted</p>
                </div>
              )}
              
              <button 
                onClick={() => setSelectedSale(null)}
                className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-white/10 transition-all cursor-pointer"
              >
                Close Connection
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}