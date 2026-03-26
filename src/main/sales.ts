import { ipcMain } from 'electron';
import { Sale } from './models/Sale.js';
import { Item } from './models/Item.js';

export function registerSalesHandlers() {
  ipcMain.handle('sales:create', async (_, saleData) => {
    try {
      const newSale = new Sale(saleData);
      await newSale.save();

      for (const cartItem of saleData.items) {
        await Item.findByIdAndUpdate(cartItem.item, { $inc: { stock: -cartItem.quantity } });
      }

      return { success: true, sale: JSON.parse(JSON.stringify(newSale)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('sales:get', async () => {
    try {
      const sales = await Sale.find().sort({ createdAt: -1 });
      return { success: true, sales: JSON.parse(JSON.stringify(sales)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
}
