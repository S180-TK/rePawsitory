import React, { useState, useEffect } from 'react';

const Header = ({ userRole }) => {
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const name = user.name || 'User';
        setUserName(name);
        
        // Generate initials from name
        const nameParts = name.trim().split(' ');
        const initials = nameParts
          .map(part => part.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('');
        setUserInitials(initials || 'U');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserName('User');
        setUserInitials('U');
      }
    }
  }, []);

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome back, {userRole === 'veterinarian' || userRole === 'vet' ? `Dr. ${userName}` : userName}!
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {userInitials}
        </div>
      </div>
    </header>
  );
};

export default Header;
