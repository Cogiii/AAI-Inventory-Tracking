import { createBrowserRouter } from 'react-router-dom';

import Layout from './components/layout/Layout';
import { ProtectedRoute, PublicRoute } from './components/auth';
import PermissionGuard from './components/auth/PermissionGuard';
import { RouterErrorBoundary } from './components/ErrorBoundary';
import { protectedRouteLoader, publicRouteLoader } from './utils/routeLoaders';

import {
  Login,
  NotFoundPage,
  UnauthorizedPage,
  Dashboard,
  Projects,
  ProjectDetail,
  Calendar,
  InventoryPage,
  ItemDetails,
  UsersPage,
} from './pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute restricted={true}>
        <Login />
      </PublicRoute>
    ),
    loader: publicRouteLoader,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute restricted={true}>
        <Login />
      </PublicRoute>
    ),
    loader: publicRouteLoader,
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
    loader: protectedRouteLoader,
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
    loader: protectedRouteLoader,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/calendar',
    element: (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <Calendar />
        </Layout>
      </ProtectedRoute>
    ),
    loader: protectedRouteLoader,
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
    loader: protectedRouteLoader,
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
    loader: protectedRouteLoader,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/inventory/item/:id',
    element: (
      <ProtectedRoute>
        <Layout showSidebar={true}>
          <ItemDetails />
        </Layout>
      </ProtectedRoute>
    ),
    loader: protectedRouteLoader,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <PermissionGuard requiredPermission="canManageUsers" showAccessDenied={true}>
          <Layout showSidebar={true}>
            <UsersPage />
          </Layout>
        </PermissionGuard>
      </ProtectedRoute>
    ),
    loader: protectedRouteLoader,
    errorElement: <RouterErrorBoundary />,
  },
  // Catch all route
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <RouterErrorBoundary />,
  },
]);
