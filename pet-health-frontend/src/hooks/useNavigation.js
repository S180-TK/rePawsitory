import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Home, Users, FileText, Share2, Settings, Heart, Search } from 'lucide-react';

export const useNavigation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const userRole = user?.role === 'pet_owner' ? 'owner' : user?.role === 'veterinarian' ? 'vet' : user?.role;
  const [currentPage, setCurrentPage] = useState(userRole === 'admin' ? 'admin' : 'dashboard');

  // Navigation items based on role
  const ownerNavItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'pets', icon: Heart, label: 'My Pets' },
    { id: 'records', icon: FileText, label: 'Medical Records' },
    { id: 'vets', icon: Search, label: 'Find Vets' },
    { id: 'sharing', icon: Share2, label: 'Share Records' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const vetNavItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'patients', icon: Users, label: 'My Patients' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const adminNavItems = [
    { id: 'admin', icon: Users, label: 'Admin Panel' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const navItems = userRole === 'owner' ? ownerNavItems : userRole === 'admin' ? adminNavItems : vetNavItems;

  return {
    sidebarOpen,
    setSidebarOpen,
    userRole,
    currentPage,
    setCurrentPage,
    navItems,
    isAuthenticated,
    logout
  };
};
