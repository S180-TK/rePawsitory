import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import PetRecordsPage from './PetRecordsPage';

const PatientsPage = ({ patients, patientsLoading, patientsError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    
    // Search in basic fields
    const matchesBasic = 
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.species?.toLowerCase().includes(searchLower) ||
      patient.breed?.toLowerCase().includes(searchLower) ||
      patient.owner?.name?.toLowerCase().includes(searchLower);
    
    // Search in additional fields
    const matchesGender = patient.gender?.toLowerCase().includes(searchLower);
    const matchesColor = patient.color?.toLowerCase().includes(searchLower);
    
    // Search in allergies array
    const matchesAllergies = patient.allergies?.some(allergy => 
      allergy.toLowerCase().includes(searchLower)
    );
    
    // Search in chronic conditions
    const matchesConditions = patient.chronicConditions?.some(condition => {
      const conditionStr = typeof condition === 'string' ? condition : condition.condition;
      return conditionStr?.toLowerCase().includes(searchLower);
    });
    
    return matchesBasic || matchesGender || matchesColor || matchesAllergies || matchesConditions;
  });

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInYears = today.getFullYear() - birthDate.getFullYear();
    const ageInMonths = today.getMonth() - birthDate.getMonth();
    
    if (ageInYears > 0) {
      return `${ageInYears} year${ageInYears > 1 ? 's' : ''}`;
    } else {
      return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''}`;
    }
  };

  if (selectedPet) {
    return (
      <PetRecordsPage pet={selectedPet} onBack={() => setSelectedPet(null)} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
          <p className="text-gray-600 mt-1">Pets under your care</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
          <div className="text-sm text-gray-500">Total Patients</div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, species, breed, owner, allergies, conditions..."
          className="flex-1 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {patientsLoading ? (
        <div className="text-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your patients...</p>
        </div>
      ) : patientsError ? (
        <div className="text-center p-12 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-2">Failed to load patients</p>
          <p className="text-gray-600 text-sm">{patientsError.message || 'Please try refreshing the page'}</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">
            {searchTerm ? 'No patients match your search' : 'No patients assigned yet'}
          </p>
          <p className="text-gray-500 text-sm">
            {searchTerm ? 'Try adjusting your search terms' : 'Patients will appear here when pet owners grant you access'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map(patient => (
            <div key={patient._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-green-400 to-green-600 h-32 flex items-center justify-center overflow-hidden">
                {patient.photoUrl ? (
                  <img 
                    src={`http://localhost:5001${patient.photoUrl}`}
                    alt={patient.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">
                    {patient.species?.toLowerCase() === 'dog' ? '🐕' : 
                     patient.species?.toLowerCase() === 'cat' ? '🐱' : '🐾'}
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{patient.name}</h3>
                
                {/* Owner info badge */}
                <div className="mb-3 flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                  <User size={16} />
                  <span className="font-medium">{patient.owner?.name || 'Unknown Owner'}</span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p><span className="font-semibold">Species:</span> {patient.species}</p>
                  <p><span className="font-semibold">Breed:</span> {patient.breed || 'Mixed'}</p>
                  <p><span className="font-semibold">Age:</span> {calculateAge(patient.dateOfBirth)}</p>
                  {patient.gender && (
                    <p><span className="font-semibold">Gender:</span> {patient.gender}</p>
                  )}
                  {patient.weight?.value && (
                    <p><span className="font-semibold">Weight:</span> {patient.weight.value} {patient.weight.unit}</p>
                  )}
                </div>

                {/* Allergies badge if present */}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-red-600 mb-1">⚠️ Allergies:</div>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, idx) => (
                        <span key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4">
                  <button onClick={() => setSelectedPet(patient)} className="w-full bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold">
                    View Records
                  </button>
                </div>

                {/* Access level indicator */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Access: <span className="font-semibold capitalize">{patient.accessLevel || 'read'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
