let electron = require("electron");
//#region src/preload/index.ts
electron.contextBridge.exposeInMainWorld("api", {
	ping: () => electron.ipcRenderer.invoke("ping"),
	auth: {
		login: (credentials) => electron.ipcRenderer.invoke("auth:login", credentials),
		initAdmin: (credentials) => electron.ipcRenderer.invoke("auth:initAdmin", credentials)
	},
	users: {
		getUsers: () => electron.ipcRenderer.invoke("users:get"),
		addUser: (data) => electron.ipcRenderer.invoke("users:add", data),
		updateUser: (id, data) => electron.ipcRenderer.invoke("users:update", {
			id,
			data
		}),
		deleteUser: (id) => electron.ipcRenderer.invoke("users:delete", id)
	},
	inventory: {
		getItems: () => electron.ipcRenderer.invoke("items:get"),
		addItem: (data) => electron.ipcRenderer.invoke("items:add", data),
		updateItem: (id, data) => electron.ipcRenderer.invoke("items:update", {
			id,
			updateData: data
		}),
		deleteItem: (id) => electron.ipcRenderer.invoke("items:delete", id)
	},
	settings: {
		getSetting: (key) => electron.ipcRenderer.invoke("settings:get", key),
		setSetting: (key, value) => electron.ipcRenderer.invoke("settings:set", {
			key,
			value
		})
	},
	sales: {
		createSale: (data) => electron.ipcRenderer.invoke("sales:create", data),
		getSales: () => electron.ipcRenderer.invoke("sales:get")
	},
	quotations: {
		createQuotation: (data) => electron.ipcRenderer.invoke("quotations:create", data),
		getQuotations: () => electron.ipcRenderer.invoke("quotations:get")
	},
	print: { generatePdf: (urlPath, filename) => electron.ipcRenderer.invoke("pdf:generate", {
		urlPath,
		filename
	}) }
});
//#endregion
