import React from 'react';

// Main pages
export { default as Login } from './Login';
export { default as RegisterPage } from './Register';
export { default as Dashboard } from './Dashboard';

// Utility pages
export { default as NotFoundPage } from './NotFound';
export { default as UnauthorizedPage } from './Unauthorized';

// Feature pages (placeholders for now)
export const InventoryPage: React.FC = () => <div className="text-center py-8">Inventory Page - Coming Soon</div>;
export const AnalyticsPage: React.FC = () => <div className="text-center py-8">Analytics Page - Coming Soon</div>;
export const UsersPage: React.FC = () => <div className="text-center py-8">Users Management - Coming Soon</div>;
export const SettingsPage: React.FC = () => <div className="text-center py-8">Settings Page - Coming Soon</div>;