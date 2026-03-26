import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Receipt, MapPin, Phone, Mail, Hash, User } from 'lucide-react';
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
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
        }
        .pattern-bg {
          background-image: radial-gradient(#e2e8f0 0.5px, transparent 0.5px);
          background-size: 12px 12px;
        }
      `}</style>

      <div className="w-[794px] h-[1123px] bg-white mx-auto flex flex-col box-border overflow-hidden pattern-bg" id="pdf-content">
        {/* Top Decorative Line */}
        <div className="h-4 w-full bg-slate-900 shrink-0"></div>
        
        <div className="flex-1 flex flex-col p-12 pt-10">
          
          {/* Header Section */}
          <div className="flex justify-between items-end mb-12 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center p-3">
                <img src={logo} alt="Store Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{storeName}</h1>
                <p className="text-primary-600 font-extrabold tracking-[0.2em] uppercase text-[10px] mt-1">
                  {import.meta.env.VITE_STORE_MOTTO || 'PREMIUM QUALITY SERVICE'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-1">Document Status</span>
              <div className="inline-block bg-primary-600 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {isQuote ? 'Quotation' : 'Official Invoice'}
              </div>
            </div>
          </div>

          <hr className="border-slate-100 mb-8" />

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-6 mb-10 shrink-0">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} className="text-primary-500" /> Billed To
              </h4>
              <p className="text-md font-bold text-slate-800">Walk-in Customer</p>
              <p className="text-slate-500 text-xs">Standard Retail Channel</p>
            </div>
            
            <div className="space-y-1 border-x border-slate-100 px-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Hash size={12} className="text-primary-500" /> Reference
              </h4>
              <p className="text-md font-bold text-slate-800 uppercase">#{sale._id.toString().slice(-8)}</p>
              <p className="text-slate-500 text-xs">{new Date(sale.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-1 text-right">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-end items-center gap-2">
                <Calendar size={12} className="text-primary-500" /> Timestamp
              </h4>
              <p className="text-md font-bold text-slate-800">
                {new Date(sale.createdAt).toLocaleDateString()} <span className="text-slate-400 text-sm ml-1">{new Date(sale.createdAt).toLocaleTimeString()}</span>
              </p>
              <p className="text-slate-500 text-xs">Terminal ID: {sale.workerId ? sale.workerId.toString().slice(-4).toUpperCase() : 'MAIN'}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 shrink-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="py-4 px-6 font-black text-slate-500 text-[10px] uppercase tracking-widest">Description</th>
                  <th className="py-4 px-6 text-center font-black text-slate-500 text-[10px] uppercase tracking-widest w-24">Quantity</th>
                  <th className="py-4 px-6 text-right font-black text-slate-500 text-[10px] uppercase tracking-widest w-32">Unit Price</th>
                  <th className="py-4 px-6 text-right font-black text-slate-500 text-[10px] uppercase tracking-widest w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item: any, i: number) => (
                  <tr key={i} className="group">
                    <td className="py-4 px-6">
                      <p className="text-slate-800 font-bold text-sm">{item.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Product Code: SK-{i+100}</p>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-700 font-bold text-sm">{item.quantity}</td>
                    <td className="py-4 px-6 text-right text-slate-500 font-medium text-sm">${item.price.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex-1"></div> {/* Pushes content to bottom */}

          {/* Summary Section with Signature & QR */}
          <div className="flex justify-between items-end mb-10 shrink-0 gap-4">
            {/* Left Side: QR & Terms */}
            <div className="flex gap-4 items-center w-[280px] shrink-0">
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm shrink-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${sale._id}`} 
                  alt="Transaction QR" 
                  className="w-12 h-12 opacity-80"
                />
                <p className="text-[6px] text-center mt-1 font-black text-slate-400 uppercase tracking-tighter">Scan to Verify</p>
              </div>
              
              <div className="text-[8px] text-slate-400 font-medium leading-tight pb-1">
                <p className="uppercase tracking-widest font-black text-slate-500 mb-1">Notice</p>
                <p>Digital record of sale. This document is system generated and remains valid without a physical stamp.</p>
              </div>
            </div>

            {/* Middle: Signature Area */}
            <div className="flex-1 px-4 text-center shrink-0 mb-1">
              <div className="border-b border-slate-300 w-24 mx-auto mb-1.5 h-8 flex items-end justify-center">
                <span className="font-serif italic text-slate-400 text-xs opacity-50">Deshan</span>
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Store Manager</p>
            </div>

            {/* Right Side: Totals */}
            <div className="w-[260px] shrink-0 bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-tighter">Subtotal</span>
                  <span className="text-slate-800">${sale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold border-b border-slate-200 pb-2">
                  <span className="text-slate-400 uppercase tracking-tighter">Tax (VAT)</span>
                  <span className="text-slate-800">${sale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] font-black text-slate-900 uppercase">Total Amount</span>
                  <span className="text-lg font-black text-primary-600">${sale.total.toFixed(2)}</span>
                </div>
              </div>

              {!isQuote && (
                <div className="bg-white rounded-xl p-2.5 shadow-sm flex justify-between items-center mt-1">
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase">Change</p>
                    <p className="text-sm font-black text-emerald-600">${(sale.change || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] font-black text-slate-400 uppercase">Status</p>
                    <p className="text-[9px] font-bold text-slate-800 uppercase tracking-tight">Paid in Full</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <div className="bg-slate-900 p-8 shrink-0 relative overflow-hidden">
          {/* Subtle Geometric Background Overlay */}
          <div className="absolute top-0 right-0 w-64 h-full bg-primary-500 opacity-[0.03] -skew-x-12 translate-x-20"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="h-10 w-1 bg-primary-500 rounded-full"></div>
               <div>
                 <p className="text-white font-black text-md tracking-tight">Thank you for choosing {storeName}!</p>
                 <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
               </div>
            </div>
            
            <div className="flex gap-6 border-l border-slate-800 pl-8">
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-primary-500 mb-0.5">
                   <Phone size={10} />
                   <p className="font-black text-[8px] uppercase tracking-widest">Support</p>
                </div>
                <p className="text-white text-[11px] font-bold">{import.meta.env.VITE_BILL_PHONE_NUMBER || '+1 234 567 890'}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-primary-500 mb-0.5">
                   <Mail size={10} />
                   <p className="font-black text-[8px] uppercase tracking-widest">Email</p>
                </div>
                <p className="text-white text-[11px] font-bold lowercase">{import.meta.env.VITE_BILL_EMAIL_ADDRESS || 'support@pos.com'}</p>
              </div>
            </div>
          </div>
        </div>  
        </div>
      
    </>
  );
}