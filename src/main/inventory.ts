import { ipcMain } from 'electron';
import { Item } from './models/Item.js';
import { Setting } from './models/Setting.js';

export function registerInventoryHandlers() {
  ipcMain.handle('items:get', async () => {
    try {
      const items = await Item.find({});
      return { success: true, items: JSON.parse(JSON.stringify(items)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('items:add', async (_, itemData) => {
    try {
      const newItem = new Item(itemData);
      await newItem.save();
      return { success: true, item: JSON.parse(JSON.stringify(newItem)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('items:update', async (_, { id, updateData }) => {
    try {
      const updated = await Item.findByIdAndUpdate(id, updateData, { new: true });
      return { success: true, item: JSON.parse(JSON.stringify(updated)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('items:delete', async (_, id) => {
    try {
      await Item.findByIdAndDelete(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('settings:get', async (_, key) => {
    try {
      const setting = await Setting.findOne({ key });
      return { success: true, value: setting ? setting.value : null };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('settings:set', async (_, { key, value }) => {
    try {
      const setting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
      return { success: true, setting: JSON.parse(JSON.stringify(setting)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
}
