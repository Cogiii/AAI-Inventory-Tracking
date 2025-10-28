import { createBrowserRouter } from 'react-router-dom';

import Layout from './components/layout/Layout';
import { ProtectedRoute, PublicRoute } from './components/auth';
import { RouterErrorBoundary } from './components/ErrorBoundary';

import {
  Login,
  NotFoundPage,
  UnauthorizedPage,
  Dashboard,
  Projects,
  ProjectDetail,
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
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute restricted={true}>
        <Login />
      </PublicRoute>
    ),
    errorElement: <RouterErrorBoundary />,
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
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/projects',
    element: (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <Projects />
        </Layout>
      </ProtectedRoute>
    ),
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/project/:joNumber',
    element: (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <ProjectDetail />
        </Layout>
      </ProtectedRoute>
    ),
    errorElement: <RouterErrorBoundary />,
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
    errorElement: <RouterErrorBoundary />,
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
    errorElement: <RouterErrorBoundary />,
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
    errorElement: <RouterErrorBoundary />,
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
    errorElement: <RouterErrorBoundary />,
  },

  // Catch all route
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <RouterErrorBoundary />,
  },
]);
