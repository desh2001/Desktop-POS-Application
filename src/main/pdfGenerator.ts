import { BrowserWindow, ipcMain, app } from 'electron';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerPdfHandlers() {
  ipcMain.handle('pdf:generate', async (_, { urlPath, filename }) => {
    try {
      const win = new BrowserWindow({
        show: false,
        webPreferences: {
          preload: path.join(__dirname, 'index.cjs'),
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      const baseURL = process.env.VITE_DEV_SERVER_URL 
        ? `${process.env.VITE_DEV_SERVER_URL}#${urlPath}`
        : `file://${path.join(__dirname, '../dist/index.html')}#${urlPath}`;
        
      await win.loadURL(baseURL);
      
      // Wait for React to render fully
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const pdf = await win.webContents.printToPDF({
        printBackground: true,
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });
      
      const downloadPath = path.join(app.getPath('downloads'), filename);
      fs.writeFileSync(downloadPath, pdf);
      
      win.close();
      return { success: true, path: downloadPath };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
}
