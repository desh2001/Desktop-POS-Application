import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
  auth: {
    login: (credentials: any) => ipcRenderer.invoke('auth:login', credentials),
    initAdmin: (credentials: any) => ipcRenderer.invoke('auth:initAdmin', credentials)
  },
  users: {
    getUsers: () => ipcRenderer.invoke('users:get'),
    addUser: (data: any) => ipcRenderer.invoke('users:add', data),
    updateUser: (id: string, data: any) => ipcRenderer.invoke('users:update', { id, data }),
    deleteUser: (id: string) => ipcRenderer.invoke('users:delete', id),
  },
  inventory: {
    getItems: () => ipcRenderer.invoke('items:get'),
    addItem: (data: any) => ipcRenderer.invoke('items:add', data),
    updateItem: (id: string, data: any) => ipcRenderer.invoke('items:update', { id, updateData: data }),
    deleteItem: (id: string) => ipcRenderer.invoke('items:delete', id),
  },
  settings: {
    getSetting: (key: string) => ipcRenderer.invoke('settings:get', key),
    setSetting: (key: string, value: any) => ipcRenderer.invoke('settings:set', { key, value }),
  },
  sales: {
    createSale: (data: any) => ipcRenderer.invoke('sales:create', data),
    getSales: () => ipcRenderer.invoke('sales:get')
  },
  quotations: {
    createQuotation: (data: any) => ipcRenderer.invoke('quotations:create', data),
    getQuotations: () => ipcRenderer.invoke('quotations:get')
  },
  print: {
    generatePdf: (urlPath: string, filename: string) => ipcRenderer.invoke('pdf:generate', { urlPath, filename })
  }
});
