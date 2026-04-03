import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import r, { dirname as i, join as a } from "path";
import { fileURLToPath as o } from "url";
import "dotenv/config";
import s, { Schema as c } from "mongoose";
import l from "bcryptjs";
import u from "fs";
//#region src/main/database.ts
var d = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/posdb";
async function f() {
	try {
		await s.connect(d), console.log("Successfully connected to MongoDB.");
	} catch (e) {
		console.error("Error connecting to MongoDB:", e);
	}
}
//#endregion
//#region src/main/models/User.ts
var p = new c({
	username: {
		type: String,
		required: !0,
		unique: !0
	},
	password: {
		type: String,
		required: !0
	},
	role: {
		type: String,
		enum: [
			"Admin",
			"Employee",
			"Stock Manager"
		],
		default: "Employee"
	}
}, { timestamps: !0 }), m = s.model("User", p);
//#endregion
//#region src/main/auth.ts
function h() {
	n.handle("auth:login", async (e, { username: t, password: n }) => {
		try {
			let e = await m.findOne({ username: t });
			return e ? await l.compare(n, e.password) ? {
				success: !0,
				user: {
					id: e._id.toString(),
					username: e.username,
					role: e.role
				}
			} : {
				success: !1,
				message: "Invalid password"
			} : {
				success: !1,
				message: "User not found"
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("auth:initAdmin", async (e, { username: t, password: n }) => {
		try {
			return await m.countDocuments() > 0 ? {
				success: !1,
				message: "Database already initialized"
			} : (await new m({
				username: t,
				password: await l.hash(n, 10),
				role: "Admin"
			}).save(), {
				success: !0,
				message: "Admin initialized successfully"
			});
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("users:get", async () => {
		try {
			let e = await m.find({}, "-password");
			return {
				success: !0,
				users: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("users:add", async (e, { username: t, password: n, role: r }) => {
		try {
			let e = new m({
				username: t,
				password: await l.hash(n, 10),
				role: r
			});
			await e.save();
			let i = {
				_id: e._id,
				username: e.username,
				role: e.role,
				createdAt: e.createdAt
			};
			return {
				success: !0,
				user: JSON.parse(JSON.stringify(i))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("users:update", async (e, { id: t, data: n }) => {
		try {
			n.password ? n.password = await l.hash(n.password, 10) : delete n.password;
			let e = await m.findByIdAndUpdate(t, n, { new: !0 });
			return {
				success: !0,
				user: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("users:delete", async (e, t) => {
		try {
			return await m.findByIdAndDelete(t), { success: !0 };
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	});
}
//#endregion
//#region src/main/models/Item.ts
var g = new c({
	name: {
		type: String,
		required: !0
	},
	price: {
		type: Number,
		required: !0
	},
	stock: {
		type: Number,
		required: !0,
		default: 0
	},
	category: {
		type: String,
		default: "General"
	}
}, { timestamps: !0 }), _ = s.model("Item", g), v = new c({
	key: {
		type: String,
		required: !0,
		unique: !0
	},
	value: {
		type: c.Types.Mixed,
		required: !0
	}
}, { timestamps: !0 }), y = s.model("Setting", v);
//#endregion
//#region src/main/inventory.ts
function b() {
	n.handle("items:get", async () => {
		try {
			let e = await _.find({});
			return {
				success: !0,
				items: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("items:add", async (e, t) => {
		try {
			let e = new _(t);
			return await e.save(), {
				success: !0,
				item: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("items:update", async (e, { id: t, updateData: n }) => {
		try {
			let e = await _.findByIdAndUpdate(t, n, { new: !0 });
			return {
				success: !0,
				item: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("items:delete", async (e, t) => {
		try {
			return await _.findByIdAndDelete(t), { success: !0 };
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("settings:get", async (e, t) => {
		try {
			let e = await y.findOne({ key: t });
			return {
				success: !0,
				value: e ? e.value : null
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("settings:set", async (e, { key: t, value: n }) => {
		try {
			let e = await y.findOneAndUpdate({ key: t }, { value: n }, {
				upsert: !0,
				new: !0
			});
			return {
				success: !0,
				setting: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	});
}
//#endregion
//#region src/main/models/Sale.ts
var x = new c({
	item: {
		type: c.Types.ObjectId,
		ref: "Item"
	},
	name: {
		type: String,
		required: !0
	},
	price: {
		type: Number,
		required: !0
	},
	quantity: {
		type: Number,
		required: !0
	}
}), S = new c({
	workerId: {
		type: c.Types.ObjectId,
		ref: "User"
	},
	customerName: {
		type: String,
		required: !1
	},
	items: [x],
	subtotal: {
		type: Number,
		required: !0
	},
	tax: {
		type: Number,
		required: !0
	},
	total: {
		type: Number,
		required: !0
	},
	amountTendered: {
		type: Number,
		required: !0,
		default: 0
	},
	change: {
		type: Number,
		required: !0,
		default: 0
	}
}, { timestamps: !0 }), C = s.model("Sale", S);
//#endregion
//#region src/main/sales.ts
function w() {
	n.handle("sales:create", async (e, t) => {
		try {
			let e = new C(t);
			await e.save();
			for (let e of t.items) await _.findByIdAndUpdate(e.item, { $inc: { stock: -e.quantity } });
			return {
				success: !0,
				sale: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("sales:get", async () => {
		try {
			let e = await C.find().sort({ createdAt: -1 });
			return {
				success: !0,
				sales: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	});
}
//#endregion
//#region src/main/pdfGenerator.ts
var T = i(o(import.meta.url));
function E() {
	n.handle("pdf:generate", async (n, { urlPath: i, filename: a }) => {
		try {
			let n = new e({
				show: !1,
				webPreferences: {
					preload: r.join(T, "index.cjs"),
					nodeIntegration: !1,
					contextIsolation: !0
				}
			}), o = process.env.VITE_DEV_SERVER_URL ? `${process.env.VITE_DEV_SERVER_URL}#${i}` : `file://${r.join(T, "../dist/index.html")}#${i}`;
			await n.loadURL(o), await new Promise((e) => setTimeout(e, 1500));
			let s = await n.webContents.printToPDF({
				printBackground: !0,
				margins: {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0
				}
			}), c = r.join(t.getPath("downloads"), a);
			return u.writeFileSync(c, s), n.close(), {
				success: !0,
				path: c
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	});
}
//#endregion
//#region src/main/models/Quotation.ts
var D = new c({
	item: {
		type: c.Types.ObjectId,
		ref: "Item"
	},
	name: {
		type: String,
		required: !0
	},
	price: {
		type: Number,
		required: !0
	},
	quantity: {
		type: Number,
		required: !0
	}
}), O = new c({
	workerId: {
		type: c.Types.ObjectId,
		ref: "User"
	},
	customerName: {
		type: String,
		required: !1
	},
	items: [D],
	subtotal: {
		type: Number,
		required: !0
	},
	tax: {
		type: Number,
		required: !0
	},
	total: {
		type: Number,
		required: !0
	},
	amountTendered: {
		type: Number,
		required: !1,
		default: 0
	},
	change: {
		type: Number,
		required: !1,
		default: 0
	}
}, { timestamps: !0 }), k = s.model("Quotation", O);
//#endregion
//#region src/main/quotations.ts
function A() {
	n.handle("quotations:create", async (e, t) => {
		try {
			let e = new k(t);
			return await e.save(), {
				success: !0,
				quotation: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	}), n.handle("quotations:get", async () => {
		try {
			let e = await k.find().populate("workerId", "username").sort({ createdAt: -1 });
			return {
				success: !0,
				quotations: JSON.parse(JSON.stringify(e))
			};
		} catch (e) {
			return {
				success: !1,
				message: e.message
			};
		}
	});
}
//#endregion
//#region src/main/ipc.ts
function j() {
	n.handle("ping", () => "pong"), h(), b(), w(), E(), A();
}
//#endregion
//#region src/main/main.ts
var M = i(o(import.meta.url));
function N() {
	let t = new e({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: a(M, "index.cjs"),
			sandbox: !1,
			contextIsolation: !0
		}
	});
	process.env.VITE_DEV_SERVER_URL ? t.loadURL(process.env.VITE_DEV_SERVER_URL) : t.loadFile(a(M, "../dist/index.html"));
}
t.whenReady().then(async () => {
	await f(), j(), N(), t.on("activate", function() {
		e.getAllWindows().length === 0 && N();
	});
}), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
});
//#endregion
