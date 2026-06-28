import React, { useState, useEffect } from 'react';
import { Heart, FileText, Users, AlertTriangle, Settings } from 'lucide-react';
import ViewRecordModal from '../components/ViewRecordModal';
import { API_BASE_URL } from '../config';

const DashboardPage = ({ userRole, pets, petsLoading, petsError, setCurrentPage }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = user?.id || user?._id;
  const [profileComplete, setProfileComplete] = useState(true); // Default to true to avoid showing warning before check
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [viewingRecord, setViewingRecord] = useState(null);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
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

  // Fetch recent medical records for pet owners
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (userRole !== 'owner' || !pets || pets.length === 0) {
        setLoadingActivity(false);
        return;
      }

      setLoadingActivity(true);
      try {
        const token = localStorage.getItem('token');
        const recordsPromises = pets.map(pet =>
          fetch(`${API_BASE_URL}/api/pets/${pet._id}/medical-records`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : [])
            .then(records => records.map(r => ({ ...r, petName: pet.name, petId: pet._id })))
        );
        
        const results = await Promise.all(recordsPromises);
        const combined = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // Get only the 3 most recently created records
        setRecentActivity(combined.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setRecentActivity([]);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentActivity();
  }, [pets, userRole]);

  // Fetch records created by veterinarian
  useEffect(() => {
    const fetchVetRecords = async () => {
      if (userRole !== 'vet') {
        return;
      }

      setLoadingActivity(true);
      try {
        const token = localStorage.getItem('token');
        console.log('User ID:', userId);
        
        // Fetch all patients
        const patientsResponse = await fetch(`${API_BASE_URL}/api/vet/patients`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (patientsResponse.ok) {
          const patients = await patientsResponse.json();
          
          // Fetch medical records for all patients
          const recordsPromises = patients.map(pet =>
            fetch(`${API_BASE_URL}/api/pets/${pet._id}/medical-records`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : [])
              .then(records => records.map(r => ({ ...r, petName: pet.name, petId: pet._id })))
          );
          
          const results = await Promise.all(recordsPromises);
          const allRecords = results.flat();
          
          console.log('All records:', allRecords);
          console.log('Current user ID:', userId);
          
          // Filter records created by this vet
          // Handle both cases: createdBy as ObjectId string or as populated object
          const myRecords = allRecords.filter(record => {
            const createdById = typeof record.createdBy === 'object' ? record.createdBy?._id : record.createdBy;
            const veterinarianId = typeof record.veterinarian === 'object' ? record.veterinarian?._id : record.veterinarian;
            
            return createdById === userId || veterinarianId === userId;
          });
          
          console.log('My records:', myRecords);
          
          // Get only the 3 most recently CREATED records (not by procedure date)
          const sortedRecords = myRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentActivity(sortedRecords.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching vet records:', error);
        setRecentActivity([]);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchVetRecords();
  }, [userRole, userId]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ownerActions = [
    {
      title: 'Manage Pets',
      description: petsLoading
        ? 'Loading your pet profiles...'
        : petsError
          ? 'Open your pet list and try refreshing your profiles.'
          : pets && pets.length > 0
            ? 'Keep each pet profile, photo, and health details up to date.'
            : 'Add your first pet profile so records have a home.',
      icon: Heart,
      page: 'pets',
      button: 'Open Pets'
    },
    {
      title: 'Review Records',
      description: 'Browse medical history by pet and record type.',
      icon: FileText,
      page: 'records',
      button: 'View Records'
    },
    {
      title: 'Share Records',
      description: 'Choose which pets to share with an approved veterinarian.',
      icon: Users,
      page: 'sharing',
      button: 'Share Records'
    }
  ];

  const vetActions = [
    {
      title: 'Open Patients',
      description: 'Review pets whose records have been shared with you.',
      icon: Users,
      page: 'patients',
      button: 'View Patients'
    },
    {
      title: 'Recent Records',
      description: 'Use recent activity below to jump back into records you created.',
      icon: FileText,
      page: null,
      button: null
    },
    {
      title: 'Clinic Profile',
      description: 'Keep your clinic, specialization, and contact details current.',
      icon: Settings,
      page: 'settings',
      button: 'Open Settings'
    }
  ];

  const actionCards = userRole === 'owner' ? ownerActions : vetActions;

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
                {' '}before you can {userRole === 'owner' ? 'add pets or share records with veterinarians' : 'view your assigned patients'}.
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

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actionCards.map(({ title, description, icon: Icon, page, button }) => (
          <div key={title} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Icon size={24} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-5 min-h-[44px]">{description}</p>
            {button && (
              <button
                onClick={() => setCurrentPage(page)}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                {button}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        {loadingActivity ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-500 text-sm">Loading recent activity...</p>
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FileText size={40} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No recent medical records</p>
            <p className="text-gray-500 text-sm mt-1">Recent medical records will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map(record => (
              <div 
                key={record._id} 
                onClick={() => setViewingRecord(record)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{record.title || record.recordType}</p>
                    <p className="text-sm text-gray-600">
                      {record.petName} • <span className="capitalize">{record.recordType.replace('_', ' ')}</span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ViewRecordModal 
        isOpen={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
      />
    </div>
  );
};

export default DashboardPage;
