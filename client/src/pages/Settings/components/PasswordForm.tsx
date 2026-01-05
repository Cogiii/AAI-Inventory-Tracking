import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';

interface PasswordFormProps {
  onSave: (data: PasswordData) => Promise<void>;
  loading?: boolean;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordForm: FC<PasswordFormProps> = ({ onSave, loading = false }) => {
  const [formData, setFormData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<PasswordData>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof PasswordData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<PasswordData> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword && formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSave(formData);
      // Clear form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const renderPasswordInput = (
    name: keyof PasswordData,
    label: string,
    placeholder: string,
    showField: 'current' | 'new' | 'confirm'
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswords[showField] ? 'text' : 'password'}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => toggleShowPassword(showField)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPasswords[showField] ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {renderPasswordInput('currentPassword', 'Current Password', 'Enter your current password', 'current')}
        {renderPasswordInput('newPassword', 'New Password', 'Enter new password (min 8 characters)', 'new')}
        {renderPasswordInput('confirmPassword', 'Confirm New Password', 'Confirm your new password', 'confirm')}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements</h4>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>At least 8 characters long</li>
          <li>Must be different from your current password</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Changing Password...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PasswordForm;
