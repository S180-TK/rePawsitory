import React from 'react';
import DashboardPage from '../pages/DashboardPage';
import PetsPage from '../pages/PetsPage';
import PatientsPage from '../pages/PatientsPage';
import RecordsPage from '../pages/RecordsPage';
import SharingPage from '../pages/SharingPage';
import SettingsPage from '../pages/SettingsPage';
import AdminPage from '../pages/AdminPage';

const PageRouter = ({ 
  currentPage, 
  userRole, 
  pets, 
  recentRecords, 
  petsLoading, 
  petsError, 
  addPet,
  refetchPets,
  patients,
  patientsLoading,
  patientsError,
  setCurrentPage
}) => {
  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage userRole={userRole} pets={pets} recentRecords={recentRecords} petsLoading={petsLoading} petsError={petsError} addPet={addPet} setCurrentPage={setCurrentPage} />;
    case 'pets':
      // Pet owners see their own pets
      return <PetsPage pets={pets} petsLoading={petsLoading} petsError={petsError} addPet={addPet} refetchPets={refetchPets} />;
    case 'patients':
      // Veterinarians see their patients
      return <PatientsPage patients={patients} patientsLoading={patientsLoading} patientsError={patientsError} />;
    case 'records':
      return <RecordsPage pets={pets} />;
    case 'sharing':
      return <SharingPage />;
    case 'settings':
      return <SettingsPage />;
    case 'admin':
      return <AdminPage />;
    default:
      return <DashboardPage userRole={userRole} pets={pets} recentRecords={recentRecords} petsLoading={petsLoading} petsError={petsError} addPet={addPet} setCurrentPage={setCurrentPage} />;
  }
};

export default PageRouter;
