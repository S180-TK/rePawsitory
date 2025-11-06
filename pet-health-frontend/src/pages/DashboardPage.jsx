import React, { useState, useEffect } from 'react';
import { Heart, FileText, Users, Bell, AlertTriangle, Settings } from 'lucide-react';

const DashboardPage = ({ userRole, pets, recentRecords, petsLoading, petsError, setCurrentPage }) => {
  const [profileComplete, setProfileComplete] = useState(true); // Default to true to avoid showing warning before check
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Set profile complete based on backend response
          // If profileCompleted is explicitly true, mark as complete
          // Otherwise mark as incomplete
          const isComplete = data.user.profileCompleted === true;
          console.log('Profile completion check:', isComplete, data.user);
          setProfileComplete(isComplete);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        // On error, assume profile is complete to avoid false warnings
        setProfileComplete(true);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          {userRole === 'owner' ? 'Pet Owner Dashboard' : 'Veterinarian Dashboard'}
        </h1>
      </div>

      {/* Profile Completion Warning */}
      {!checkingProfile && !profileComplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Complete Your Profile
              </h3>
              <p className="text-yellow-800 mb-4">
                Please complete your profile to unlock all features. You need to add your phone number and address
                {userRole === 'vet' && ', along with your clinic name, license number, and specialization'}
                {' '}before you can {userRole === 'owner' ? 'add pets or grant access to veterinarians' : 'view your assigned patients'}.
              </p>
              <button
                onClick={() => setCurrentPage('settings')}
                className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
              >
                <Settings size={18} />
                Complete Profile Now
              </button>
            </div>
          </div>
        </div>
      )}

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
