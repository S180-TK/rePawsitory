import React from 'react';
import { Users } from 'lucide-react';

const SharingPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Share Access</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Grant Vet Access</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search for veterinarians by name or clinic..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Access</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Dr. Sarah Johnson</h3>
                <p className="text-sm text-gray-600">Happy Paws Veterinary Clinic</p>
                <p className="text-xs text-gray-500 mt-1">Access to: Max, Luna</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold">
              Revoke Access
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Dr. Michael Chen</h3>
                <p className="text-sm text-gray-600">City Animal Hospital</p>
                <p className="text-xs text-gray-500 mt-1">Access to: Charlie</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold">
              Revoke Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingPage;
