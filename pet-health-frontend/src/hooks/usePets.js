import { useEffect, useState } from 'react';

export const usePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchPets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch('http://localhost:5000/pets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched pets:', data); // Debug log
        
        if (isMounted) {
          setPets(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching pets:', err);
        if (isMounted) {
          setError(err);
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

  const addPet = async (petData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/pets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      const created = await response.json();
      console.log('Pet created:', created); // Debug log
      
      // Trigger a refetch to get updated pet list
      setRefetchTrigger(prev => prev + 1);
      
      return created;
    } catch (err) {
      console.error('Error adding pet:', err);
      setError(err);
      throw err;
    }
  };

  const refetch = () => {
    setLoading(true);
    setRefetchTrigger(prev => prev + 1);
  };

  return { pets, loading, error, addPet, refetch };
};


