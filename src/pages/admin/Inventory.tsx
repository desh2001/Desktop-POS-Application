import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';

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
    if (confirm("Are you sure?")) {
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
        <button onClick={() => openModal()} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center font-medium shadow-md">
          <Plus size={18} className="mr-2" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item._id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{item.name}</td>
                <td className="p-4 text-slate-500">{item.category}</td>
                <td className="p-4 text-slate-800 font-semibold">${item.price.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {item.stock}
                  </span>
                </td>
                <td className="p-4 flex justify-center space-x-3">
                  <button onClick={() => openModal(item)} className="text-primary-500 hover:text-primary-700"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">No items found. Click 'Add Item' to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-slate-800">{formData._id ? 'Edit Item' : 'New Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 outline-none"/>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold shadow-md">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
