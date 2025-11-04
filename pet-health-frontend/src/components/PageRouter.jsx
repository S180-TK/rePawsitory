import React from 'react';
import DashboardPage from '../pages/DashboardPage';
import PetsPage from '../pages/PetsPage';
import RecordsPage from '../pages/RecordsPage';
import SharingPage from '../pages/SharingPage';
import SettingsPage from '../pages/SettingsPage';

const PageRouter = ({ currentPage, userRole, pets, recentRecords, petsLoading, petsError, addPet }) => {
  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage userRole={userRole} pets={pets} recentRecords={recentRecords} petsLoading={petsLoading} petsError={petsError} />;
    case 'pets':
    case 'patients':
      return <PetsPage pets={pets} petsLoading={petsLoading} petsError={petsError} addPet={addPet} />;
    case 'records':
      return <RecordsPage recentRecords={recentRecords} />;
    case 'sharing':
      return <SharingPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage userRole={userRole} pets={pets} recentRecords={recentRecords} petsLoading={petsLoading} petsError={petsError} />;
  }
};

export default PageRouter;
