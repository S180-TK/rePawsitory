import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const SignupPage = ({ signup, switchToLogin }) => {
  const [role, setRole] = useState('pet_owner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Vet-specific fields
  const [clinic, setClinic] = useState('');
  const [license, setLicense] = useState('');
  const [specialization, setSpecialization] = useState('');
  
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailBlur = async () => {
    if (!email.trim()) {
      setEmailError(false);
      return;
    }

    try {
      // Check if email already exists by attempting registration check
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password: 'dummy', name: 'dummy', role: 'pet_owner' }),
      });

      const data = await response.json();

      // If error message indicates user already exists
      if (data.error && (data.error.toLowerCase().includes('already exists') || data.error.toLowerCase().includes('already registered') || data.error.toLowerCase().includes('email is already'))) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    } catch (err) {
      // On network error, don't mark as invalid
      setEmailError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError(false);
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill out all required fields.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate vet-specific fields
    if (role === 'veterinarian') {
      if (!clinic.trim() || !license.trim() || !specialization.trim()) {
        setError('Veterinarians must provide clinic, license, and specialization.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const registrationData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim() || undefined
      };

      // Add vet-specific fields if role is veterinarian
      if (role === 'veterinarian') {
        registrationData.clinic = clinic.trim();
        registrationData.license = license.trim();
        registrationData.specialization = specialization.trim();
      }

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful - redirect to login page
      // Don't store token or auto-login, just switch to login view
      switchToLogin();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create your account</h1>
        <p className="text-sm text-gray-600 mb-6">Sign up to start using rePawsitory.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false); // Clear error when user types
              }}
              onBlur={handleEmailBlur}
              className={`w-full border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors`}
              placeholder="jane@example.com"
              required
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">This email is already registered</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0912 345 678"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="pet_owner">Pet Owner</option>
              <option value="veterinarian">Veterinarian</option>
            </select>
          </div>

          {/* Vet-specific fields */}
          {role === 'veterinarian' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
                <input
                  type="text"
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Happy Paws Veterinary Clinic"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VET-2024-12345"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Small Animal Medicine"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Already have an account?{' '}
          <button onClick={switchToLogin} className="text-blue-600 hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;


