import React, { useState, useEffect } from 'react';
import { History, Receipt, X, PackageOpen, MousePointerClick } from 'lucide-react';

export default function Transactions() {
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
             <History size={26} className="text-primary-600"/> Transaction History
           </h1>
           <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm"><MousePointerClick size={14}/> Click on any transaction row to view the detailed electronic receipt.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
           <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Loading transaction database...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 uppercase text-xs font-black tracking-widest">Transaction ID</th>
                <th className="p-4 uppercase text-xs font-black tracking-widest">Date & Time</th>
                <th className="p-4 uppercase text-xs font-black tracking-widest text-center">Items Sold</th>
                <th className="p-4 uppercase text-xs font-black tracking-widest text-right">Revenue</th>
                <th className="p-4 uppercase text-xs font-black tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map(sale => (
                <tr 
                  key={sale._id} 
                  onClick={() => setSelectedSale(sale)}
                  className="hover:bg-primary-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 font-bold text-slate-800 font-mono text-sm flex items-center gap-2">
                     <Receipt size={14} className="text-slate-400 group-hover:text-primary-600 transition-colors"/>
                     #{sale._id.toString().slice(-8).toUpperCase()}
                  </td>
                  <td className="p-4 text-slate-500 text-sm font-medium">
                    {new Date(sale.createdAt).toLocaleDateString()} <span className="text-slate-400 ml-1 text-xs">{new Date(sale.createdAt).toLocaleTimeString()}</span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm font-bold text-center group-hover:text-primary-700">
                    {sale.items.length} Product(s)
                  </td>
                  <td className="p-4 text-emerald-600 font-black text-right text-base">${sale.total.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">Verified</span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No sales transactions have been recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Transaction Details Modal Overlay */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-0 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <span className="p-2 bg-primary-100 text-primary-600 rounded-lg"><Receipt size={20} /></span> 
                  Internal e-Receipt #{selectedSale._id.toString().slice(-8).toUpperCase()}
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-2">
                  Processed on {new Date(selectedSale.createdAt).toLocaleDateString()} at {new Date(selectedSale.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSale(null)} 
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} className="stroke-[3]" />
              </button>
            </div>
            
            {/* Modal Body: Scanned Items List */}
            <div className="p-8 overflow-y-auto flex-1 bg-white">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <PackageOpen size={16} className="text-slate-400"/> Scanned Itemized List
              </h3>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-20">Qty</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-24">Unit Price</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSale.items.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-4 text-sm font-bold text-slate-800">{item.name}</td>
                        <td className="p-4 text-sm font-black text-slate-600 text-center bg-slate-50/30">{item.quantity}</td>
                        <td className="p-4 text-sm text-slate-500 font-medium text-right">${item.price.toFixed(2)}</td>
                        <td className="p-4 text-sm font-black text-slate-900 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer: Totals */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="w-80 ml-auto bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex justify-between text-sm text-slate-500 font-medium mb-2">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold">${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 font-medium pb-4 border-b border-slate-100">
                  <span>Tax (Calculated)</span>
                  <span className="text-slate-800 font-bold">${selectedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Value</span>
                  <span className="text-2xl font-black text-primary-600 flex items-center gap-1">
                    <span className="text-sm font-bold text-primary-400">$</span>{selectedSale.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
