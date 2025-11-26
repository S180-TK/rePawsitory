import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

export const usePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        // Don't fetch if no token or user
        if (!token || !user) {
          if (isMounted) {
            setPets([]);
            setLoading(false);
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/pets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setPets(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setPets([]); // Clear pets on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPets();

    return () => {
      isMounted = false;
    };
  }, [refetchTrigger]); // Re-fetch when refetchTrigger changes

  const addPet = async (petData = { name: 'New Pet', species: 'Dog', breed: 'Unknown', age: 0, photo: '🐾' }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData)
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const created = await response.json();
      setPets(prev => Array.isArray(prev) ? [...prev, created] : [created]);
      // Trigger a refetch to ensure we have the latest data
      setRefetchTrigger(prev => prev + 1);
      return created;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { pets, loading, error, addPet, refetch };
};



