import React, { useState } from 'react';
import { PlusCircle, Search, Calendar, Weight, Heart, AlertCircle } from 'lucide-react';
import AddPetModal from '../components/AddPetModal';

const PetsPage = ({ pets, petsLoading, petsError, addPet }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Pets</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          Add New Pet
        </button>
      </div>

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
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-32 flex items-center justify-center overflow-hidden relative">
              {pet.photoUrl ? (
                <img 
                  src={`http://localhost:5000${pet.photoUrl}`}
                  alt={pet.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">🐾</span>
              )}
              {pet.microchipId && (
                <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-semibold text-blue-700">
                  Microchipped
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                  <p className="text-sm text-gray-500">{pet.breed || 'Mixed breed'}</p>
                </div>
                <span className="text-2xl">{pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐈' : '🐾'}</span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  <span><span className="font-semibold">Age:</span> {calculateAge(pet.dateOfBirth)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-pink-600" />
                  <span>{getGenderDisplay(pet.gender)}</span>
                </div>

                {pet.weight && pet.weight.value && (
                  <div className="flex items-center gap-2">
                    <Weight size={16} className="text-green-600" />
                    <span><span className="font-semibold">Weight:</span> {pet.weight.value} {pet.weight.unit}</span>
                  </div>
                )}

                {pet.color && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" style={{backgroundColor: pet.color.toLowerCase()}}></div>
                    <span><span className="font-semibold">Color:</span> {pet.color}</span>
                  </div>
                )}

                {pet.allergies && pet.allergies.length > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-red-600 font-semibold">{pet.allergies.length} Allerg{pet.allergies.length > 1 ? 'ies' : 'y'}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold">
                  View Details
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default PetsPage;
