import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AddRecordModal = ({ isOpen, onClose, onSave, petId, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'checkup',
    title: '',
    date: '',
    veterinarian: '',
    notes: '',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => {
    // Get veterinarian name from logged-in user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const vetName = user.name || '';
    
    if (initialData) {
      setFormData({
        type: initialData.type || 'checkup',
        title: initialData.title || '',
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0,10) : '',
        veterinarian: initialData.veterinarian || vetName,
        notes: initialData.notes || '',
        attachments: initialData.attachments || []
      });
    } else {
      setFormData(prev => ({ 
        ...prev, 
        type: 'checkup',
        veterinarian: vetName 
      }));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));

      const res = await fetch(`${API_BASE_URL}/api/upload/medical-record`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const filesMeta = data.files || [];

      setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...filesMeta] }));
      // reset input
      setFileInputKey(Date.now());
    } catch (err) {
      console.error('Upload error', err);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        pet: petId,
        type: formData.type,
        title: formData.title,
        date: formData.date,
        // Don't send veterinarian - backend automatically sets it to the authenticated user
        notes: formData.notes,
        attachments: formData.attachments || []
      };

      // If editing existing record
      if (initialData && initialData._id) {
        const res = await fetch(`${API_BASE_URL}/api/medical-records/${initialData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update');
        const updated = await res.json();
        onSave(updated);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/medical-records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create');
        const created = await res.json();
        onSave(created);
      }

      // close and reset
      onClose();
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to save medical record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{initialData ? 'Edit Record' : 'Add Medical Record'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                  <option value="checkup">Checkup</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="medication">Medication</option>
                  <option value="surgery">Surgery</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Title</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="Short title" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Attachments</label>
              <div className="border-2 border-dashed rounded p-3">
                <input key={fileInputKey} type="file" accept="application/pdf,image/*" multiple onChange={handleFileChange} className="hidden" id="record-files" />
                <label htmlFor="record-files" className="cursor-pointer flex items-center gap-2 text-sm text-gray-600">
                  <Upload size={18} />
                  <span>{uploading ? 'Uploading...' : 'Click to upload (PDF, images) — multiple allowed'}</span>
                </label>
              </div>
              <div className="mt-2 space-y-1">
                {(formData.attachments || []).map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                    <div className="truncate">{att.filename || att.fileUrl}</div>
                    <div className="flex gap-2">
                      <a href={`${API_BASE_URL}${att.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600">View</a>
                      <button type="button" onClick={() => handleRemoveAttachment(idx)} className="text-red-600">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">
                {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Record')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default AddRecordModal;
