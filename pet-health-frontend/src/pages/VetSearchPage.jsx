import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, UserCheck } from 'lucide-react';

const VetSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vets, setVets] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVets();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVets(vets);
    } else {
      const filtered = vets.filter(vet => 
        vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vet.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVets(filtered);
    }
  }, [searchTerm, vets]);

  const fetchVets = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const url = `${apiUrl}/api/vets`;
      
      console.log('Fetching vets from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Response error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch veterinarians');
      }

      const data = await response.json();
      console.log('Fetched vets:', data);
      setVets(data);
      setFilteredVets(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vets:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const requestAccess = async (vetId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/pet-access/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vetId })
      });

      if (!response.ok) {
        throw new Error('Failed to send access request');
      }

      alert('Access request sent successfully!');
    } catch (err) {
      console.error('Error requesting access:', err);
      alert('Failed to send access request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading veterinarians...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find a Veterinarian</h1>
        <p className="text-gray-600 mt-2">Search and connect with veterinarians to share your pet's health records</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results */}
      {filteredVets.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No veterinarians found</h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVets.map((vet) => (
            <div key={vet._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{vet.name}</h3>
                  {vet.specialization && (
                    <p className="text-sm text-blue-600 mt-1">{vet.specialization}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span className="truncate">{vet.email}</span>
                </div>
                {vet.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span>{vet.phone}</span>
                  </div>
                )}
                {vet.clinic && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span>{vet.clinic}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => requestAccess(vet._id)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all"
              >
                <UserCheck size={18} />
                <span>Request Access</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VetSearchPage;
