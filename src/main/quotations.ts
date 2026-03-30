import { ipcMain } from 'electron';
import { Quotation } from './models/Quotation.js';

export function registerQuotationHandlers() {
  ipcMain.handle('quotations:create', async (_, quotationData) => {
    try {
      const newQuotation = new Quotation(quotationData);
      await newQuotation.save();

      // We do not decrement stock for a quotation

      return { success: true, quotation: JSON.parse(JSON.stringify(newQuotation)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('quotations:get', async () => {
    try {
      const quotations = await Quotation.find().sort({ createdAt: -1 });
      return { success: true, quotations: JSON.parse(JSON.stringify(quotations)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
}
