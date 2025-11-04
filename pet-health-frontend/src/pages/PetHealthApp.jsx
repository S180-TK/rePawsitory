import React from 'react';
import Layout from '../components/layout/Layout';
import PageRouter from '../components/PageRouter';
import { useNavigation } from '../hooks/useNavigation';
import { useMockData } from '../hooks/useMockData';
import { usePets } from '../hooks/usePets';
import LoginPage from './LoginPage';

const PetHealthApp = () => {
  const navigation = useNavigation();
  const { recentRecords } = useMockData();
  const { pets, loading, error, addPet } = usePets();

  return (
    <>
      {!navigation.isAuthenticated ? (
        <LoginPage login={navigation.login} />
      ) : (
        <Layout 
          sidebarOpen={navigation.sidebarOpen}
          setSidebarOpen={navigation.setSidebarOpen}
          userRole={navigation.userRole}
          navItems={navigation.navItems}
          currentPage={navigation.currentPage}
          setCurrentPage={navigation.setCurrentPage}
          logout={navigation.logout}
        >
          <PageRouter 
            currentPage={navigation.currentPage}
            userRole={navigation.userRole}
            pets={pets}
            recentRecords={recentRecords}
            petsLoading={loading}
            petsError={error}
            addPet={addPet}
          />
        </Layout>
      )}
    </>
  );
};

export default PetHealthApp;