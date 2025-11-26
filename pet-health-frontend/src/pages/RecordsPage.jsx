import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import ViewRecordModal from '../components/ViewRecordModal';
import { API_BASE_URL } from '../config';

const RecordsPage = ({ pets }) => {
  const [allRecords, setAllRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPet, setSelectedPet] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewingRecord, setViewingRecord] = useState(null);

  // Fetch all medical records for all pets
  useEffect(() => {
    const fetchAllRecords = async () => {
      if (!pets || pets.length === 0) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const recordsPromises = pets.map(pet =>
          fetch(`${API_BASE_URL}/api/pets/${pet._id}/medical-records`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : [])
            .then(records => records.map(r => ({ ...r, petName: pet.name, petId: pet._id })))
        );
        
        const results = await Promise.all(recordsPromises);
        const combined = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllRecords(combined);
        setFilteredRecords(combined);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecords();
  }, [pets]);

  // Filter records when filters change
  useEffect(() => {
    let filtered = allRecords;

    if (selectedPet !== 'all') {
      filtered = filtered.filter(r => r.petId === selectedPet);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(r => r.recordType === selectedType);
    }

    setFilteredRecords(filtered);
  }, [selectedPet, selectedType, allRecords]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <select 
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Pets</option>
            {pets && pets.map(pet => (
              <option key={pet._id} value={pet._id}>{pet.name}</option>
            ))}
          </select>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="vaccination">Vaccination</option>
            <option value="medication">Medication</option>
            <option value="checkup">Checkup</option>
            <option value="surgery">Surgery</option>
            <option value="lab_result">Lab Result</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading medical records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg font-medium mb-2">No medical records found</p>
            <p className="text-gray-500 text-sm">
              {selectedPet !== 'all' || selectedType !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add medical records for your pets to see them here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map(record => (
              <div 
                key={record._id} 
                onClick={() => setViewingRecord(record)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{record.title || record.recordType}</h3>
                    <p className="text-sm text-gray-600">
                      {record.petName} • <span className="capitalize">{record.recordType}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(record.date)}</p>
                  </div>
                </div>
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

export default RecordsPage;
