import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload } from 'lucide-react';
import { API_BASE_URL, getFileUrl } from '../config';

const emptyTypeDetails = {
  vaccination: {
    name: '',
    manufacturer: '',
    batchNumber: '',
    date: '',
    nextDueDate: ''
  },
  medication: {
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: ''
  },
  checkup: {
    reason: '',
    findings: '',
    recommendations: '',
    followUpDate: ''
  },
  surgery: {
    procedure: '',
    preOpNotes: '',
    postOpNotes: '',
    complications: '',
    recovery: ''
  },
  labResult: {
    testName: '',
    result: '',
    referenceRange: '',
    labName: '',
    collectionDate: ''
  }
};

const detailKeyByType = {
  vaccination: 'vaccination',
  medication: 'medication',
  checkup: 'checkup',
  surgery: 'surgery',
  lab_result: 'labResult'
};

const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

const buildTypeDetails = (record = {}) => ({
  vaccination: {
    ...emptyTypeDetails.vaccination,
    ...(record.vaccination || {}),
    date: formatDateInput(record.vaccination?.date),
    nextDueDate: formatDateInput(record.vaccination?.nextDueDate)
  },
  medication: {
    ...emptyTypeDetails.medication,
    ...(record.medication || {}),
    startDate: formatDateInput(record.medication?.startDate),
    endDate: formatDateInput(record.medication?.endDate)
  },
  checkup: {
    ...emptyTypeDetails.checkup,
    ...(record.checkup || {}),
    followUpDate: formatDateInput(record.checkup?.followUpDate)
  },
  surgery: {
    ...emptyTypeDetails.surgery,
    ...(record.surgery || {})
  },
  labResult: {
    ...emptyTypeDetails.labResult,
    ...(record.labResult || {}),
    collectionDate: formatDateInput(record.labResult?.collectionDate)
  }
});

const getTypeDetailPayload = (formData) => {
  const detailKey = detailKeyByType[formData.type];
  const detail = formData[detailKey];
  if (!detail) return {};

  const cleanedDetail = Object.fromEntries(
    Object.entries(detail).filter(([, value]) => value !== '')
  );

  return Object.keys(cleanedDetail).length > 0 && detailKey
    ? { [detailKey]: cleanedDetail }
    : {};
};

