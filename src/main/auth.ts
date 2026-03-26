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

  ipcMain.handle('users:get', async () => {
    try {
      const users = await User.find({}, '-password');
      return { success: true, users: JSON.parse(JSON.stringify(users)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('users:add', async (_, { username, password, role }) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword, role });
      await newUser.save();
      const safeUser = { _id: newUser._id, username: newUser.username, role: newUser.role, createdAt: newUser.createdAt };
      return { success: true, user: JSON.parse(JSON.stringify(safeUser)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('users:update', async (_, { id, data }) => {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      } else {
        delete data.password;
      }
      const updated = await User.findByIdAndUpdate(id, data, { new: true });
      return { success: true, user: JSON.parse(JSON.stringify(updated)) };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('users:delete', async (_, id) => {
    try {
      await User.findByIdAndDelete(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  });
}
