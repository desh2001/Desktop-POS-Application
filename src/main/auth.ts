import { ipcMain } from 'electron';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

export function registerAuthHandlers() {
  ipcMain.handle('auth:login', async (_, { username, password }) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return { success: false, message: 'Invalid password' };
      }
      return { success: true, user: { id: user._id.toString(), username: user.username, role: user.role } };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  // Helper to create an initial admin if Database is empty
  ipcMain.handle('auth:initAdmin', async (_, { username, password }) => {
    try {
      const count = await User.countDocuments();
      if (count > 0) return { success: false, message: 'Database already initialized' };

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new User({ username, password: hashedPassword, role: 'Admin' });
      await newAdmin.save();
      return { success: true, message: 'Admin initialized successfully' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
}
