import React from 'react';
import { PlusCircle, FileText } from 'lucide-react';

const RecordsPage = ({ recentRecords }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Medical Records</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          Add Record
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Pets</option>
            <option>Max</option>
            <option>Luna</option>
            <option>Charlie</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Types</option>
            <option>Vaccination</option>
            <option>Medication</option>
            <option>Checkup</option>
            <option>Surgery</option>
          </select>
        </div>

        <div className="space-y-4">
          {recentRecords.map(record => (
            <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{record.title}</h3>
                  <p className="text-sm text-gray-600">{record.petName} • {record.type}</p>
                  <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecordsPage;
