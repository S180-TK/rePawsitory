import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        // Don't fetch if no token or user
        if (!token || !user) {
          if (isMounted) {
            setPatients([]);
            setLoading(false);
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/vet/patients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setPatients(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setPatients([]); // Clear patients on error
          console.error('Error fetching patients:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPatients();

    return () => {
      isMounted = false;
    };
  }, [refetchTrigger]); // Re-fetch when refetchTrigger changes

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { patients, loading, error, refetch };
};
