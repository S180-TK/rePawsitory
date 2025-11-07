import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Calendar, Weight, Heart, AlertCircle, AlertTriangle, Settings } from 'lucide-react';
import AddPetModal from '../components/AddPetModal';
import EditPetModal from '../components/EditPetModal';
import PetRecordsPage from './PetRecordsPage';
import { useNavigation } from '../hooks/useNavigation';

const PetsPage = ({ pets, petsLoading, petsError, addPet, refetchPets }) => {
  const { navigateTo } = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [showError, setShowError] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'view' or 'edit'
  const [editingPet, setEditingPet] = useState(null);

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
          setProfileComplete(data.user.profileCompleted || false);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, []);

  const handleAddPetClick = () => {
    if (!profileComplete) {
      setShowError(true);
      // Auto-hide error after 5 seconds
      setTimeout(() => setShowError(false), 5000);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleUpdatePet = async () => {
    // Refresh the pets list after updating
    setEditingPet(null);
    if (refetchPets) {
      refetchPets(); // Refresh pets data without reloading the page
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const ageInYears = today.getFullYear() - birthDate.getFullYear();
    const ageInMonths = today.getMonth() - birthDate.getMonth();
    
    if (ageInYears > 0) {
      return `${ageInYears} year${ageInYears > 1 ? 's' : ''}`;
    } else if (ageInMonths >= 0) {
      return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''}`;
    } else {
      return `${12 + ageInMonths} month${(12 + ageInMonths) > 1 ? 's' : ''}`;
    }
  };

  // Helper function to get gender icon/text
  const getGenderDisplay = (gender) => {
    switch(gender) {
      case 'male': return '♂️ Male';
      case 'female': return '♀️ Female';
      default: return '? Unknown';
    }
  };

  // If viewing a pet's records, show PetRecordsPage
  if (selectedPet && viewMode === 'view') {
    return (
      <PetRecordsPage 
        pet={selectedPet} 
        onBack={() => setSelectedPet(null)}
        viewOnly={false}
        isOwner={true}
        onEditPet={() => {
          setEditingPet(selectedPet);
          setSelectedPet(null);
          setViewMode(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Pets</h1>
        <button 
          onClick={handleAddPetClick}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          Add New Pet
        </button>
      </div>

      {/* Profile Incomplete Warning - Non-dismissible */}
      {!checkingProfile && !profileComplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Complete Your Profile to Add Pets
              </h3>
              <p className="text-yellow-800 mb-4">
                You need to add your phone number and address in Settings before you can add pets to your account.
              </p>
              <button
                onClick={() => navigateTo('settings')}
                className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
              >
                <Settings size={18} />
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message when trying to add pet with incomplete profile */}
      {showError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-800 font-medium">
                Please complete your profile before adding pets. Click "Go to Settings" above to add your phone number and address.
              </p>
            </div>
          </div>
        </div>
      )}

      <AddPetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addPet}
      />

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search pets by name or breed..."
          className="flex-1 outline-none text-gray-700"
        />
      </div>

      {petsLoading ? (
        <div className="text-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your pets...</p>
        </div>
      ) : petsError ? (
        <div className="text-center p-12 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-2">Failed to load pets</p>
          <p className="text-gray-600 text-sm">Please try refreshing the page</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">No pets found</p>
          <p className="text-gray-500 text-sm">Add your first pet to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map(pet => (
          <div key={pet.id || pet._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 aspect-square flex items-center justify-center overflow-hidden relative">
              {pet.photoUrl ? (
                <img 
                  src={`http://localhost:5001${pet.photoUrl}`}
                  alt={pet.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">🐾</span>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                  <p className="text-sm text-gray-500">{pet.species} • {pet.breed || 'Mixed breed'}</p>
                </div>
                <span className="text-3xl">{pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐈' : '🐾'}</span>
              </div>

              <div className="mt-4">
                <button 
                  onClick={() => {
                    setSelectedPet(pet);
                    setViewMode('view');
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addPet}
      />

      {/* Edit Pet Modal */}
      <EditPetModal
        isOpen={!!editingPet}
        onClose={() => setEditingPet(null)}
        onSave={handleUpdatePet}
        pet={editingPet}
      />
    </div>
  );
};

export default PetsPage;
