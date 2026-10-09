import React, { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, XCircle } from 'lucide-react';
import { usePetPhotoUpload } from '../hooks/usePetPhotoUpload';
import PetPhoto from './PetPhoto';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

const EditPetModal = ({ isOpen, onClose, onSave, pet }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    dateOfBirth: '',
    gender: 'male',
    weight: '',
    weightUnit: 'kg',
    color: '',
    allergies: '',
    chronicConditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    emergencyContactRelationship: ''
  });
  const imageInput = useRef(null);
  const imageInputId = useId();
  const { photoUrl, imagePreview, uploading, uploadError, handleImageChange, handleRemoveImage, reset, canSubmit } =
    usePetPhotoUpload(isOpen, pet?.photoUrl || '', pet?._id);
  const { token } = useAuth();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with pet data when modal opens
  useEffect(() => {
    if (isOpen && pet) {
      setFormData({
        name: pet.name || '',
        species: pet.species || 'Dog',
        breed: pet.breed || '',
        dateOfBirth: pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : '',
        gender: pet.gender || 'male',
        weight: pet.weight?.value || '',
        weightUnit: pet.weight?.unit || 'kg',
        color: pet.color || '',
        allergies: Array.isArray(pet.allergies) ? pet.allergies.join(', ') : '',
        chronicConditions: Array.isArray(pet.chronicConditions) 
          ? pet.chronicConditions.map(c => c.condition || c).join(', ') 
          : '',
        emergencyContactName: pet.emergencyContact?.name || '',
        emergencyContactPhone: pet.emergencyContact?.phone || '',
        emergencyContactEmail: pet.emergencyContact?.email || '',
        emergencyContactRelationship: pet.emergencyContact?.relationship || ''
      });
      
      setErrors({});
    }
  }, [isOpen, pet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Pet name is required';
    if (!formData.species) newErrors.species = 'Species is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !canSubmit()) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const petData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || undefined,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        weight: formData.weight ? {
          value: parseFloat(formData.weight),
          unit: formData.weightUnit
        } : undefined,
        color: formData.color.trim() || undefined,
        // Omit untouched photos so unrelated edits cannot overwrite a newer server value.
        ...(photoUrl !== (pet.photoUrl || '') ? { photoUrl } : {}),
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
        chronicConditions: formData.chronicConditions 
          ? formData.chronicConditions.split(',').map(c => ({ condition: c.trim() })).filter(c => c.condition) 
          : [],
        emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone) ? {
          name: formData.emergencyContactName.trim() || undefined,
          phone: formData.emergencyContactPhone.trim() || undefined,
          email: formData.emergencyContactEmail.trim() || undefined,
          relationship: formData.emergencyContactRelationship.trim() || undefined
        } : undefined
      };

      // Update the pet via API
      const response = await fetch(`${API_BASE_URL}/pets/${pet._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData)
      });

      if (!response.ok) throw new Error('Failed to update pet');

      const updated = await response.json();
      await onSave(updated);
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating pet:', error);
      setErrors({ submit: 'Failed to update pet. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({
      name: '',
      species: 'Dog',
      breed: '',
      dateOfBirth: '',
      gender: 'male',
      weight: '',
      weightUnit: 'kg',
      color: '',
      allergies: '',
      chronicConditions: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactEmail: '',
      emergencyContactRelationship: ''
    });
    reset();
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="relative z-10 shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Edit Pet Details</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 overflow-y-auto p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Max, Luna"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Species <span className="text-red-500">*</span>
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Brown, Black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    step="0.1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                  />
                  <select
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Pet Photo</h3>
            <div className="space-y-4">
              <input
                ref={imageInput}
                id={imageInputId}
                type="file"
                accept="image/*"
                aria-label="Pet photo"
                onChange={handleImageChange}
                disabled={isSubmitting}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <PetPhoto photoUrl={photoUrl} name="Pet preview" imageClassName="w-40 h-40 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    aria-label="Remove image"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                  <button type="button" onClick={() => imageInput.current?.click()} disabled={isSubmitting}
                    className="block mt-2 text-sm text-blue-600">Change Photo</button>
                </div>
              ) : (
                <label htmlFor={imageInputId} className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Photo</span>
                </label>
              )}
              {(uploading || uploadError) && (
                <div role="status" className="text-sm text-gray-600">
                  {uploading && 'Uploading photo… '}
                  <button type="button" onClick={handleRemoveImage} disabled={isSubmitting}>
                    Remove photo
                  </button>
                </div>
              )}
              {uploadError && <p role="alert" className="text-sm text-red-500">{uploadError}</p>}
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Medical Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Chicken, Peanuts, Dust"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chronic Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  name="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Arthritis, Diabetes"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="emergencyContactEmail"
                  value={formData.emergencyContactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Family, Friend"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading || !!uploadError}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditPetModal;
