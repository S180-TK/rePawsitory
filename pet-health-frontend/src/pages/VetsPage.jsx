import React, { useState, useEffect } from 'react';
import { Search, MapPin, Award, Building2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const VetsPage = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/vets`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch veterinarians');
        }

        const data = await response.json();
        setVets(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err);
        console.error('Error fetching vets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVets();
  }, []);

  // Filter vets based on search
  const filteredVets = vets.filter(vet =>
    vet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.clinic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.address?.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Find a Veterinarian</h1>
          <p className="text-gray-600 mt-1">Search for veterinarians in your area</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{filteredVets.length}</div>
          <div className="text-sm text-gray-500">Veterinarians Available</div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by vet name, clinic, specialization, or location..."
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

      {loading ? (
        <div className="text-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading veterinarians...</p>
        </div>
      ) : error ? (
        <div className="text-center p-12 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-2">Failed to load veterinarians</p>
          <p className="text-gray-600 text-sm">{error.message || 'Please try refreshing the page'}</p>
        </div>
      ) : filteredVets.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">
            {searchTerm ? 'No veterinarians match your search' : 'No veterinarians found'}
          </p>
          <p className="text-gray-500 text-sm">
            {searchTerm ? 'Try adjusting your search terms' : 'Please check back later'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVets.map(vet => (
            <div key={vet._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 h-24 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">👨‍⚕️</div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{vet.name}</h3>
                
                {/* Clinic badge */}
                <div className="mb-3 flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                  <Building2 size={16} />
                  <span className="font-medium">{vet.clinic}</span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {/* Specialization */}
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-blue-500" />
                    <span><span className="font-semibold">Specialization:</span> {vet.specialization}</span>
                  </div>

                  {/* License */}
                  {vet.license && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        License: {vet.license}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {vet.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-red-500 mt-0.5" />
                      <div className="text-xs">
                        {vet.address.city && vet.address.state && (
                          <div>{vet.address.city}, {vet.address.state}</div>
                        )}
                        {vet.address.street && (
                          <div className="text-gray-500">{vet.address.street}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
                    Request Access
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
                    View Profile
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

export default VetsPage;
