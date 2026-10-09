import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import PageRouter from '../components/PageRouter';
import { useNavigation } from '../hooks/useNavigation';
import { useMockData } from '../hooks/useMockData';
import { usePets } from '../hooks/usePets';
import { usePatients } from '../hooks/usePatients';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import LandingPage from './LandingPage';

// Remount all account-specific lists, selections and forms on session changes.
const AuthenticatedApp = () => {
  const navigation = useNavigation();
  const { recentRecords } = useMockData();
  const { pets, loading, error, addPet, refetch: refetchPets, updatePet } = usePets();
  const { patients, loading: patientsLoading, error: patientsError } = usePatients();

  return (
    <Layout {...navigation}>
      <PageRouter
        {...navigation}
        pets={pets}
        recentRecords={recentRecords}
        petsLoading={loading}
        petsError={error}
        addPet={addPet}
        refetchPets={refetchPets}
        updatePet={updatePet}
        patients={patients}
        patientsLoading={patientsLoading}
        patientsError={patientsError}
      />
    </Layout>
  );
};

const PetHealthApp = () => {
  const { isAuthenticated, isLoading, sessionId, login } = useAuth();
  const [authView, setAuthView] = useState('landing');
  if (isLoading) return null;
  if (isAuthenticated) return <AuthenticatedApp key={sessionId} />;
  if (authView === 'landing') return <LandingPage onLogin={() => setAuthView('login')} />;
  if (authView === 'signup') return <SignupPage switchToLogin={() => setAuthView('login')} />;
  return <LoginPage login={login} switchToSignup={() => setAuthView('signup')} />;
};

export default PetHealthApp;
