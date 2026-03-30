import { ipcMain } from 'electron';
import { registerAuthHandlers } from './auth.js';
import { registerInventoryHandlers } from './inventory.js';
import { registerSalesHandlers } from './sales.js';
import { registerPdfHandlers } from './pdfGenerator.js';
import { registerQuotationHandlers } from './quotations.js';

export function registerIpcHandlers() {
  ipcMain.handle('ping', () => 'pong');

  registerAuthHandlers();
  registerInventoryHandlers();
  registerSalesHandlers();
  registerPdfHandlers();
  registerQuotationHandlers();
}
