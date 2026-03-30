# Desktop POS Application

A modern, fast, and feature-rich Point of Sale (POS) system built with Electron, React, Vite, and MongoDB. Designed for standard retail endpoints to manage inventory, process sales, and generate quotations with beautifully designed PDF receipts.

## 🚀 Key Features
- **Cashier POS Interface**: Seamlessly ring up items, manage a dynamic shopping cart, and instantly calculate taxes and change due.
- **Sales & Quotations**: Process direct sales that deduct inventory stock automatically, or generate 30-day valid Quotations with dynamic, accountable worker references.
- **PDF Generation**: Directly outputs localized, cleanly styled PDF receipts and quotation documents directly to the `Downloads` folder, circumventing clunky print dialogs.
- **Admin Dashboard**: Manage inventory stock, categorize products, and adjust item pricing seamlessly within the desktop environment.
- **Role-based Auth**: Secured access restricted by user roles (Admin vs Worker).
- **Premium Design**: Built rapidly with Tailwind CSS v4, displaying a visually rich, glassy UI.

## 💻 Tech Stack
- **Frontend**: React 19, Zustand (State Management), React Router v7, Tailwind CSS v4, Lucide React (Icons).
- **Desktop Container**: Electron (v41) connecting front-end rendering with powerful system abilities via Inter-Process Communication (IPC).
- **Database**: Mongoose (v9) alongside MongoDB for resilient local or remote data storage.
- **Build Tooling**: Vite (v8) coupled securely with `vite-plugin-electron`.

## 🛠 Installation & Setup

### Prerequisites
Make sure you have Node.js (v18+) and MongoDB installed on your system.

### Steps
1. Navigate into the application folder and install dependencies:
   ```bash
   npm install
   ```
2. **Database Initialization**
   By default, the system will look for `mongodb://127.0.0.1:27017/posdb`. Ensure MongoDB is running locally before you begin.
   
   To create your first admin user in the database, run the seed script:
   ```bash
   node createAdmin.js <optional_username> <optional_password>
   ```
   *If you do not provide a username and password, it will default to `admin` / `admin123`.*
   
3. Environment Configuration:
   - Ensure any `.env` adjustments are made if hosting the remote DB elsewhere.
4. Start the application in development mode:
   ```bash
   npm run dev
   ```

### Building for Production
To package the Desktop POS application into an executable installer:
```bash
npm run build
```
The output will reside within the newly created `dist-electron` and application bundles via `electron-builder`.

## 📝 Architecture
The system isolates functionality strictly by bridging a secured Electron `contextBridge` to a lightweight React view. `src/main` manages MongoDB data operations, IPC routing, and PDF Puppeteer-style manipulation. `src/components` and `src/pages` handle the UI cleanly.
