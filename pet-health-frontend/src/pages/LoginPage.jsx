import React, { useState } from 'react';

const LoginPage = ({ login }) => {
  const [role, setRole] = useState('owner');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Choose your role to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="owner">Pet Owner</option>
              <option value="vet">Veterinarian</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


