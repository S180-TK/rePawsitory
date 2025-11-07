import React from 'react';
import { X, Download, Calendar, FileText } from 'lucide-react';

const ViewRecordModal = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const handleDownload = (attachment) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = `http://localhost:5001${attachment.fileUrl}`;
    link.download = attachment.filename || attachment.fileUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {record.title || record.recordType}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Medical Record Details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Record Type Badge */}
          <div>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full uppercase">
              {record.recordType}
            </span>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar size={18} />
                <span className="text-sm font-semibold">Date</span>
              </div>
              <p className="text-gray-800 font-medium">{formatDate(record.date)}</p>
            </div>

            {record.veterinarian && (
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-semibold">Veterinarian</span>
                </div>
                <p className="text-gray-800 font-medium">
                  {typeof record.veterinarian === 'object' 
                    ? record.veterinarian.name 
                    : record.veterinarian}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {record.notes && (
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FileText size={18} />
                <span className="text-sm font-semibold">Notes</span>
              </div>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{record.notes}</p>
            </div>
          )}

          {/* Type-specific details */}
          {record.recordType === 'vaccination' && record.vaccination && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Vaccination Details</h3>
              <div className="space-y-2 text-sm">
                {record.vaccination.vaccineName && (
                  <p><span className="font-semibold">Vaccine:</span> {record.vaccination.vaccineName}</p>
                )}
                {record.vaccination.batchNumber && (
                  <p><span className="font-semibold">Batch Number:</span> {record.vaccination.batchNumber}</p>
                )}
                {record.vaccination.nextDueDate && (
                  <p><span className="font-semibold">Next Due:</span> {formatDate(record.vaccination.nextDueDate)}</p>
                )}
              </div>
            </div>
          )}

          {record.recordType === 'medication' && record.medication && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3">Medication Details</h3>
              <div className="space-y-2 text-sm">
                {record.medication.medicationName && (
                  <p><span className="font-semibold">Medication:</span> {record.medication.medicationName}</p>
                )}
                {record.medication.dosage && (
                  <p><span className="font-semibold">Dosage:</span> {record.medication.dosage}</p>
                )}
                {record.medication.frequency && (
                  <p><span className="font-semibold">Frequency:</span> {record.medication.frequency}</p>
                )}
                {record.medication.startDate && (
                  <p><span className="font-semibold">Start Date:</span> {formatDate(record.medication.startDate)}</p>
                )}
                {record.medication.endDate && (
                  <p><span className="font-semibold">End Date:</span> {formatDate(record.medication.endDate)}</p>
                )}
              </div>
            </div>
          )}

          {record.recordType === 'checkup' && record.checkup && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Checkup Details</h3>
              <div className="space-y-2 text-sm">
                {record.checkup.weight && (
                  <p><span className="font-semibold">Weight:</span> {record.checkup.weight}</p>
                )}
                {record.checkup.temperature && (
                  <p><span className="font-semibold">Temperature:</span> {record.checkup.temperature}</p>
                )}
                {record.checkup.heartRate && (
                  <p><span className="font-semibold">Heart Rate:</span> {record.checkup.heartRate} bpm</p>
                )}
                {record.checkup.findings && (
                  <p><span className="font-semibold">Findings:</span> {record.checkup.findings}</p>
                )}
              </div>
            </div>
          )}

          {record.recordType === 'surgery' && record.surgery && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-3">Surgery Details</h3>
              <div className="space-y-2 text-sm">
                {record.surgery.procedureName && (
                  <p><span className="font-semibold">Procedure:</span> {record.surgery.procedureName}</p>
                )}
                {record.surgery.anesthesiaUsed && (
                  <p><span className="font-semibold">Anesthesia:</span> {record.surgery.anesthesiaUsed}</p>
                )}
                {record.surgery.complications && (
                  <p><span className="font-semibold">Complications:</span> {record.surgery.complications}</p>
                )}
                {record.surgery.followUpDate && (
                  <p><span className="font-semibold">Follow-up Date:</span> {formatDate(record.surgery.followUpDate)}</p>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {record.attachments && record.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments ({record.attachments.length})
              </h3>
              <div className="space-y-2">
                {record.attachments.map((attachment, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {attachment.filename || attachment.fileUrl.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(attachment)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRecordModal;
