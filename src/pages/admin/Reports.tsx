import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, AlertTriangle, Activity, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Reports() {
  const user = useAuthStore(state => state.user);
  const [sales, setSales] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesRes, itemsRes] = await Promise.all([
        (window as any).api.sales.getSales(),
        (window as any).api.inventory.getItems()
      ]);

      if (salesRes.success) setSales(salesRes.sales);
      if (itemsRes.success) setItems(itemsRes.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Computations
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSales = sales.length;
  const avgOrderValue = totalSales > 0 ? (totalRevenue / totalSales) : 0;
  
  const totalStockValue = items.reduce((sum, i) => sum + (i.price * i.stock), 0);
  
  const lowStockItems = items.filter(i => i.stock <= 10).sort((a, b) => a.stock - b.stock);

  // Top Selling Items Computation
  const itemSalesCount: Record<string, {name: string, sold: number, revenue: number}> = {};
  sales.forEach(sale => {
    sale.items.forEach((si: any) => {
      if (!itemSalesCount[si.item]) {
        itemSalesCount[si.item] = { name: si.name, sold: 0, revenue: 0 };
      }
      itemSalesCount[si.item].sold += si.quantity;
      itemSalesCount[si.item].revenue += (si.price * si.quantity);
    });
  });
  
  const topSellingItems = Object.values(itemSalesCount)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5); // top 5

  if (loading) {
     return <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Running data aggregation...</div>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
             <BarChart3 size={26} className="text-primary-600"/> Executive Reports
           </h1>
           <p className="text-slate-500 mt-1 text-sm">Real-time aggregate insights on sales and inventory performance.</p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'Admin' ? 'lg:grid-cols-4' : ''} gap-6 mb-8`}>
        {user?.role === 'Admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
             <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600 relative z-10 transition-transform group-hover:scale-110">
                <DollarSign size={24} />
             </div>
             <div className="relative z-10">
               <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Revenue</p>
               <h3 className="text-3xl font-black text-slate-800">${totalRevenue.toFixed(2)}</h3>
             </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
           <div className="bg-indigo-100 p-4 rounded-xl text-indigo-600 relative z-10 transition-transform group-hover:scale-110">
              <Activity size={24} />
           </div>
           <div className="relative z-10">
             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Completed Sales</p>
             <h3 className="text-3xl font-black text-slate-800">{totalSales} <span className="text-sm font-medium text-slate-400 normal-case tracking-normal">txns</span></h3>
           </div>
        </div>

        {user?.role === 'Admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
             <div className="bg-amber-100 p-4 rounded-xl text-amber-600 relative z-10 transition-transform group-hover:scale-110">
                <TrendingUp size={24} />
             </div>
             <div className="relative z-10">
               <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Avg Order Value</p>
               <h3 className="text-3xl font-black text-slate-800">${avgOrderValue.toFixed(2)}</h3>
             </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
           <div className="bg-blue-100 p-4 rounded-xl text-blue-600 relative z-10 transition-transform group-hover:scale-110">
              <Package size={24} />
           </div>
           <div className="relative z-10">
             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Est. Stock Value</p>
             <h3 className="text-3xl font-black text-slate-800">${totalStockValue.toFixed(2)}</h3>
           </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${user?.role === 'Admin' ? 'lg:grid-cols-2' : ''} gap-8`}>
        {/* Top Selling Items Table */}
        {user?.role === 'Admin' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <TrendingUp size={20} className="text-emerald-500" />
                   Top Performing Products
                </h2>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                   <tr>
                     <th className="p-3 text-xs font-black uppercase tracking-widest">Product Name</th>
                     <th className="p-3 text-xs font-black uppercase tracking-widest text-center">Units Sold</th>
                     <th className="p-3 text-xs font-black uppercase tracking-widest text-right">Revenue Gen.</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {topSellingItems.map((item, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-colors">
                       <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                       <td className="p-3 text-center text-slate-600 font-bold">{item.sold}</td>
                       <td className="p-3 text-right text-emerald-600 font-black">${item.revenue.toFixed(2)}</td>
                     </tr>
                   ))}
                   {topSellingItems.length === 0 && (
                     <tr><td colSpan={3} className="p-6 text-center text-slate-400">No sales data available.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* Low Stock Warning Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <AlertTriangle size={20} className="text-amber-500" />
                 Inventory Alerts (Low & Out of Stock)
              </h2>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{lowStockItems.length} Issues</span>
           </div>
           <div className="overflow-x-auto overflow-y-auto max-h-[300px] border border-slate-50 rounded-xl">
             <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 sticky top-0">
                 <tr>
                   <th className="p-3 text-xs font-black uppercase tracking-widest">Product Name</th>
                   <th className="p-3 text-xs font-black uppercase tracking-widest">Category</th>
                   <th className="p-3 text-xs font-black uppercase tracking-widest text-right">Current Stock</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {lowStockItems.map((item) => (
                   <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                     <td className="p-3 font-semibold text-slate-800">
                       {item.name} {item.stock === 0 && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-black uppercase">Out</span>}
                     </td>
                     <td className="p-3 text-slate-500 text-sm">{item.category}</td>
                     <td className={`p-3 text-right font-black ${item.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {item.stock}
                     </td>
                   </tr>
                 ))}
                 {lowStockItems.length === 0 && (
                   <tr><td colSpan={3} className="p-6 text-center text-slate-400 bg-emerald-50/30">Healthy inventory levels. No items low on stock!</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
