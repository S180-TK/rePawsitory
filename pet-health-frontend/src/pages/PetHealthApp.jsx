import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import PageRouter from '../components/PageRouter';
import { useNavigation } from '../hooks/useNavigation';
import { useMockData } from '../hooks/useMockData';
import { usePets } from '../hooks/usePets';
import { usePatients } from '../hooks/usePatients';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import LandingPage from './LandingPage';

const PetHealthApp = () => {
  const navigation = useNavigation();
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'signup'
  const { recentRecords } = useMockData();
  
  // Only fetch pets and patients when authenticated
  const { pets, loading, error, addPet, refetch: refetchPets } = usePets();
  const { patients, loading: patientsLoading, error: patientsError, refetch: refetchPatients } = usePatients();

  return (
    <>
      {!navigation.isAuthenticated ? (
        authView === 'landing' ? (
          <LandingPage onLogin={() => setAuthView('login')} />
        ) : authView === 'login' ? (
          <LoginPage 
            login={(role) => {
              navigation.login(role);
              // Trigger refetch after login
              setTimeout(() => {
                if (refetchPets) refetchPets();
                if (refetchPatients) refetchPatients();
              }, 100);
            }}
            switchToSignup={() => setAuthView('signup')} 
          />
        ) : (
          <SignupPage 
            signup={(role) => {
              navigation.signup(role);
              // Trigger refetch after signup
              setTimeout(() => {
                if (refetchPets) refetchPets();
                if (refetchPatients) refetchPatients();
              }, 100);
            }}
            switchToLogin={() => setAuthView('login')} 
          />
        )
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
            refetchPets={refetchPets}
            patients={patients}
            patientsLoading={patientsLoading}
            patientsError={patientsError}
            setCurrentPage={navigation.setCurrentPage}
          />
        </Layout>
      )}
    </>
  );
};

export default PetHealthApp;