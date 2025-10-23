import React from 'react'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to Dashboard!
              </h1>
              <p className="text-gray-600 mt-2">
                AAI Inventory Management System
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Your authenticated dashboard is working!</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard