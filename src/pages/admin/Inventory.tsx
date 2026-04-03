import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Box, Tag, DollarSign, BarChart2, X } from 'lucide-react';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ _id: '', name: '', price: 0, stock: 0, category: 'General' });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const response = await (window as any).api.inventory.getItems();
    if (response.success) {
      setItems(response.items);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { _id, ...submitData } = formData;
    if (_id) {
      await (window as any).api.inventory.updateItem(_id, { _id, ...submitData });
    } else {
      await (window as any).api.inventory.addItem(submitData);
    }
    setShowModal(false);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      await (window as any).api.inventory.deleteItem(id);
      loadItems();
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ _id: '', name: '', price: 0, stock: 0, category: 'General' });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Inventory <span className="text-blue-500">Vault</span></h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Manage system resources and stock levels</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} className="mr-2" /> Add New Artifact
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Name</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Price</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reserve Status</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Box size={20} />
                    </div>
                    <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">
                    {item.category}
                  </span>
                </td>
                <td className="p-6">
                  <span className="text-lg font-black text-white">${item.price.toFixed(2)}</span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.stock > 10 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                    <span className={`text-sm font-black ${item.stock > 10 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.stock} <span className="text-[10px] opacity-50 uppercase tracking-tighter">In Stock</span>
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => openModal(item)} className="p-2.5 bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-xl transition-all cursor-pointer border border-transparent hover:border-blue-500/30">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/30">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center opacity-20">
                    <Box size={48} className="mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Vault Empty</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DESIGN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] p-10 w-[450px] shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {formData._id ? 'Update' : 'Initialize'} <span className="text-blue-500">Asset</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Artifact Name</label>
                <div className="relative">
                  <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold" placeholder="e.g. RTX 5090 Super"/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Classification</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-bold" placeholder="Hardware / Peripheral"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Credits ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-bold"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reserve Qty</label>
                  <div className="relative">
                    <BarChart2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-bold"/>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 rounded-2xl transition-all cursor-pointer">Abort</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-900/20 transition-all active:scale-95 cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}