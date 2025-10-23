import { createBrowserRouter } from 'react-router-dom';

import Layout from './components/layout/Layout';
import { ProtectedRoute, PublicRoute } from './components/auth';

import {
  Login,
  NotFoundPage,
  UnauthorizedPage,
  Dashboard,
  InventoryPage,
  AnalyticsPage,
  UsersPage,
  SettingsPage
} from './pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute restricted={true}>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute restricted={true}>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/inventory',
    element: (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <InventoryPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <AnalyticsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute requiredRoles={['admin', 'manager']}>
        <Layout showSidebar={true}>
          <UsersPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <SettingsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // Catch all route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
