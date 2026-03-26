import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Cashier from './pages/Cashier';
import Bill from './pages/print/Bill';
import { useAuthStore } from './store/useAuthStore';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Placeholders removed

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        } />
        
        <Route path="/cashier/*" element={
          <ProtectedRoute allowedRoles={['Admin', 'Worker']}>
            <Cashier />
          </ProtectedRoute>
        } />
        
        <Route path="/print/:type" element={<Bill />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
