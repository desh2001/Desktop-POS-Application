import { ipcMain } from 'electron';

export function registerIpcHandlers() {
  ipcMain.handle('ping', () => 'pong');

  // We will add more IPC handlers here for auth, items, etc.
}
