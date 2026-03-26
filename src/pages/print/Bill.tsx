import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Receipt, MapPin, Phone, Mail } from 'lucide-react';
import logo from '../../assets/logo icon.svg';

export default function Bill() {
  const { type } = useParams();
  const [sale, setSale] = useState<any>(null);
  const [storeName, setStoreName] = useState('Your Company Name');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!(window as any).api) {
        setError("IPC Preload Bridge Missing from PDF Window.");
        return;
      }
      
      const sn = await (window as any).api.settings.getSetting('storeName');
      if (sn?.value) setStoreName(sn.value);
      
      const res = await (window as any).api.sales.getSales();
      if (res.success && res.sales.length > 0) {
        setSale(res.sales[0]);
      } else {
        setError("No sales found to print.");
      }
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  if (error) return <div className="p-10 text-red-600 font-bold text-center">Error: {error}</div>;
  if (!sale) return <div className="p-20 text-center text-slate-500 text-xl font-medium animate-pulse">Generating Document...</div>;

  const isQuote = type === 'quote';

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>
      <div className="w-[794px] min-h-[1040px] bg-white mx-auto flex flex-col box-border overflow-hidden" id="pdf-content">
        {/* Top Accent Bar */}
      <div className="h-3 w-full bg-gradient-to-r from-primary-600 to-primary-400 shrink-0"></div>
      
      <div className="flex-1 flex flex-col p-10 pt-8 pb-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center p-2">
              <img src={logo} alt="Store Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{storeName}</h1>
              <p className="text-primary-600 font-bold tracking-wide uppercase text-xs mt-1">{import.meta.env.VITE_STORE_MOTTO || 'SHOP MOTTO HERE'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase shadow-sm">
              {isQuote ? 'Quotation' : 'Tax Invoice'}
            </div>
            <p className="text-slate-500 text-sm mt-2 font-semibold">BILL-{sale._id.toString().slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-2 gap-6 mb-8 shrink-0">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Receipt size={14} /> Bill To
            </h3>
            <p className="text-lg font-bold text-slate-800 leading-tight">Walk-in Customer</p>
            <p className="text-slate-500 text-sm mt-0.5">General Retail Client</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
              <MapPin size={12} className="text-slate-400"/> In-Store Purchase
            </div>
          </div>

          <div className="bg-primary-50/40 p-5 rounded-xl border border-primary-100/50">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={14} /> Transaction Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Issue Date:</span>
                <span className="font-semibold text-slate-800">{new Date(sale.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Issue Time:</span>
                <span className="font-semibold text-slate-800">{new Date(sale.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Cashier ID:</span>
                <span className="font-semibold text-slate-800">USR-{sale.workerId ? sale.workerId.toString().slice(-4).toUpperCase() : 'SYS'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden mb-6 shrink-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-5 font-bold text-slate-700 text-xs uppercase tracking-wider">Item Description</th>
                <th className="py-3 px-5 text-center font-bold text-slate-700 text-xs uppercase tracking-wider w-20">Qty</th>
                <th className="py-3 px-5 text-right font-bold text-slate-700 text-xs uppercase tracking-wider w-28">Price</th>
                <th className="py-3 px-5 text-right font-bold text-slate-700 text-xs uppercase tracking-wider w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items.map((item: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                  <td className="py-3 px-5 text-slate-800 font-semibold text-sm">{item.name}</td>
                  <td className="py-3 px-5 text-center text-slate-600 font-bold text-sm">{item.quantity}</td>
                  <td className="py-3 px-5 text-right text-slate-500 font-medium text-sm">${item.price.toFixed(2)}</td>
                  <td className="py-3 px-5 text-right font-bold text-slate-800 text-sm">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Flexible spacer to exactly pin the totals to bottom before footer */}
        <div className="flex-1"></div>

        {/* Totals Section */}
        <div className="flex justify-end shrink-0 mb-8 mt-4">
          <div className="w-[320px] space-y-1.5">
            <div className="flex justify-between py-1.5 px-3 text-slate-600 text-sm">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-slate-800">${sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 px-3 text-slate-600 text-sm border-b border-slate-200">
              <span className="font-medium">Tax</span>
              <span className="font-bold text-slate-800">${sale.tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 px-4 text-lg bg-slate-900 text-white rounded-xl mt-3 shadow-sm">
              <span className="font-black">Grand Total</span>
              <span className="font-black text-primary-400 text-xl">${sale.total.toFixed(2)}</span>
            </div>

            {!isQuote && (
              <div className="bg-slate-50 rounded-xl p-4 mt-3 border border-slate-200">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-500 font-medium">Cash Tendered</span>
                  <span className="text-slate-800 font-bold">${(sale.amountTendered || sale.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Change Due </span>
                  <span className="text-emerald-600 font-black">${(sale.change || 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-slate-900 border-t-4 border-primary-500 text-slate-400 py-6 px-10 flex justify-between items-center shrink-0">
        <div>
          <p className="font-bold text-white mb-0.5 text-sm">Thank you for your business!</p>
          <p className="text-xs">{isQuote ? 'This quotation is valid for 30 days.' : 'Please retain this receipt for your records.'}</p>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium"><Phone size={12} className="text-primary-400"/> {import.meta.env.VITE_BILL_PHONE_NUMBER || '+1 234 567 890'}</span>
          <span className="flex items-center gap-1.5 text-slate-300 font-medium"><Mail size={12} className="text-primary-400"/> {import.meta.env.VITE_BILL_EMAIL_ADDRESS || 'support@pos.com'}</span>
        </div>    
      </div>

    </div>
    </>
  );
}
