import { useAuth } from '../contexts/AuthContext';
import { useAuthenticatedList } from './useAuthenticatedList';
import { API_BASE_URL } from '../config';

export const usePets = () => {
  const { user } = useAuth();
  const list = useAuthenticatedList('/pets', ['owner', 'pet_owner'].includes(user?.role));
  const addPet = async petData => {
    if (!list.token || !list.isCurrent()) throw new Error('Please log in again');
    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${list.token}` },
      body: JSON.stringify(petData)
    });
    const created = await response.json();
    if (!response.ok) {
      const error = new Error(created.error || `Request failed with status ${response.status}`);
      error.response = { data: created };
      throw error;
    }
    if (list.isCurrent()) {
      list.upsert(created);
      // Include pre-existing pets even if creation finished before the initial GET.
      list.refetch();
    }
    return created;
  };
  const updatePet = pet => { if (list.isCurrent()) list.upsert(pet); };
  return { pets: list.items, loading: list.loading, error: list.error, addPet, updatePet, refetch: list.refetch };
};
