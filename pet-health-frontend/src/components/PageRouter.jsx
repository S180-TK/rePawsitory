import React from 'react';
import DashboardPage from '../pages/DashboardPage';
import PetsPage from '../pages/PetsPage';
import PatientsPage from '../pages/PatientsPage';
import RecordsPage from '../pages/RecordsPage';
import SharingPage from '../pages/SharingPage';
import SettingsPage from '../pages/SettingsPage';

const PageRouter = ({ 
  currentPage, 
  userRole, 
  pets, 
  recentRecords, 
  petsLoading, 
  petsError, 
  addPet,
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
      return <PetsPage pets={pets} petsLoading={petsLoading} petsError={petsError} addPet={addPet} />;
    case 'patients':
      // Veterinarians see their patients
      return <PatientsPage patients={patients} patientsLoading={patientsLoading} patientsError={patientsError} />;
    case 'records':
      return <RecordsPage recentRecords={recentRecords} />;
    case 'sharing':
      return <SharingPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage userRole={userRole} pets={pets} recentRecords={recentRecords} petsLoading={petsLoading} petsError={petsError} addPet={addPet} setCurrentPage={setCurrentPage} />;
  }
};

export default PageRouter;
