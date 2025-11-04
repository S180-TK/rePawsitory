import { useState } from 'react';
import { Home, Users, FileText, Share2, Settings, Calendar, Heart } from 'lucide-react';

export const useNavigation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'owner' or 'vet'
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Navigation items based on role
  const ownerNavItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'pets', icon: Heart, label: 'My Pets' },
    { id: 'records', icon: FileText, label: 'Medical Records' },
    { id: 'sharing', icon: Share2, label: 'Share Access' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const vetNavItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'patients', icon: Users, label: 'My Patients' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const navItems = userRole === 'owner' ? ownerNavItems : vetNavItems;

  const login = (role) => {
    if (role !== 'owner' && role !== 'vet') return;
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentPage('dashboard');
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    userRole,
    setUserRole,
    currentPage,
    setCurrentPage,
    navItems,
    isAuthenticated,
    login,
    logout
  };
};
