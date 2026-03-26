import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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

  if (error) return <div style={{ padding: '40px', color: 'red' }}>Error: {error}</div>;
  if (!sale) return <div style={{ padding: '80px', textAlign: 'center', color: '#555' }}>Loading Document...</div>;

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#555', lineHeight: '1.6', background: '#fff', minHeight: '100vh', padding: '20px' }}>
      <style>{`
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; background: white; }
        .top-table, .info-table, .items-table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
        .top-table td { padding-bottom: 20px; }
        .info-table td { padding-bottom: 40px; }
        .items-table th { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
        .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .rtl { text-align: right; }
        .title { font-size: 45px; color: #333; font-weight: bold; }
        .total { border-top: 2px solid #eee; font-weight: bold; font-size: 18px; color: #333; }
        @media print {
            .invoice-box { border: none; box-shadow: none; padding: 0; margin: 0; }
            body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="invoice-box">
        <table className="top-table">
          <tbody>
            <tr>
              <td className="title" style={{ maxWidth: '50%' }}>{storeName}</td>
              <td className="rtl">
                {type === 'quote' ? 'Quotation' : 'Invoice'} #: {sale._id.toString().slice(-8).toUpperCase()}<br />
                Created: {new Date(sale.createdAt).toLocaleDateString()}<br />
                Time: {new Date(sale.createdAt).toLocaleTimeString()}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="info-table">
          <tbody>
            <tr>
              <td>
                <strong>From:</strong><br />
                {storeName}<br />
                123 Business Way<br />
                City, State, 12345
              </td>
              <td className="rtl">
                <strong>To:</strong><br />
                Walk-in Customer<br />
                Cash Exchange
              </td>
            </tr>
          </tbody>
        </table>

        <table className="items-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th className="rtl">Quantity</th>
              <th className="rtl">Price</th>
              <th className="rtl">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item: any, i: number) => (
              <tr key={i}>
                <td>{item.name}</td>
                <td className="rtl">{item.quantity}</td>
                <td className="rtl">${item.price.toFixed(2)}</td>
                <td className="rtl">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td></td>
              <td></td>
              <td className="rtl" style={{ paddingTop: '20px' }}>Subtotal:</td>
              <td className="rtl" style={{ paddingTop: '20px' }}>${sale.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td className="rtl">Tax:</td>
              <td className="rtl">${sale.tax.toFixed(2)}</td>
            </tr>
            <tr className="total">
              <td></td>
              <td></td>
              <td className="rtl">Total:</td>
              <td className="rtl">${sale.total.toFixed(2)}</td>
            </tr>
            {type !== 'quote' && (
              <>
                <tr>
                  <td></td>
                  <td></td>
                  <td className="rtl" style={{ paddingTop: '20px', fontSize: '14px' }}>Cash Tendered:</td>
                  <td className="rtl" style={{ paddingTop: '20px', fontSize: '14px' }}>${(sale.amountTendered || sale.total).toFixed(2)}</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td className="rtl" style={{ fontSize: '14px' }}>Change Due:</td>
                  <td className="rtl" style={{ fontSize: '14px' }}>${(sale.change || 0).toFixed(2)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
