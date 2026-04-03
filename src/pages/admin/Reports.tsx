import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, AlertTriangle, Activity, BarChart3, PieChart, Zap, CheckCircle2 } from 'lucide-react';
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
    .slice(0, 5);

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Aggregating Intelligence...</p>
        </div>
     );
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
    <div className="relative group bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 overflow-hidden transition-all hover:bg-white/[0.08]">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.replace('text-', 'bg-')}`}></div>
      <div className="flex items-center gap-5 relative z-10">
        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
          {subText && <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">{subText}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-4">
             Executive <span className="text-blue-500">Analytics</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <Zap size={14} className="text-blue-500 animate-pulse"/> Global Performance Metrics
          </p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'Admin' ? 'lg:grid-cols-4' : ''} gap-6`}>
        {user?.role === 'Admin' && (
          <StatCard 
            title="Gross Revenue" 
            value={`$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
            icon={DollarSign} 
            colorClass="text-emerald-400" 
            subText="Accumulated Sales"
          />
        )}

        <StatCard 
          title="Throughput" 
          value={totalSales} 
          icon={Activity} 
          colorClass="text-blue-400" 
          subText="Processed Transactions"
        />

        {user?.role === 'Admin' && (
          <StatCard 
            title="Avg Unit Value" 
            value={`$${avgOrderValue.toFixed(2)}`} 
            icon={TrendingUp} 
            colorClass="text-amber-400" 
            subText="Per Transaction"
          />
        )}

        <StatCard 
          title="Reserve Value" 
          value={`$${totalStockValue.toLocaleString()}`} 
          icon={Package} 
          colorClass="text-purple-400" 
          subText="Current Assets"
        />
      </div>

      <div className={`grid grid-cols-1 ${user?.role === 'Admin' ? 'xl:grid-cols-2' : ''} gap-8`}>
        {/* Top Selling Items Table */}
        {user?.role === 'Admin' && (
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                  <PieChart size={20} />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Efficiency Ranking</h2>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-white/5">
                     <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Artifact</th>
                     <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Volume</th>
                     <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Yield</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {topSellingItems.map((item, idx) => (
                     <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="py-4 font-bold text-slate-300 text-xs uppercase group-hover:text-white">{item.name}</td>
                       <td className="py-4 text-center">
                          <span className="text-xs font-black text-blue-400">{item.sold}</span>
                       </td>
                       <td className="py-4 text-right font-black text-emerald-400 tracking-wider">${item.revenue.toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* Low Stock Warning Table */}
        <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Stock Depletion Alerts</h2>
              </div>
              <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-3 py-1 rounded-full uppercase tracking-tighter">
                {lowStockItems.length} Warnings
              </span>
           </div>

           <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-white/5 sticky top-0 z-10">
                   <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset Name</th>
                   <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Qty</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {lowStockItems.map((item) => (
                   <tr key={item._id} className="group hover:bg-white/[0.02] transition-colors">
                     <td className="py-4 font-bold text-slate-300 text-xs uppercase flex items-center gap-3">
                       <div className={`w-1.5 h-1.5 rounded-full ${item.stock === 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></div>
                       {item.name}
                     </td>
                     <td className={`py-4 text-right font-black ${item.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {item.stock}
                     </td>
                   </tr>
                 ))}
                 {lowStockItems.length === 0 && (
                   <tr>
                     <td colSpan={2} className="py-12 text-center">
                        <div className="flex flex-col items-center opacity-30">
                           <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory Optimal</p>
                        </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}