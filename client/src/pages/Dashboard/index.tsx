import { useAuth } from '../../hooks/useAuth';
import { useTokenValidation } from '../../hooks/useTokenValidation';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const { isValid, isValidating, validateToken } = useTokenValidation(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to Dashboard, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">
                AAI Inventory Management System
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Token Status:</span>
                {isValidating ? (
                  <span className="text-yellow-600 text-sm">Validating...</span>
                ) : isValid ? (
                  <span className="text-green-600 text-sm">✓ Valid</span>
                ) : (
                  <span className="text-red-600 text-sm">✗ Invalid</span>
                )}
                <button
                  onClick={() => validateToken(true)} // Force validation
                  className="text-blue-600 hover:text-blue-800 text-sm underline ml-2"
                  disabled={isValidating}
                >
                  Validate Now
                </button>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Your authenticated dashboard is working!</p>
          <p className="text-sm text-gray-500 mt-2">
            Token validation happens automatically on protected route access and can be triggered manually.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard