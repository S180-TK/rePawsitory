import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminPage = () => {
  const [veterinarians, setVeterinarians] = useState([]);
  const [stats, setStats] = useState({ totalVets: 0, approvedVets: 0, pendingVets: 0, totalOwners: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchVeterinarians();
    fetchStats();
  }, []);

  const fetchVeterinarians = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/veterinarians`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVeterinarians(data);
      } else {
        throw new Error('Failed to fetch veterinarians');
      }
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      setMessage({ type: 'error', text: 'Failed to load veterinarians' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching stats from:', `${API_BASE_URL}/api/admin/stats`);
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Stats response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Stats data received:', data);
        setStats(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Stats fetch failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (vetId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/veterinarians/${vetId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Veterinarian approved successfully' });
        fetchVeterinarians();
        fetchStats();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      console.error('Error approving veterinarian:', error);
      setMessage({ type: 'error', text: 'Failed to approve veterinarian' });
    }
  };

  const handleReject = async (vetId) => {
    if (!window.confirm('Are you sure you want to reject this veterinarian?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/veterinarians/${vetId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Veterinarian rejected' });
        fetchVeterinarians();
        fetchStats();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error) {
      console.error('Error rejecting veterinarian:', error);
      setMessage({ type: 'error', text: 'Failed to reject veterinarian' });
    }
  };

  const filteredVets = veterinarians.filter(vet => {
    if (filter === 'pending') return !vet.isApproved;
    if (filter === 'approved') return vet.isApproved;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage veterinarian registrations and approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pet Owners</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOwners}</p>
              </div>
              <UserCheck className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Veterinarians</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedVets}</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Veterinarians</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingVets}</p>
              </div>
              <Clock className="text-yellow-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Veterinarians</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalVets}</p>
              </div>
              <Users className="text-blue-500" size={40} />
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-medium ${filter === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            >
              All ({veterinarians.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-3 font-medium ${filter === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-600'}`}
            >
              Pending ({stats.pendingVets})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-3 font-medium ${filter === 'approved' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-600'}`}
            >
              Approved ({stats.approvedVets})
            </button>
          </div>
        </div>

        {/* Veterinarians List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading veterinarians...</div>
          ) : filteredVets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No veterinarians found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVets.map((vet) => (
                    <tr key={vet._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{vet.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {vet.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {vet.clinic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {vet.license}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {vet.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vet.isApproved ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!vet.isApproved ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(vet._id)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(vet._id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleReject(vet._id)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <XCircle size={16} />
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
