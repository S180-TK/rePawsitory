import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, MapPin, Award, Building2 } from 'lucide-react';
import { usePets } from '../hooks/usePets';
import { API_BASE_URL } from '../config';

const SharingPage = () => {
  const { pets } = usePets();
  const [veterinarians, setVeterinarians] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [currentAccess, setCurrentAccess] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [selectedPets, setSelectedPets] = useState([]);
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const vetsPerPage = 5;

  // Fetch veterinarians
  useEffect(() => {
    const fetchVeterinarians = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/vets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setVeterinarians(data);
          setFilteredVets(data);
        }
      } catch (error) {
        console.error('Error fetching veterinarians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVeterinarians();
  }, []);

  // Fetch current access (you'll need to create this endpoint)
  useEffect(() => {
    const fetchCurrentAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/pet-access/my-grants`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentAccess(data);
        }
      } catch (error) {
        console.error('Error fetching current access:', error);
      }
    };

    fetchCurrentAccess();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVets(veterinarians);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = veterinarians.filter(vet => 
        vet.name.toLowerCase().includes(query) ||
        vet.clinic.toLowerCase().includes(query) ||
        vet.specialization.toLowerCase().includes(query) ||
        (vet.address?.city && vet.address.city.toLowerCase().includes(query))
      );
      setFilteredVets(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, veterinarians]);

  // Pagination
  const indexOfLastVet = currentPage * vetsPerPage;
  const indexOfFirstVet = indexOfLastVet - vetsPerPage;
  const currentVets = filteredVets.slice(indexOfFirstVet, indexOfLastVet);
  const totalPages = Math.ceil(filteredVets.length / vetsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGrantAccess = (vet) => {
    setSelectedVet(vet);
    setSelectedPets([]);
    setShowGrantModal(true);
  };

  const togglePetSelection = (petId) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      } else {
        return [...prev, petId];
      }
    });
  };

  const confirmGrantAccess = async () => {
    if (selectedPets.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one pet' });
      return;
    }

    setGrantingAccess(true);
    try {
      const token = localStorage.getItem('token');
      
      // Grant access for each selected pet
      const promises = selectedPets.map(petId =>
        fetch(`${API_BASE_URL}/api/pet-access/grant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            petId,
            veterinarianId: selectedVet._id,
            accessLevel: 'write',
            permissions: {
              viewMedicalRecords: true,
              addMedicalRecords: true,
              editPetInfo: true,
              viewOwnerInfo: true
            }
          })
        })
      );

      await Promise.all(promises);

      setMessage({ type: 'success', text: `Successfully granted access to Dr. ${selectedVet.name}` });
      setShowGrantModal(false);
      setSelectedVet(null);
      setSelectedPets([]);

      // Refresh current access list
      const response = await fetch(`${API_BASE_URL}/api/pet-access/my-grants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentAccess(data);
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error granting access:', error);
      setMessage({ type: 'error', text: 'Failed to grant access. Please try again.' });
    } finally {
      setGrantingAccess(false);
    }
  };

  const handleRevokeAccess = async (accessId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/pet-access/revoke/${accessId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Access revoked successfully' });
        // Refresh current access list
        const refreshResponse = await fetch(`${API_BASE_URL}/api/pet-access/my-grants`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCurrentAccess(data);
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error revoking access:', error);
      setMessage({ type: 'error', text: 'Failed to revoke access' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Share Access</h1>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Search Veterinarians */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Search Veterinarians</h2>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, clinic, specialization, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Veterinarians List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading veterinarians...</div>
        ) : currentVets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No veterinarians found matching your search.' : 'No veterinarians available.'}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentVets.map((vet) => (
                <div key={vet._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={28} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{vet.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Building2 size={14} />
                        <span>{vet.clinic}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Award size={14} />
                        <span>{vet.specialization}</span>
                      </div>
                      {vet.address?.city && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin size={14} />
                          <span>{vet.address.city}, {vet.address.state}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">License: {vet.license}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleGrantAccess(vet)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
                  >
                    Grant Access
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstVet + 1} to {Math.min(indexOfLastVet, filteredVets.length)} of {filteredVets.length} veterinarians
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="text-gray-400">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Current Access */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Access</h2>
        {currentAccess.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You haven't granted access to any veterinarians yet.
          </div>
        ) : (
          <div className="space-y-4">
            {currentAccess.map((access) => (
              <div key={access._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{access.veterinarian?.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600">{access.veterinarian?.clinic || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Access to: {access.pets?.map(p => p.name).join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRevokeAccess(access._id)}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grant Access Modal */}
      {showGrantModal && selectedVet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Grant Access to Dr. {selectedVet.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which pets you want to grant access to:
            </p>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {pets.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No pets available</p>
              ) : (
                pets.map((pet) => (
                  <label
                    key={pet._id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPets.includes(pet._id)}
                      onChange={() => togglePetSelection(pet._id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{pet.name}</div>
                      <div className="text-sm text-gray-500">{pet.species} • {pet.breed}</div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGrantModal(false);
                  setSelectedVet(null);
                  setSelectedPets([]);
                }}
                disabled={grantingAccess}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmGrantAccess}
                disabled={grantingAccess || selectedPets.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {grantingAccess ? 'Granting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharingPage;
