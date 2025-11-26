import React, { useEffect, useState, useCallback } from 'react';
import AddRecordModal from '../components/AddRecordModal';
import ViewRecordModal from '../components/ViewRecordModal';
import { ArrowLeft, Edit2, Trash2, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config';

const PetRecordsPage = ({ pet, onBack, viewOnly = false, isOwner = false, onEditPet = null }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserId(user.id || user._id);
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const petId = pet._id || pet.id;
      
      if (!petId) {
        console.error('Pet object:', pet);
        throw new Error('Pet ID is missing');
      }
      
      console.log('Fetching records for pet ID:', petId);
      const res = await fetch(`${API_BASE_URL}/api/pets/${petId}/medical-records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Response error:', res.status, errorData);
        throw new Error(errorData.error || 'Failed to load records');
      }
      
      const data = await res.json();
      console.log('Fetched records:', data);
      setRecords(data);
    } catch (err) {
      console.error('Error in fetchRecords:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pet]);

  useEffect(() => { if (pet) fetchRecords(); }, [pet, fetchRecords]);

  const handleAdd = (newRecord) => {
    // prepend
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleEdit = (updated) => {
    setRecords(prev => prev.map(r => r._id === updated._id ? updated : r));
    setEditingRecord(null);
  };

  const handleDelete = async (rec) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/medical-records/${rec._id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setRecords(prev => prev.filter(r => r._id !== rec._id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete record');
    }
  };

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
      {/* Back button */}
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to {isOwner ? 'My Pets' : 'Patients'}</span>
        </button>
      </div>

      {/* Pet Details Header Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex gap-6">
          {/* Left Side - Pet Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{pet.name}</h1>
            
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
              <div>
                <span className="text-sm font-semibold text-gray-500">Species</span>
                <p className="text-gray-800">{pet.species}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500">Breed</span>
                <p className="text-gray-800">{pet.breed || 'Mixed'}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500">Age</span>
                <p className="text-gray-800">{calculateAge(pet.dateOfBirth)}</p>
              </div>
              {pet.gender && (
                <div>
                  <span className="text-sm font-semibold text-gray-500">Gender</span>
                  <p className="text-gray-800 capitalize">{pet.gender}</p>
                </div>
              )}
              {pet.weight?.value && (
                <div>
                  <span className="text-sm font-semibold text-gray-500">Weight</span>
                  <p className="text-gray-800">{pet.weight.value} {pet.weight.unit}</p>
                </div>
              )}
              {pet.color && (
                <div>
                  <span className="text-sm font-semibold text-gray-500">Color</span>
                  <p className="text-gray-800">{pet.color}</p>
                </div>
              )}
            </div>

            {/* Allergies Warning */}
            {pet.allergies && pet.allergies.length > 0 && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-semibold text-sm">⚠️ Allergies:</span>
                  <div className="flex flex-wrap gap-2">
                    {pet.allergies.map((allergy, idx) => (
                      <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chronic Conditions */}
            {pet.chronicConditions && pet.chronicConditions.length > 0 && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-amber-700 font-semibold text-sm">📋 Chronic Conditions:</span>
                  <div className="flex flex-wrap gap-2">
                    {pet.chronicConditions.map((condition, idx) => (
                      <span key={idx} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        {condition.condition || condition}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Pet Photo */}
          <div className="flex-shrink-0 w-80">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg overflow-hidden h-64 flex items-center justify-center">
              {pet.photoUrl ? (
                <img 
                  src={`${API_BASE_URL}${pet.photoUrl}`}
                  alt={pet.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">
                  {pet.species?.toLowerCase() === 'dog' ? '🐕' : 
                   pet.species?.toLowerCase() === 'cat' ? '🐱' : '🐾'}
                </span>
              )}
            </div>
            
            {/* Remove Pet Button (Owner Only) */}
            {isOwner && (
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to remove ${pet.name}? This action cannot be undone.`)) {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${API_BASE_URL}/pets/${pet._id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      
                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        console.error('Delete error response:', res.status, errorData);
                        throw new Error(errorData.error || 'Failed to delete pet');
                      }
                      
                      alert(`${pet.name} has been removed successfully.`);
                      onBack(); // Go back to My Pets page
                    } catch (err) {
                      console.error('Error deleting pet:', err);
                      alert(`Failed to remove pet: ${err.message}`);
                    }
                  }
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                <Trash2 size={18} />
                Remove Pet
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons - Bottom */}
        {!viewOnly && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {isOwner ? (
              // Owner sees only Edit Pet Info button
              onEditPet && (
                <button 
                  onClick={onEditPet} 
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  <Edit2 size={18} />
                  Edit Pet Info
                </button>
              )
            ) : (
              // Vet sees both buttons
              <div className="flex gap-3">
                {onEditPet && (
                  <button 
                    onClick={onEditPet} 
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                  >
                    <Edit2 size={18} />
                    Edit Pet Info
                  </button>
                )}
                <button 
                  onClick={() => setIsAddOpen(true)} 
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  + Add Medical Record
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medical Records Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Medical Records</h2>
            <p className="text-sm text-gray-500 mt-1">Complete medical history for {pet.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{records.length}</div>
            <div className="text-xs text-gray-500">Total Records</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading medical records...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600 font-semibold mb-2">Failed to load records</p>
            <p className="text-gray-600 text-sm">Please try refreshing the page</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg font-medium mb-2">No medical records yet</p>
            <p className="text-gray-500 text-sm mb-4">
              {isOwner 
                ? `${pet.name} doesn't have any medical records yet` 
                : `Get started by adding ${pet.name}'s first medical record`
              }
            </p>
            {!isOwner && (
              <button 
                onClick={() => setIsAddOpen(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Add First Record
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {records.map(rec => {
              // Check if current user created this record
              const isCreator = rec.createdBy && currentUserId && 
                (rec.createdBy._id === currentUserId || rec.createdBy === currentUserId);
              
              return (
                <div 
                  key={rec._id} 
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{rec.title || rec.recordType}</h3>
                      <p className="text-sm text-gray-600">
                        <span className="capitalize">{rec.recordType.replace('_', ' ')}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(rec.date)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewingRecord(rec)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                    >
                      View Details
                    </button>
                    {/* Only vets who created the record can edit and delete */}
                    {!isOwner && isCreator && (
                      <>
                        <button 
                          onClick={() => setEditingRecord(rec)} 
                          className="px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-2 font-semibold"
                        >
                          <Edit2 size={16}/> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(rec)} 
                          className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2 font-semibold"
                        >
                          <Trash2 size={16}/> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ViewRecordModal 
        isOpen={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
      />

      <AddRecordModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={(r) => { handleAdd(r); setIsAddOpen(false); }}
        petId={pet._id}
      />

      {editingRecord && (
        <AddRecordModal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleEdit}
          petId={pet._id}
          initialData={editingRecord}
        />
      )}
    </div>
  );
};

export default PetRecordsPage;