const AddRecordModal = ({ isOpen, onClose, onSave, petId, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'checkup',
    date: '',
    veterinarian: '',
    notes: '',
    attachments: [],
    ...emptyTypeDetails
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => {
    // Get veterinarian name from logged-in user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const vetName = user.name || '';
    
    if (initialData) {
      const recordType = initialData.recordType || initialData.type || 'checkup';
      setFormData({
        type: recordType,
        date: formatDateInput(initialData.date),
        veterinarian: initialData.veterinarian || vetName,
        notes: initialData.notes || '',
        attachments: initialData.attachments || [],
        ...buildTypeDetails(initialData)
      });
    } else {
      setFormData(prev => ({ 
        ...prev, 
        type: 'checkup',
        date: '',
        notes: '',
        attachments: [],
        ...emptyTypeDetails,
        veterinarian: vetName 
      }));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }
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
    if (uploading) {
      alert('Please wait for file uploads to finish before saving.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        pet: petId,
        type: formData.type,
        date: formData.date,
        // Don't send veterinarian - backend automatically sets it to the authenticated user
        notes: formData.notes,
        attachments: formData.attachments || [],
        ...getTypeDetailPayload(formData)
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
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update');
        }
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
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create');
        }
        const created = await res.json();
        onSave(created);
      }

      // close and reset
      onClose();
    } catch (err) {
      console.error('Save error', err);
      alert(err.message || 'Failed to save medical record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTypeFields = () => {
    if (formData.type === 'vaccination') {
      return (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Vaccine</label>
            <input type="text" value={formData.vaccination.name} onChange={(e) => handleDetailChange('vaccination', 'name', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Manufacturer</label>
            <input type="text" value={formData.vaccination.manufacturer} onChange={(e) => handleDetailChange('vaccination', 'manufacturer', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Batch Number</label>
            <input type="text" value={formData.vaccination.batchNumber} onChange={(e) => handleDetailChange('vaccination', 'batchNumber', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Administered Date</label>
            <input type="date" value={formData.vaccination.date} onChange={(e) => handleDetailChange('vaccination', 'date', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Next Due Date</label>
            <input type="date" value={formData.vaccination.nextDueDate} onChange={(e) => handleDetailChange('vaccination', 'nextDueDate', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
      );
    }

    if (formData.type === 'medication') {
      return (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-purple-100 bg-purple-50 p-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Medication</label>
            <input type="text" value={formData.medication.name} onChange={(e) => handleDetailChange('medication', 'name', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Dosage</label>
            <input type="text" value={formData.medication.dosage} onChange={(e) => handleDetailChange('medication', 'dosage', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Frequency</label>
            <input type="text" value={formData.medication.frequency} onChange={(e) => handleDetailChange('medication', 'frequency', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Start Date</label>
            <input type="date" value={formData.medication.startDate} onChange={(e) => handleDetailChange('medication', 'startDate', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">End Date</label>
            <input type="date" value={formData.medication.endDate} onChange={(e) => handleDetailChange('medication', 'endDate', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
      );
    }

    if (formData.type === 'checkup') {
      return (
        <div className="space-y-4 rounded-lg border border-green-100 bg-green-50 p-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Reason</label>
            <input type="text" value={formData.checkup.reason} onChange={(e) => handleDetailChange('checkup', 'reason', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Findings</label>
            <textarea value={formData.checkup.findings} onChange={(e) => handleDetailChange('checkup', 'findings', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Recommendations</label>
            <textarea value={formData.checkup.recommendations} onChange={(e) => handleDetailChange('checkup', 'recommendations', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Follow-up Date</label>
            <input type="date" value={formData.checkup.followUpDate} onChange={(e) => handleDetailChange('checkup', 'followUpDate', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
      );
    }

    if (formData.type === 'surgery') {
      return (
        <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Procedure</label>
            <input type="text" value={formData.surgery.procedure} onChange={(e) => handleDetailChange('surgery', 'procedure', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Pre-op Notes</label>
            <textarea value={formData.surgery.preOpNotes} onChange={(e) => handleDetailChange('surgery', 'preOpNotes', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Post-op Notes</label>
            <textarea value={formData.surgery.postOpNotes} onChange={(e) => handleDetailChange('surgery', 'postOpNotes', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Complications</label>
            <textarea value={formData.surgery.complications} onChange={(e) => handleDetailChange('surgery', 'complications', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Recovery</label>
            <textarea value={formData.surgery.recovery} onChange={(e) => handleDetailChange('surgery', 'recovery', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
      );
    }

    if (formData.type === 'lab_result') {
      return (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-yellow-100 bg-yellow-50 p-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Test Name</label>
            <input type="text" value={formData.labResult.testName} onChange={(e) => handleDetailChange('labResult', 'testName', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Lab Name</label>
            <input type="text" value={formData.labResult.labName} onChange={(e) => handleDetailChange('labResult', 'labName', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Result</label>
            <input type="text" value={formData.labResult.result} onChange={(e) => handleDetailChange('labResult', 'result', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Reference Range</label>
            <input type="text" value={formData.labResult.referenceRange} onChange={(e) => handleDetailChange('labResult', 'referenceRange', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Collection Date</label>
            <input type="date" value={formData.labResult.collectionDate} onChange={(e) => handleDetailChange('labResult', 'collectionDate', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
      );
    }

    return null;
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
                  <option value="lab_result">Lab Result</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>

            {/* Title field removed as requested */}

            {renderTypeFields()}

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Attachments <span className="font-normal text-gray-500">(optional)</span></label>
              <div className="border-2 border-dashed rounded p-3">
                <input key={fileInputKey} type="file" accept="application/pdf,image/*" multiple onChange={handleFileChange} className="hidden" id="record-files" />
                <label htmlFor="record-files" className="cursor-pointer flex items-center gap-2 text-sm text-gray-600">
                  <Upload size={18} />
                  <span>{uploading ? 'Uploading...' : 'Click to upload supporting files (PDF, images)'}</span>
                </label>
              </div>
              <div className="mt-2 space-y-1">
                {(formData.attachments || []).map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                    <div className="truncate">{att.filename || att.fileUrl}</div>
                    <div className="flex gap-2">
                      <a href={getFileUrl(att.fileUrl)} target="_blank" rel="noreferrer" className="text-blue-600">View</a>
                      <button type="button" onClick={() => handleRemoveAttachment(idx)} className="text-red-600">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded">Cancel</button>
              <button type="submit" disabled={isSubmitting || uploading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:cursor-not-allowed disabled:bg-blue-300">
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
