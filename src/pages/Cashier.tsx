import { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, Trash2, Plus, Minus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface Item {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Item {
  quantity: number;
}

export default function Cashier() {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    loadInventory();
    loadSettings();
  }, []);

  const loadInventory = async () => {
    const res = await (window as any).api.inventory.getItems();
    if (res.success) {
      setItems(res.items.filter((i: Item) => i.stock > 0)); 
    }
  };

  const loadSettings = async () => {
    const tr = await (window as any).api.settings.getSetting('taxRate');
    if (tr?.value) setTaxRate(Number(tr.value));
  };

  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        if (existing.quantity >= item.stock) return prev; 
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i._id === id) {
          const newQ = i.quantity + delta;
          if (newQ > 0 && newQ <= i.stock) return { ...i, quantity: newQ };
        }
        return i;
      });
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i._id !== id));
  };

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const change = (Number(amountTendered) - total) > 0 ? (Number(amountTendered) - total) : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (Number(amountTendered) < total) {
      alert("Amount tendered is less than the total due!");
      return;
    }
    
    const saleData = {
      workerId: user?.id,
      customerName: customerName.trim() || undefined,
      items: cart.map(i => ({ item: i._id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal,
      tax,
      total,
      amountTendered: Number(amountTendered),
      change
    };

    const res = await (window as any).api.sales.createSale(saleData);
    if (res.success) {
      const saleId = res.sale._id;
      setCart([]);
      setAmountTendered('');
      setCustomerName('');
      loadInventory(); 

      const printRes = await (window as any).api.print.generatePdf('/print/bill', `Receipt_${saleId.substring(saleId.length - 8).toUpperCase()}.pdf`);
      
      if (printRes.success) {
        alert(`Sale completed! Receipt PDF strictly saved to: ${printRes.path}`);
      } else {
        alert("Sale completed, but PDF generation failed: " + printRes.message);
      }
    } else {
      alert("Error: " + res.message);
    }
  };

  const handleQuotation = async () => {
    if (cart.length === 0) return;
    
    const quoteData = {
      workerId: user?.id,
      customerName: customerName.trim() || undefined,
      items: cart.map(i => ({ item: i._id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal,
      tax,
      total,
      amountTendered: Number(amountTendered) || 0,
      change: change || 0
    };

    const res = await (window as any).api.quotations.createQuotation(quoteData);
    if (res.success) {
      const quoteId = res.quotation._id;
      setCart([]);
      setAmountTendered('');
      setCustomerName('');

      const printRes = await (window as any).api.print.generatePdf('/print/quote', `Quotation_${quoteId.substring(quoteId.length - 8).toUpperCase()}.pdf`);
      
      if (printRes.success) {
        alert(`Quotation generated! PDF strictly saved to: ${printRes.path}`);
      } else {
        alert("Quotation saved, but PDF generation failed: " + printRes.message);
      }
    } else {
      alert("Error: " + res.message);
    }
  };

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = items.filter(i => 
    (category === 'All' || i.category === category) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-100">
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Point of Sale</h1>
            <p className="text-sm text-slate-500">Cashier: {user?.username ?? 'Demo'} ({user?.role ?? 'Local'})</p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 cursor-pointer">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <select 
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white min-w-[200px] cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-auto pr-2">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item._id} 
                onClick={() => addToCart(item)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-400 mb-1">{item.category}</div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{item.name}</h3>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <span className="text-xl font-black text-primary-600">${item.price.toFixed(2)}</span>
                  <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{item.stock} left</span>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
               <div className="col-span-full mt-10 text-center text-slate-500 text-lg">No products found matching filters.</div>
            )}
          </div>
        </div>
      </main>

      <aside className="w-[400px] bg-white border-l border-slate-200 shadow-lg flex flex-col z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-primary-100 text-primary-600 p-2 rounded-xl">
            <ShoppingCart size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Current Order</h2>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <ShoppingCart size={48} className="opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1 truncate pr-3">
                  <h4 className="font-semibold text-slate-800 truncate">{item.name}</h4>
                  <p className="text-primary-600 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                  <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-600 cursor-pointer"><Minus size={16} /></button>
                  <span className="w-8 text-center font-medium text-slate-800">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)} disabled={item.quantity >= item.stock} className="p-1 hover:bg-slate-100 rounded-md text-slate-600 disabled:opacity-30 cursor-pointer"><Plus size={16} /></button>
                </div>
                <button onClick={() => removeFromCart(item._id)} className="ml-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="space-y-3 mb-6">
            <div className="mb-4">
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm placeholder-slate-400 transition-shadow"
                placeholder="Customer Name (Optional)"
              />
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax ({taxRate}%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-slate-800 pt-3 border-t border-slate-200">
              <span>Total</span>
              <span className="text-primary-600">${total.toFixed(2)}</span>
            </div>
            
            <div className="pt-4 mt-2 border-t border-dashed border-slate-300 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cash Tendered ($)</label>
                <input 
                  type="number" 
                  min={total.toFixed(2)}
                  step="0.01"
                  value={amountTendered}
                  onChange={e => setAmountTendered(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-right font-medium"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center text-slate-700 font-bold bg-slate-200 p-3 rounded-lg">
                <span>Change Due</span>
                <span className={change > 0 ? "text-emerald-600 font-black text-lg" : "text-lg"}>${change.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleQuotation}
              disabled={cart.length === 0}
              className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-md cursor-pointer transition-colors text-lg"
            >
              Quotation
            </button>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || Number(amountTendered) < total}
              className="flex-[2] bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-md cursor-pointer transition-colors text-lg"
            >
              Process Sale
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
