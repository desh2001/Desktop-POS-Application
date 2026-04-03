import { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, Trash2, Plus, Minus, Search, Tag, User, ReceiptText, CreditCard } from 'lucide-react';
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
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="flex-1 flex flex-col p-8 overflow-hidden relative z-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Terminal <span className="text-blue-500">POS</span></h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user?.username ?? 'Demo'} • {user?.role ?? 'Local'}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 text-slate-300 hover:text-red-400 rounded-2xl transition-all duration-300 backdrop-blur-md cursor-pointer group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-bold text-sm uppercase tracking-wider">Sign Out</span>
          </button>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex gap-4 mb-8 bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-sm">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by product name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 font-medium text-lg outline-none"
            />
          </div>
          <div className="w-[1px] h-10 bg-white/10 self-center"></div>
          <div className="relative flex items-center pr-4">
             <Tag className="absolute left-4 text-slate-500" size={18} />
             <select 
               value={category}
               onChange={e => setCategory(e.target.value)}
               className="pl-12 pr-10 py-4 bg-transparent border-none focus:ring-0 text-slate-300 font-bold appearance-none cursor-pointer outline-none uppercase text-xs tracking-widest"
             >
               {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
             </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item._id} 
                onClick={() => addToCart(item)}
                className="group relative bg-white/5 hover:bg-white/[0.08] p-6 rounded-[2rem] border border-white/10 hover:border-blue-500/50 transition-all duration-500 cursor-pointer flex flex-col h-64 overflow-hidden"
              >
                {/* Visual Glow on Hover */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex-1 relative z-10">
                  <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest w-fit mb-4">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{item.name}</h3>
                </div>
                
                <div className="mt-4 flex justify-between items-center relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</span>
                    <span className="text-2xl font-black text-white">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-950/50 px-4 py-2 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold text-slate-400">{item.stock} <span className="text-[10px] opacity-50 ml-1 uppercase">Units</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-20 text-slate-600">
                <Search size={64} className="mb-4 opacity-20" />
                <p className="text-xl font-medium uppercase tracking-widest opacity-50">No artifacts found</p>
              </div>
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR: ORDER PANEL */}
      <aside className="w-[450px] bg-slate-950/50 backdrop-blur-2xl border-l border-white/10 flex flex-col z-20 relative">
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Order</h2>
          </div>
          <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {cart.length} Items
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
                <ShoppingCart size={32} className="opacity-20" />
              </div>
              <p className="font-bold uppercase tracking-[0.2em] text-xs">Awaiting Selection</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="group flex items-center gap-4 p-4 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex-1 truncate">
                  <h4 className="font-bold text-white truncate text-sm">{item.name}</h4>
                  <p className="text-blue-400 font-black text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900 rounded-xl border border-white/10 p-1.5">
                  <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-slate-400 transition-colors cursor-pointer"><Minus size={14} /></button>
                  <span className="w-4 text-center font-black text-white text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)} disabled={item.quantity >= item.stock} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-slate-400 disabled:opacity-10 transition-colors cursor-pointer"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item._id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors cursor-pointer">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary */}
        <div className="p-8 bg-slate-900/80 border-t border-white/10 backdrop-blur-md">
          <div className="space-y-4 mb-8">
            <div className="relative group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500/50 outline-none text-sm text-white placeholder:text-slate-600 transition-all"
                placeholder="Client Identity (Optional)"
              />
            </div>

            <div className="space-y-2 px-1">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-slate-300 font-black">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span>Service Tax ({taxRate}%)</span>
                <span className="text-slate-300 font-black">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-white/10 mt-2">
                <span className="text-xs font-black text-blue-500 uppercase tracking-[0.2em]">Total Payable</span>
                <span className="text-4xl font-black text-white leading-none">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="pt-4 space-y-4">
              <div className="relative">
                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="number" 
                  min={total.toFixed(2)}
                  step="0.01"
                  value={amountTendered}
                  onChange={e => setAmountTendered(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none text-right font-black text-xl text-white transition-all"
                  placeholder="0.00"
                />
                <span className="absolute left-11 -top-2 px-2 bg-[#1a2333] text-[10px] font-black text-emerald-500 uppercase tracking-widest">Cash Tendered</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Balance Due</span>
                <span className="text-2xl font-black text-emerald-400">${change.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleQuotation}
              disabled={cart.length === 0}
              className="group flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white font-bold py-4 rounded-2xl border border-white/10 transition-all cursor-pointer uppercase text-xs tracking-widest"
            >
              <ReceiptText size={18} className="group-hover:scale-110 transition-transform" />
              Quote
            </button>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || Number(amountTendered) < total}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-100 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all cursor-pointer uppercase text-xs tracking-widest"
            >
              Commit Sale
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}