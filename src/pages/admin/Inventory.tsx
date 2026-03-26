import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Item {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const res = await (window as any).api.inventory.getItems();
    if (res.success) setItems(res.items);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, price: Number(price), stock: Number(stock), category };
    
    if (editingItem) {
      await (window as any).api.inventory.updateItem(editingItem._id, data);
    } else {
      await (window as any).api.inventory.addItem(data);
    }
    
    setShowModal(false);
    loadItems();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this item?')) {
      await (window as any).api.inventory.deleteItem(id);
      loadItems();
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setStock('');
    setCategory('General');
    setEditingItem(null);
  };

  const openModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setPrice(item.price.toString());
      setStock(item.stock.toString());
      setCategory(item.category);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Inventory</h1>
          <p className="text-slate-500 mt-1">Manage your products and stock levels.</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm cursor-pointer">
          <Plus size={20} /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm tracking-wide">
              <th className="p-4 font-semibold uppercase">Product Name</th>
              <th className="p-4 font-semibold uppercase">Category</th>
              <th className="p-4 font-semibold uppercase">Price</th>
              <th className="p-4 font-semibold uppercase">Stock</th>
              <th className="p-4 font-semibold uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{item.name}</td>
                <td className="p-4 text-slate-600">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {item.category}
                  </span>
                </td>
                <td className="p-4 text-slate-600">${item.price.toFixed(2)}</td>
                <td className="p-4 text-slate-600">
                  <span className={item.stock < 10 ? "text-red-600 font-medium" : ""}>{item.stock}</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  No items found. Add a product to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit Item' : 'New Item'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Product name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($)</label>
                  <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock</label>
                  <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Beverages" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-sm cursor-pointer">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
