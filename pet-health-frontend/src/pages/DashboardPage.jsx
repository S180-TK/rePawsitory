import React from 'react';
import { PlusCircle, Heart, FileText, Users, Bell } from 'lucide-react';

const DashboardPage = ({ userRole, pets, recentRecords, petsLoading, petsError }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          {userRole === 'owner' ? 'Pet Owner Dashboard' : 'Veterinarian Dashboard'}
        </h1>
        {userRole === 'owner' && (
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <PlusCircle size={20} />
            Add New Pet
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Pets</p>
              <p className="text-3xl font-bold mt-1">
                {petsLoading ? (
                  <span className="text-lg">Loading...</span>
                ) : petsError ? (
                  <span className="text-lg">--</span>
                ) : (
                  pets.length
                )}
              </p>
              {petsError && (
                <p className="text-blue-200 text-xs mt-1">Unable to load</p>
              )}
            </div>
            <Heart size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Medical Records</p>
              <p className="text-3xl font-bold mt-1">24</p>
            </div>
            <FileText size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">
                {userRole === 'owner' ? 'Shared With Vets' : 'Active Patients'}
              </p>
              <p className="text-3xl font-bold mt-1">{userRole === 'owner' ? '2' : '12'}</p>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentRecords.map(record => (
            <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{record.title}</p>
                  <p className="text-sm text-gray-600">{record.petName} • {record.type}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{record.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              + Add Medical Record
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              📅 Schedule Appointment
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              🔗 Share Pet Records
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Reminders</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Bell size={20} className="text-yellow-600" />
              <div>
                <p className="font-semibold text-gray-800">Max - Deworming Due</p>
                <p className="text-sm text-gray-600">Due in 3 days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Bell size={20} className="text-yellow-600" />
              <div>
                <p className="font-semibold text-gray-800">Luna - Annual Checkup</p>
                <p className="text-sm text-gray-600">Due in 1 week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
