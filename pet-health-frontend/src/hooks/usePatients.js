import { useAuth } from '../contexts/AuthContext';
import { useAuthenticatedList } from './useAuthenticatedList';

export const usePatients = () => {
  const { user } = useAuth();
  const list = useAuthenticatedList('/api/vet/patients', ['vet', 'veterinarian'].includes(user?.role));
  return { patients: list.items, loading: list.loading, error: list.error, refetch: list.refetch };
};
