import { BrowserWindow, app, ipcMain } from "electron";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
//#region src/main/database.ts
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/posdb";
async function connectDB() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log("Successfully connected to MongoDB.");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
	}
}
//#endregion
//#region src/main/models/User.ts
var UserSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ["Admin", "Worker"],
		default: "Worker"
	}
}, { timestamps: true });
var User = mongoose.model("User", UserSchema);
//#endregion
//#region src/main/auth.ts
function registerAuthHandlers() {
	ipcMain.handle("auth:login", async (_, { username, password }) => {
		try {
			const user = await User.findOne({ username });
			if (!user) return {
				success: false,
				message: "User not found"
			};
			if (!await bcrypt.compare(password, user.password)) return {
				success: false,
				message: "Invalid password"
			};
			return {
				success: true,
				user: {
					id: user._id.toString(),
					username: user.username,
					role: user.role
				}
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("auth:initAdmin", async (_, { username, password }) => {
		try {
			if (await User.countDocuments() > 0) return {
				success: false,
				message: "Database already initialized"
			};
			await new User({
				username,
				password: await bcrypt.hash(password, 10),
				role: "Admin"
			}).save();
			return {
				success: true,
				message: "Admin initialized successfully"
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("users:get", async () => {
		try {
			const users = await User.find({}, "-password");
			return {
				success: true,
				users: JSON.parse(JSON.stringify(users))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("users:add", async (_, { username, password, role }) => {
		try {
			const newUser = new User({
				username,
				password: await bcrypt.hash(password, 10),
				role
			});
			await newUser.save();
			const safeUser = {
				_id: newUser._id,
				username: newUser.username,
				role: newUser.role,
				createdAt: newUser.createdAt
			};
			return {
				success: true,
				user: JSON.parse(JSON.stringify(safeUser))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("users:update", async (_, { id, data }) => {
		try {
			if (data.password) data.password = await bcrypt.hash(data.password, 10);
			else delete data.password;
			const updated = await User.findByIdAndUpdate(id, data, { new: true });
			return {
				success: true,
				user: JSON.parse(JSON.stringify(updated))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("users:delete", async (_, id) => {
		try {
			await User.findByIdAndDelete(id);
			return { success: true };
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
}
//#endregion
//#region src/main/models/Item.ts
var ItemSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	stock: {
		type: Number,
		required: true,
		default: 0
	},
	category: {
		type: String,
		default: "General"
	}
}, { timestamps: true });
var Item = mongoose.model("Item", ItemSchema);
//#endregion
//#region src/main/models/Setting.ts
var SettingSchema = new Schema({
	key: {
		type: String,
		required: true,
		unique: true
	},
	value: {
		type: Schema.Types.Mixed,
		required: true
	}
}, { timestamps: true });
var Setting = mongoose.model("Setting", SettingSchema);
//#endregion
//#region src/main/inventory.ts
function registerInventoryHandlers() {
	ipcMain.handle("items:get", async () => {
		try {
			const items = await Item.find({});
			return {
				success: true,
				items: JSON.parse(JSON.stringify(items))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("items:add", async (_, itemData) => {
		try {
			const newItem = new Item(itemData);
			await newItem.save();
			return {
				success: true,
				item: JSON.parse(JSON.stringify(newItem))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("items:update", async (_, { id, updateData }) => {
		try {
			const updated = await Item.findByIdAndUpdate(id, updateData, { new: true });
			return {
				success: true,
				item: JSON.parse(JSON.stringify(updated))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("items:delete", async (_, id) => {
		try {
			await Item.findByIdAndDelete(id);
			return { success: true };
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("settings:get", async (_, key) => {
		try {
			const setting = await Setting.findOne({ key });
			return {
				success: true,
				value: setting ? setting.value : null
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("settings:set", async (_, { key, value }) => {
		try {
			const setting = await Setting.findOneAndUpdate({ key }, { value }, {
				upsert: true,
				new: true
			});
			return {
				success: true,
				setting: JSON.parse(JSON.stringify(setting))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
}
//#endregion
//#region src/main/models/Sale.ts
var SaleItemSchema = new Schema({
	item: {
		type: Schema.Types.ObjectId,
		ref: "Item"
	},
	name: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	}
});
var SaleSchema = new Schema({
	workerId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	items: [SaleItemSchema],
	subtotal: {
		type: Number,
		required: true
	},
	tax: {
		type: Number,
		required: true
	},
	total: {
		type: Number,
		required: true
	},
	amountTendered: {
		type: Number,
		required: true,
		default: 0
	},
	change: {
		type: Number,
		required: true,
		default: 0
	}
}, { timestamps: true });
var Sale = mongoose.model("Sale", SaleSchema);
//#endregion
//#region src/main/sales.ts
function registerSalesHandlers() {
	ipcMain.handle("sales:create", async (_, saleData) => {
		try {
			const newSale = new Sale(saleData);
			await newSale.save();
			for (const cartItem of saleData.items) await Item.findByIdAndUpdate(cartItem.item, { $inc: { stock: -cartItem.quantity } });
			return {
				success: true,
				sale: JSON.parse(JSON.stringify(newSale))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
	ipcMain.handle("sales:get", async () => {
		try {
			const sales = await Sale.find().sort({ createdAt: -1 });
			return {
				success: true,
				sales: JSON.parse(JSON.stringify(sales))
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
}
//#endregion
//#region src/main/pdfGenerator.ts
var __dirname$1 = dirname(fileURLToPath(import.meta.url));
function registerPdfHandlers() {
	ipcMain.handle("pdf:generate", async (_, { urlPath, filename }) => {
		try {
			const win = new BrowserWindow({
				show: false,
				webPreferences: {
					preload: path.join(__dirname$1, "index.cjs"),
					nodeIntegration: false,
					contextIsolation: true
				}
			});
			const baseURL = process.env.VITE_DEV_SERVER_URL ? `${process.env.VITE_DEV_SERVER_URL}#${urlPath}` : `file://${path.join(__dirname$1, "../dist/index.html")}#${urlPath}`;
			await win.loadURL(baseURL);
			await new Promise((resolve) => setTimeout(resolve, 1500));
			const pdf = await win.webContents.printToPDF({
				printBackground: true,
				margins: {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0
				}
			});
			const downloadPath = path.join(app.getPath("downloads"), filename);
			fs.writeFileSync(downloadPath, pdf);
			win.close();
			return {
				success: true,
				path: downloadPath
			};
		} catch (err) {
			return {
				success: false,
				message: err.message
			};
		}
	});
}
//#endregion
//#region src/main/ipc.ts
function registerIpcHandlers() {
	ipcMain.handle("ping", () => "pong");
	registerAuthHandlers();
	registerInventoryHandlers();
	registerSalesHandlers();
	registerPdfHandlers();
}
//#endregion
//#region src/main/main.ts
var __dirname = dirname(fileURLToPath(import.meta.url));
function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: join(__dirname, "index.cjs"),
			sandbox: false,
			contextIsolation: true
		}
	});
	if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(join(__dirname, "../dist/index.html"));
}
app.whenReady().then(async () => {
	await connectDB();
	registerIpcHandlers();
	createWindow();
	app.on("activate", function() {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
//#endregion
