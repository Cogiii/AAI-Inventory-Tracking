import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            >
              {/* Dashboard home */}
              <Route index element={<DashboardPage />} />
              
              {/* Inventory routes */}
              <Route path="inventory" element={<div>Inventory Page (Coming Soon)</div>} />
              <Route path="inventory/new" element={<div>Add New Item (Coming Soon)</div>} />
              <Route path="inventory/:id" element={<div>Item Details (Coming Soon)</div>} />
              <Route path="inventory/:id/edit" element={<div>Edit Item (Coming Soon)</div>} />
              
              {/* Analytics routes */}
              <Route path="analytics" element={<div>Analytics Page (Coming Soon)</div>} />
              
              {/* User management routes (Admin/Manager only) */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'manager']}>
                    <div>Users Management (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />
              
              {/* Settings routes */}
              <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <a 
                      href="/dashboard" 
                      className="text-primary hover:text-primary/80 underline"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
