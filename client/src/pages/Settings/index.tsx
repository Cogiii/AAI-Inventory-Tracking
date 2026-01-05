import { useState } from 'react';
import type { FC } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Lock, Shield, Mail, AtSign } from 'lucide-react';
import ProfileForm from './components/ProfileForm';
import PasswordForm from './components/PasswordForm';
import AuthService from '@/services/auth/AuthService';

const Settings: FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showMessage = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setErrorMessage(null);
    } else {
      setErrorMessage(message);
      setSuccessMessage(null);
    }
    // Auto-clear message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 5000);
  };

  const handleProfileSave = async (data: { first_name: string; last_name: string; email: string; username: string }) => {
    setProfileLoading(true);
    try {
      await AuthService.updateProfile(data as any);
      // Refresh user data
      await refreshUser();
      showMessage('success', 'Profile updated successfully');
    } catch (error: any) {
      // Handle both axios error format and transformed ApiError format
      const message = error.message || error.response?.data?.error || 'Failed to update profile';
      showMessage('error', message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    setPasswordLoading(true);
    try {
      await AuthService.changePassword(data.currentPassword, data.newPassword);
      showMessage('success', 'Password changed successfully');
    } catch (error: any) {
      // Handle both axios error format and transformed ApiError format
      const message = error.message || error.response?.data?.error || 'Failed to change password';
      showMessage('error', message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 p-7">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-7">
      {/* Header */}
      <div className="bg-gray space-y-6 p-7 rounded-lg">
        <div>
          <h1 className="text-2xl font-semibold text-gray-custom">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile and security settings</p>
        </div>

        {/* User Info Card */}
        <div className="flex items-center space-x-4 p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-xl">
                {user.first_name?.charAt(0) || ''}{user.last_name?.charAt(0) || ''}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </h3>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {user.email}
              </span>
              <span className="flex items-center">
                <AtSign className="w-4 h-4 mr-1" />
                {user.username}
              </span>
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                {user.positionName || 'No Position'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Security
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'profile' ? (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <p className="text-gray-600 mt-1">Update your personal information</p>
            </div>
            <ProfileForm
              user={user}
              onSave={handleProfileSave}
              loading={profileLoading}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-gray-600 mt-1">Update your password to keep your account secure</p>
            </div>
            <PasswordForm
              onSave={handlePasswordChange}
              loading={passwordLoading}
            />
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Position:</span>
            <span className="ml-2 font-medium text-gray-900">{user.positionName || 'No Position'}</span>
          </div>
          <div>
            <span className="text-gray-500">Account Status:</span>
            <span className={`ml-2 font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Member Since:</span>
            <span className="ml-2 font-medium text-gray-900">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>
            <span className="ml-2 font-medium text-gray-900">
              {user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Never'}
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Note: Your position and account status can only be changed by an administrator.
        </p>
      </div>
    </div>
  );
};

export default Settings;
